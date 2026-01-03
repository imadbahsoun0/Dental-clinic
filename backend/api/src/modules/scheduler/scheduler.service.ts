import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EntityManager } from '@mikro-orm/core';
import { Appointment, Organization, Message } from '../../common/entities';
import { AppointmentStatus } from '../../common/entities/appointment.entity';
import { MessageType, MessageStatus } from '../../common/entities/message.entity';
import { ReminderService } from '../reminders/reminder.service';
import { NotificationSettingsService } from '../notification-settings/notification-settings.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly reminderService: ReminderService,
    private readonly notificationSettingsService: NotificationSettingsService,
  ) {}

  /**
   * Run every hour to check for upcoming appointments that need reminders
   * Cron format: minute hour day month weekday
   * 0 * * * * = At minute 0 of every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async sendAppointmentReminders() {
    this.logger.log('Running appointment reminder check...');

    try {
      // Get all active organizations
      const organizations = await this.em.find(Organization, { isActive: true });

      for (const org of organizations) {
        await this.processOrganizationReminders(org.id);
      }

      this.logger.log('Appointment reminder check completed');
    } catch (error) {
      this.logger.error('Error in appointment reminder cron job:', error);
    }
  }

  /**
   * Process reminders for a specific organization
   */
  private async processOrganizationReminders(orgId: string) {
    try {
      // Get organization's notification settings
      const settings = await this.notificationSettingsService.getOrCreateSettings(orgId);

      const now = new Date();

      // Process each reminder timing configured for the organization
      for (const reminder of settings.appointmentReminders) {
        if (!reminder.enabled) continue;

        // Calculate the target datetime for this reminder
        const targetTime = new Date(now.getTime() + reminder.timingInHours * 60 * 60 * 1000);

        // Find appointments that should receive this reminder
        // We look for appointments within a 1-hour window from the target time
        const windowStart = new Date(targetTime.getTime() - 30 * 60 * 1000); // 30 min before
        const windowEnd = new Date(targetTime.getTime() + 30 * 60 * 1000); // 30 min after

        // Get the date range (we need to query a wider date range and filter by datetime later)
        const startDate = new Date(windowStart);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(windowEnd);
        endDate.setHours(23, 59, 59, 999);

        const appointments = await this.em.find(
          Appointment,
          {
            orgId,
            deletedAt: null,
            status: { $in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
            date: { $gte: startDate, $lte: endDate },
          },
          { populate: ['patient', 'doctor'] },
        );

        // Filter appointments using JavaScript to check the full datetime (date + time)
        const appointmentsToRemind = appointments.filter(appt => {
          try {
            // Combine date and time to get the full appointment datetime
            // Important: Don't use 'Z' suffix to avoid UTC interpretation
            const dateStr = appt.date.toISOString().split('T')[0];
            const [hours, minutes] = appt.time.split(':');
            const appointmentDateTime = new Date(appt.date);
            appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            
            // Check if appointment is within the reminder window
            return appointmentDateTime >= windowStart && appointmentDateTime <= windowEnd;
          } catch (error) {
            this.logger.error(`Error parsing appointment datetime for ${appt.id}:`, error);
            return false;
          }
        });

        // Send reminders
        for (const appointment of appointmentsToRemind) {
          try {
            // Check if we already sent a reminder for this timing
            const alreadySent = await this.wasReminderSent(
              appointment.id,
              reminder.timingInHours,
            );

            if (!alreadySent) {
              await this.reminderService.sendAppointmentReminder(appointment.id, orgId, reminder.timingInHours);
              this.logger.log(
                `Sent ${reminder.timingInHours}h reminder for appointment ${appointment.id}`,
              );
            }
          } catch (error) {
            this.logger.error(
              `Failed to send reminder for appointment ${appointment.id}:`,
              error,
            );
          }
        }
      }
    } catch (error) {
      this.logger.error(`Error processing reminders for org ${orgId}:`, error);
    }
  }

  /**
   * Check if a reminder was already sent for this appointment at this timing
   * This prevents duplicate reminders
   */
  private async wasReminderSent(appointmentId: string, timingInHours: number): Promise<boolean> {
    // Check if a reminder was sent for this specific timing in the last 2 hours
    // This gives some buffer to avoid duplicates while handling cron running multiple times
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    
    const messages = await this.em.find(Message, {
      metadata: { 
        $contains: { 
          appointmentId,
          timingInHours 
        } 
      },
      type: MessageType.APPOINTMENT_REMINDER,
      status: { $in: [MessageStatus.SENT, MessageStatus.PENDING] },
      createdAt: { $gte: twoHoursAgo },
    });

    return messages.length > 0;
  }
}

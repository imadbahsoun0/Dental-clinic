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

        const appointments = await this.em.find(
          Appointment,
          {
            orgId,
            deletedAt: null,
            status: { $in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
            date: { $gte: windowStart, $lte: windowEnd },
          },
          { populate: ['patient', 'doctor'] },
        );

        // Filter appointments using JavaScript (since complex date+time query might not work in all cases)
        const appointmentsToRemind = appointments.filter(appt => {
          const appointmentDateTime = new Date(`${appt.date.toISOString().split('T')[0]}T${appt.time}`);
          return appointmentDateTime >= windowStart && appointmentDateTime <= windowEnd;
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
              await this.reminderService.sendAppointmentReminder(appointment.id, orgId);
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
    const messages = await this.em.find(Message, {
      metadata: { $contains: { appointmentId } },
      type: MessageType.APPOINTMENT_REMINDER,
      status: { $in: [MessageStatus.SENT, MessageStatus.PENDING] },
    });

    // Check if any message was sent within the last hour
    // This is a simple check - you might want to store timing metadata for more precise checking
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return messages.some(msg => msg.createdAt > oneHourAgo);
  }
}

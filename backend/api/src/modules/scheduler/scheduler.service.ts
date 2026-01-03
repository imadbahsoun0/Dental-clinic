import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EntityManager } from '@mikro-orm/postgresql';
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
  
  @Cron(CronExpression.EVERY_5_MINUTES)
  async sendAppointmentReminders() {

    this.logger.log('Running appointment reminder check...');
    
    try {
      // Get all active organizations
      const organizations = await this.em.find(Organization, { isActive: true });

      for (const org of organizations) {
        await this.processOrganizationReminders(org);
      }

      this.logger.log('Appointment reminder check completed');
    } catch (error) {
      this.logger.error('Error in appointment reminder cron job:', error);
    }
}

  /**
   * Process reminders for a specific organization
   */
  private async processOrganizationReminders(org: Organization) {
    try {
      const orgId = org.id;

      // Get organization's notification settings
      const settings = await this.notificationSettingsService.getOrCreateSettings(orgId);

      const now = new Date();

      // Process each reminder timing configured for the organization
      for (const reminder of settings.appointmentReminders) {
        if (!reminder.enabled) continue;

        // Calculate the target datetime for this reminder
        const targetTime = new Date(now.getTime() + reminder.timingInHours * 60 * 60 * 1000);
        console.log('Target time for', reminder.timingInHours, 'h reminder:', targetTime);
        // Find appointments that should receive this reminder
        // We look for appointments within a 1-hour window from the target time
        const windowStart = new Date(targetTime.getTime() - 5 * 60 * 1000); // 5 min before
        const windowEnd = new Date(targetTime.getTime() + 5 * 60 * 1000); // 5 min after

        // Query appointments directly by datetime range using raw SQL
        // This is much more efficient than loading all appointments and filtering in JavaScript
        // NOTE: appointments store `date` + `time` without timezone.
        // We must interpret that local datetime in the clinic timezone, then compare in UTC.
        const clinicTimeZone = this.normalizeTimeZone(org.timeZone);
        const windowStartTs = windowStart.toISOString();
        const windowEndTs = windowEnd.toISOString();

        const qb = this.em.createQueryBuilder(Appointment, 'a');
        const appointmentsToRemind = await qb
          .select('*')
          .where({
            orgId,
            deletedAt: null,
            status: { $in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
          })
          .andWhere(`((a.date + a.time) AT TIME ZONE ?) >= ?::timestamptz`, [clinicTimeZone, windowStartTs])
          .andWhere(`((a.date + a.time) AT TIME ZONE ?) <= ?::timestamptz`, [clinicTimeZone, windowEndTs])
          .leftJoinAndSelect('a.patient', 'patient')
          .leftJoinAndSelect('a.doctor', 'doctor')
          .getResultList();

        console.log('windowStartTs:', windowStartTs);
        console.log('windowEndTs:', windowEndTs);
        console.log(
          `Found ${appointmentsToRemind.length} appointments to remind for ${reminder.timingInHours}h timing in org ${orgId}`,
        );  

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
      this.logger.error(`Error processing reminders for org ${org.id}:`, error);
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

  private normalizeTimeZone(value: string | null | undefined): string {
    const tz = value?.trim();
    if (!tz) return 'UTC';
    if (tz === 'UTC') return tz;
    if (!/^[A-Za-z_]+(?:\/[A-Za-z_]+)+$/.test(tz)) return 'UTC';
    return tz;
  }
}

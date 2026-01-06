import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { NotificationSettings } from '../../common/entities/notification-settings.entity';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';

@Injectable()
export class NotificationSettingsService {
  constructor(private readonly em: EntityManager) {}

  async getOrCreateSettings(orgId: string): Promise<NotificationSettings> {
    let settings = await this.em.findOne(NotificationSettings, { orgId });

    if (!settings) {
      // Create default settings
      settings = this.em.create(NotificationSettings, {
        orgId,
        appointmentReminders: [
          { enabled: true, timingInHours: 24 },
          { enabled: true, timingInHours: 1 },
        ],
        messageTemplates: {
          medical_history:
            'Hello {{patientName}}, please fill out your medical history form: {{medicalHistoryLink}}',
          payment_receipt:
            'Hello {{patientName}}, thank you for your payment of {{amount}}. Your remaining balance is {{remainingBalance}}.',
          appointment_reminder:
            'Hello {{patientName}}, this is a reminder for your appointment on {{appointmentDate}} at {{appointmentTime}} with Dr. {{doctorName}} at {{clinicLocation}}.',
          follow_up:
            'Hello {{patientName}}, this is a reminder for your follow-up appointment. Reason: {{followUpReason}}. Please contact us at {{clinicLocation}}.',
          payment_overdue:
            'Hello {{patientName}}, you have an outstanding balance of {{amountDue}} for completed treatments. Please contact us at {{clinicLocation}} to arrange payment.',
        },
        notificationToggles: {
          medical_history: true,
          payment_receipt: true,
          follow_up: true,
          payment_overdue: true,
        },
      } as NotificationSettings);

      await this.em.persistAndFlush(settings);
    }

    // Ensure notificationToggles exists for existing settings (backward compatibility)
    if (!settings.notificationToggles) {
      settings.notificationToggles = {
        medical_history: true,
        payment_receipt: true,
        follow_up: true,
        payment_overdue: true,
      };
      await this.em.flush();
    }

    return settings;
  }

  async update(orgId: string, updateDto: UpdateNotificationSettingsDto) {
    const settings = await this.getOrCreateSettings(orgId);

    this.em.assign(settings, updateDto);
    await this.em.flush();

    return settings;
  }
}

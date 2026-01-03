import { Entity, Property, Unique } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';

export interface AppointmentReminder {
  enabled: boolean;
  timingInHours: number;
}

export interface MessageTemplates {
  medical_history: string;
  payment_receipt: string;
  appointment_reminder: string;
  follow_up: string;
  payment_overdue: string;
}

@Entity({ tableName: 'notification_settings' })
@Unique({ properties: ['orgId'] })
export class NotificationSettings extends BaseEntity {
  @Property({ type: 'jsonb' })
  appointmentReminders!: AppointmentReminder[];

  @Property({ type: 'jsonb' })
  messageTemplates!: MessageTemplates;
}

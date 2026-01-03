import { Entity, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Patient } from './patient.entity';

export enum MessageType {
  MEDICAL_HISTORY = 'medical_history',
  PAYMENT_RECEIPT = 'payment_receipt',
  APPOINTMENT_REMINDER = 'appointment_reminder',
  FOLLOW_UP = 'follow_up',
  PAYMENT_OVERDUE = 'payment_overdue',
}

export enum MessageStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
}

@Entity({ tableName: 'messages' })
export class Message extends BaseEntity {
  @ManyToOne(() => Patient, { fieldName: 'patient_id' })
  patient!: Patient;

  @Enum(() => MessageType)
  type!: MessageType;

  @Property({ type: 'text' })
  content!: string;

  @Enum(() => MessageStatus)
  status: MessageStatus = MessageStatus.PENDING;

  @Property({ type: 'timestamp', nullable: true })
  sentAt?: Date;

  @Property({ type: 'text', nullable: true })
  error?: string;

  @Property({ type: 'jsonb', nullable: true })
  metadata?: {
    paymentId?: string;
    appointmentId?: string;
    treatmentId?: string;
    amount?: number;
    remainingBalance?: number;
    appointmentDate?: string;
    appointmentTime?: string;
    doctorName?: string;
    [key: string]: unknown;
  };
}

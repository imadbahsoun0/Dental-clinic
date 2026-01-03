import { Entity, Property, ManyToOne, Enum, Index } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Patient } from './patient.entity';

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  TRANSFER = 'transfer',
  CHECK = 'check',
  OTHER = 'other',
}

@Entity({ tableName: 'payments' })
@Index({ properties: ['orgId'] })
@Index({ properties: ['patient', 'orgId'] })
@Index({ properties: ['date', 'orgId'] })
export class Payment extends BaseEntity {
  @ManyToOne(() => Patient)
  patient!: Patient;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Property({ type: 'date' })
  date!: Date;

  @Enum(() => PaymentMethod)
  paymentMethod!: PaymentMethod;

  @Property({ type: 'text', nullable: true })
  notes?: string;
}

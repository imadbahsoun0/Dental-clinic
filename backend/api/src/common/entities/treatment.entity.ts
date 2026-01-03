import {
  Entity,
  Property,
  ManyToOne,
  Enum,
  Index,
  ManyToMany,
  Collection,
} from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Patient } from './patient.entity';
import { TreatmentType } from './treatment-type.entity';
import { Appointment } from './appointment.entity';
import { Tooth } from './tooth.entity';

export enum TreatmentStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity({ tableName: 'treatments' })
@Index({ properties: ['orgId'] })
@Index({ properties: ['patient', 'orgId'] })
@Index({ properties: ['status', 'orgId'] })
export class Treatment extends BaseEntity {
  @ManyToOne(() => Patient)
  patient!: Patient;

  @ManyToMany(() => Tooth)
  teeth = new Collection<Tooth>(this);

  @ManyToOne(() => TreatmentType)
  treatmentType!: TreatmentType;

  @ManyToOne(() => Appointment, { nullable: true })
  appointment?: Appointment;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice!: number;

  @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number = 0;

  @Enum(() => TreatmentStatus)
  status: TreatmentStatus = TreatmentStatus.PLANNED;

  @Property({ type: 'text', nullable: true })
  notes?: string;
}

import { Entity, Property, ManyToOne, Enum, Index } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Patient } from './patient.entity';
import { TreatmentType } from './treatment-type.entity';
import { User } from './user.entity';

export enum AppointmentStatus {
    CONFIRMED = 'confirmed',
    PENDING = 'pending',
    CANCELLED = 'cancelled',
}

@Entity({ tableName: 'appointments' })
@Index({ properties: ['orgId'] })
@Index({ properties: ['date', 'orgId'] })
@Index({ properties: ['patient', 'orgId'] })
export class Appointment extends BaseEntity {
    @ManyToOne(() => Patient)
    patient!: Patient;

    @ManyToOne(() => TreatmentType)
    treatmentType!: TreatmentType;

    @Property({ type: 'date' })
    date!: Date;

    @Property({ type: 'time' })
    time!: string; // HH:mm format

    @Enum(() => AppointmentStatus)
    status: AppointmentStatus = AppointmentStatus.PENDING;

    @ManyToOne(() => User, { nullable: true })
    doctor?: User;

    @Property({ type: 'text', nullable: true })
    notes?: string;
}

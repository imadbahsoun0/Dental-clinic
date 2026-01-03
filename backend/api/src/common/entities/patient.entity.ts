import {
  Entity,
  Property,
  Index,
  ManyToMany,
  Collection,
  Enum,
} from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Attachment } from './attachment.entity';

export enum FollowUpStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity({ tableName: 'patients' })
@Index({ properties: ['orgId'] })
@Index({ properties: ['mobileNumber', 'orgId'] })
@Index({ properties: ['email', 'orgId'] })
export class Patient extends BaseEntity {
  @Property({ length: 255 })
  firstName!: string;

  @Property({ length: 255 })
  lastName!: string;

  @Property({ length: 50 })
  mobileNumber!: string;

  @Property({ length: 255, nullable: true })
  email?: string;

  @Property({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Property({ type: 'text', nullable: true })
  address?: string;

  @Property({ length: 50, nullable: true })
  emergencyContact?: string;

  @Property({ length: 10, nullable: true })
  bloodType?: string; // A+, A-, B+, B-, AB+, AB-, O+, O-

  @Property({ type: 'jsonb', nullable: true })
  medicalHistory?: Record<string, unknown>; // JSON object for medical history

  @Property({ type: 'date', nullable: true })
  followUpDate?: Date;

  @Property({ type: 'text', nullable: true })
  followUpReason?: string;

  @Enum(() => FollowUpStatus)
  followUpStatus: FollowUpStatus = FollowUpStatus.PENDING;

  @ManyToMany(() => Attachment)
  documents = new Collection<Attachment>(this);
}

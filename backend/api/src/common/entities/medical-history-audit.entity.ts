import { Entity, Property, ManyToOne, Index } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Patient } from './patient.entity';
import { User } from './user.entity';

@Entity({ tableName: 'medical_history_audits' })
@Index({ properties: ['patient', 'orgId'] })
@Index({ properties: ['editedBy', 'orgId'] })
@Index({ properties: ['createdAt', 'orgId'] })
export class MedicalHistoryAudit extends BaseEntity {
  @ManyToOne(() => Patient)
  patient!: Patient;

  @ManyToOne(() => User)
  editedBy!: User;

  @Property({ type: 'jsonb' })
  previousData!: Record<string, unknown>;

  @Property({ type: 'jsonb' })
  newData!: Record<string, unknown>;

  @Property({ type: 'jsonb' })
  changes!: Record<string, { old: unknown; new: unknown }>;

  @Property({ type: 'text', nullable: true })
  notes?: string;
}

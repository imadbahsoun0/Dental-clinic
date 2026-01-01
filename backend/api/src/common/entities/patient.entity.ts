import { Entity, Property, Index, ManyToMany, Collection } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Attachment } from './attachment.entity';

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
    medicalHistory?: any; // JSON object for medical history

    @Property({ default: true })
    enablePaymentReminders: boolean = true;

    @ManyToMany(() => Attachment)
    documents = new Collection<Attachment>(this);
}

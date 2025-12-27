import { Entity, Property, ManyToOne, Index, OneToOne, Enum } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Attachment } from './attachment.entity';

export enum ExpenseType {
    LAB = 'lab',
    EQUIPMENT = 'equipment',
    UTILITIES = 'utilities',
    RENT = 'rent',
    SALARY = 'salary',
    DOCTOR_PAYMENT = 'doctor_payment',
    OTHER = 'other',
}

@Entity({ tableName: 'expenses' })
@Index({ properties: ['orgId'] })
@Index({ properties: ['date', 'orgId'] })
@Index({ properties: ['doctor', 'orgId'] })
export class Expense extends BaseEntity {
    @Property({ length: 255 })
    name!: string;

    @Property({ type: 'decimal', precision: 10, scale: 2 })
    amount!: number;

    @Property({ type: 'date' })
    date!: Date;

    @OneToOne(() => Attachment, { nullable: true })
    invoice?: Attachment;

    @Property({ type: 'text', nullable: true })
    notes?: string;

    @ManyToOne(() => User, { nullable: true })
    doctor?: User;

    @Enum(() => ExpenseType)
    expenseType: ExpenseType = ExpenseType.OTHER;
}

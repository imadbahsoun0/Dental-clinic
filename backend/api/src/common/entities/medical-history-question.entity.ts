import { Entity, Property, Enum, Index } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';

export enum QuestionType {
    TEXT = 'text',
    RADIO = 'radio',
    CHECKBOX = 'checkbox',
    TEXTAREA = 'textarea',
}

@Entity({ tableName: 'medical_history_questions' })
@Index({ properties: ['orgId'] })
export class MedicalHistoryQuestion extends BaseEntity {
    @Property({ type: 'text' })
    question!: string;

    @Enum(() => QuestionType)
    type!: QuestionType;

    @Property({ type: 'jsonb', nullable: true })
    options?: string[]; // for radio/checkbox

    @Property({ default: false })
    required: boolean = false;

    @Property({ type: 'integer' })
    order!: number;
}

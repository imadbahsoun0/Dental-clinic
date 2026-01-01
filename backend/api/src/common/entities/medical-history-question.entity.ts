import { Entity, Property, Enum, Index } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';

export enum QuestionType {
    TEXT = 'text',
    RADIO = 'radio',
    CHECKBOX = 'checkbox',
    TEXTAREA = 'textarea',
    RADIO_WITH_TEXT = 'radio_with_text', // Radio button with conditional text input
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

    @Property({ type: 'text', nullable: true })
    textTriggerOption?: string; // For radio_with_text: which option triggers text input (e.g., "Other")

    @Property({ type: 'text', nullable: true })
    textFieldLabel?: string; // Label for the conditional text field (e.g., "Please specify")

    @Property({ default: false })
    required: boolean = false;

    @Property({ type: 'integer' })
    order!: number;
}

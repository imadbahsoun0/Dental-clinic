import { ApiProperty } from '@nestjs/swagger';
import { QuestionType } from '../../../common/entities/medical-history-question.entity';

export class MedicalHistoryQuestionResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    question!: string;

    @ApiProperty({ enum: QuestionType })
    type!: QuestionType;

    @ApiProperty({ required: false })
    options?: string[];

    @ApiProperty({ required: false })
    textTriggerOption?: string;

    @ApiProperty({ required: false })
    textFieldLabel?: string;

    @ApiProperty()
    required!: boolean;

    @ApiProperty()
    order!: number;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}

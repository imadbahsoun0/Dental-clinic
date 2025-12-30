import { IsString, IsEnum, IsBoolean, IsInt, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QuestionType } from '../../../common/entities/medical-history-question.entity';

export class CreateMedicalHistoryQuestionDto {
    @ApiProperty({ example: 'Do you have any allergies?' })
    @IsString()
    question!: string;

    @ApiProperty({ enum: QuestionType, example: QuestionType.TEXT })
    @IsEnum(QuestionType)
    type!: QuestionType;

    @ApiProperty({ example: ['Yes', 'No'], required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    options?: string[];

    @ApiProperty({ example: true })
    @IsBoolean()
    required!: boolean;

    @ApiProperty({ example: 1 })
    @IsInt()
    order!: number;
}

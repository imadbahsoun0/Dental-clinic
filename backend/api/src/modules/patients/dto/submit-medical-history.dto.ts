import {
  IsString,
  IsDateString,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class MedicalHistoryAnswerDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  @IsNotEmpty()
  questionId!: string;

  @ApiProperty({
    example: 'Yes',
    description:
      'Answer can be string or array of strings for checkbox questions',
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
  })
  @IsOptional()
  answer!: string | string[];

  @ApiProperty({
    example: 'Penicillin allergy',
    description: 'Additional text input for radio_with_text questions',
    required: false,
  })
  @IsString()
  @IsOptional()
  answerText?: string;
}

export class SubmitMedicalHistoryDto {
  @ApiProperty({ example: '1990-01-15' })
  @IsDateString()
  dateOfBirth!: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @IsNotEmpty()
  emergencyContact!: string;

  @ApiProperty({ example: 'patient@example.com', required: false })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'A+' })
  @IsString()
  @IsNotEmpty()
  bloodType!: string;

  @ApiProperty({ example: '123 Main St, City, Country' })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiProperty({
    type: [MedicalHistoryAnswerDto],
    description: 'Array of question answers',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicalHistoryAnswerDto)
  responses!: MedicalHistoryAnswerDto[];

  @ApiProperty({
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...',
    description: 'Base64 encoded signature image',
  })
  @IsString()
  @IsNotEmpty()
  signature!: string;
}

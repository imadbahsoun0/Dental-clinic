import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class MedicalHistoryResponse {
  @ApiProperty({ example: 'uuid-question-id' })
  @IsString()
  @IsNotEmpty()
  questionId!: string;

  @ApiProperty({ example: 'Do you have any allergies?' })
  @IsString()
  @IsNotEmpty()
  questionText!: string;

  @ApiProperty({ example: 'TEXT' })
  @IsString()
  @IsNotEmpty()
  questionType!: string;

  @ApiProperty({ example: 'Penicillin' })
  answer!: unknown;

  @ApiPropertyOptional({ example: 'Penicillin and other antibiotics' })
  @IsOptional()
  @IsString()
  answerText?: string;
}

export class UpdatePatientMedicalHistoryDto {
  @ApiPropertyOptional({ example: '1990-01-01' })
  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: '+212600000000' })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiPropertyOptional({ example: 'patient@example.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: 'A+' })
  @IsOptional()
  @IsString()
  bloodType?: string;

  @ApiPropertyOptional({ example: '123 Main St, City' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ type: [MedicalHistoryResponse] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicalHistoryResponse)
  responses!: MedicalHistoryResponse[];

  @ApiPropertyOptional({
    example: 'Updated by secretary - patient called with new information',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

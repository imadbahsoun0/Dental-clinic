import { ApiProperty } from '@nestjs/swagger';

class MedicalHistoryAnswerResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  questionId!: string;

  @ApiProperty({ example: 'Do you have any allergies?' })
  questionText!: string;

  @ApiProperty({
    example: 'TEXT',
    enum: ['TEXT', 'YES_NO', 'CHECKBOX', 'RADIO', 'RADIO_WITH_TEXT'],
  })
  questionType!: string;

  @ApiProperty({
    oneOf: [
      { type: 'string', example: 'Yes' },
      {
        type: 'array',
        items: { type: 'string' },
        example: ['Option 1', 'Option 2'],
      },
    ],
  })
  answer!: string | string[];

  @ApiProperty({ example: 'Penicillin allergy', required: false })
  answerText?: string;
}

export class MedicalHistorySubmissionResponseDto {
  @ApiProperty({ example: '1990-01-15' })
  dateOfBirth!: string;

  @ApiProperty({ example: '+1234567890' })
  emergencyContact!: string;

  @ApiProperty({ example: 'patient@example.com', required: false })
  email?: string;

  @ApiProperty({ example: 'A+' })
  bloodType!: string;

  @ApiProperty({ example: '123 Main St, City, Country' })
  address!: string;

  @ApiProperty({ type: [MedicalHistoryAnswerResponseDto] })
  responses!: MedicalHistoryAnswerResponseDto[];

  @ApiProperty({ example: 'data:image/png;base64,...' })
  signature!: string;

  @ApiProperty()
  submittedAt!: Date;
}

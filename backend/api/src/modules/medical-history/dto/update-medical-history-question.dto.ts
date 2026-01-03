import { PartialType } from '@nestjs/swagger';
import { CreateMedicalHistoryQuestionDto } from './create-medical-history-question.dto';

export class UpdateMedicalHistoryQuestionDto extends PartialType(
  CreateMedicalHistoryQuestionDto,
) {}

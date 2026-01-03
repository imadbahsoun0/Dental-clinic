import { PartialType } from '@nestjs/swagger';
import { CreateTreatmentTypeDto } from './create-treatment-type.dto';

export class UpdateTreatmentTypeDto extends PartialType(
  CreateTreatmentTypeDto,
) {}

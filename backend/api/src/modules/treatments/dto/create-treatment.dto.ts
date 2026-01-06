import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  Min,
} from 'class-validator';
import { TreatmentStatus } from '../../../common/entities/treatment.entity';

export class CreateTreatmentDto {
  @ApiProperty({ description: 'Patient ID' })
  @IsNotEmpty()
  @IsString()
  patientId!: string;

  @ApiProperty({ description: 'Treatment type ID' })
  @IsNotEmpty()
  @IsString()
  treatmentTypeId!: string;

  @ApiProperty({ description: 'Array of tooth numbers', type: [Number] })
  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  toothNumbers!: number[];

  @ApiProperty({ description: 'Total price', example: 100.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  totalPrice!: number;

  @ApiProperty({ description: 'Discount amount', example: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  discount?: number;

  @ApiProperty({
    description: 'Treatment status',
    enum: TreatmentStatus,
    default: TreatmentStatus.PLANNED,
  })
  @IsOptional()
  @IsEnum(TreatmentStatus)
  status?: TreatmentStatus;

  @ApiPropertyOptional({
    description: 'Appointment ID (required for non-planned treatments)',
  })
  @IsOptional()
  @IsString()
  appointmentId?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

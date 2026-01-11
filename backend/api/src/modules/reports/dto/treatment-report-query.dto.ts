import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class TreatmentReportQueryDto {
  @ApiPropertyOptional({
    description: 'Start date (ISO). Defaults to last 30 days.',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date (ISO). Defaults to today.',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

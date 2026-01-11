import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional } from 'class-validator';

export type IncomeGroupBy = 'day' | 'month';

export class IncomeReportQueryDto {
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

  @ApiPropertyOptional({
    description: "Group by period. 'day' (default) or 'month'",
    enum: ['day', 'month'],
  })
  @IsOptional()
  @IsIn(['day', 'month'])
  groupBy?: IncomeGroupBy;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';
import type { IncomeGroupBy } from './income-report-query.dto';

export class IncomePeriodDetailsQueryDto {
  @ApiProperty({
    description:
      "Period key from income report series. For 'day': YYYY-MM-DD. For 'month': YYYY-MM.",
    examples: ['2026-01-17', '2026-01'],
  })
  @IsString()
  period!: string;

  @ApiProperty({ enum: ['day', 'month'] })
  @IsIn(['day', 'month'])
  groupBy!: IncomeGroupBy;
}

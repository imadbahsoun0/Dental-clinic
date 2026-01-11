import { ApiProperty } from '@nestjs/swagger';

export class IncomeReportTotalsDto {
  @ApiProperty()
  paymentsTotal!: number;

  @ApiProperty()
  expensesTotal!: number;

  @ApiProperty()
  netIncome!: number;

  @ApiProperty()
  paymentsCount!: number;

  @ApiProperty()
  expensesCount!: number;
}

export class IncomeReportPointDto {
  @ApiProperty({ description: 'UTC period key (YYYY-MM-DD for day, YYYY-MM for month)' })
  period!: string;

  @ApiProperty()
  paymentsTotal!: number;

  @ApiProperty()
  expensesTotal!: number;

  @ApiProperty()
  netIncome!: number;

  @ApiProperty()
  paymentsCount!: number;

  @ApiProperty()
  expensesCount!: number;
}

export class IncomeReportDto {
  @ApiProperty({ enum: ['day', 'month'] })
  groupBy!: 'day' | 'month';

  @ApiProperty({ description: 'UTC start ISO used for the report' })
  startDate!: string;

  @ApiProperty({ description: 'UTC end ISO used for the report' })
  endDate!: string;

  @ApiProperty({ description: 'How net income is computed' })
  formula!: string;

  @ApiProperty({ type: IncomeReportTotalsDto })
  totals!: IncomeReportTotalsDto;

  @ApiProperty({ type: [IncomeReportPointDto] })
  series!: IncomeReportPointDto[];
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExpenseType } from '../../../common/entities/expense.entity';
import { PaymentMethod } from '../../../common/entities/payment.entity';
import type { IncomeGroupBy } from './income-report-query.dto';

export class IncomePeriodPatientDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;
}

export class IncomePeriodDoctorDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
}

export class IncomePeriodPaymentDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  patientId!: string;

  @ApiPropertyOptional()
  @ApiPropertyOptional({ type: IncomePeriodPatientDto })
  patient?: IncomePeriodPatientDto;

  @ApiProperty()
  amount!: number;

  @ApiProperty({ description: 'ISO date (UTC) for the payment record' })
  date!: string;

  @ApiProperty({ enum: PaymentMethod })
  paymentMethod!: PaymentMethod;

  @ApiPropertyOptional()
  notes?: string;
}

export class IncomePeriodExpenseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: ExpenseType })
  expenseType!: ExpenseType;

  @ApiProperty()
  amount!: number;

  @ApiProperty({ description: 'ISO date (UTC) for the expense record' })
  date!: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional()
  @ApiPropertyOptional({ type: IncomePeriodDoctorDto })
  doctor?: IncomePeriodDoctorDto;
}

export class IncomePeriodDetailsTotalsDto {
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

export class IncomePeriodDetailsDto {
  @ApiProperty({ enum: ['day', 'month'] })
  groupBy!: IncomeGroupBy;

  @ApiProperty({ description: 'Period key (YYYY-MM-DD for day, YYYY-MM for month)' })
  period!: string;

  @ApiProperty({ description: 'UTC start ISO used for the details range' })
  startDate!: string;

  @ApiProperty({ description: 'UTC end ISO used for the details range' })
  endDate!: string;

  @ApiProperty({ type: IncomePeriodDetailsTotalsDto })
  totals!: IncomePeriodDetailsTotalsDto;

  @ApiProperty({ type: [IncomePeriodPaymentDto] })
  payments!: IncomePeriodPaymentDto[];

  @ApiProperty({ type: [IncomePeriodExpenseDto] })
  expenses!: IncomePeriodExpenseDto[];
}

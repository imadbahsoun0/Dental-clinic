import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsUUID,
  IsEnum,
  Min,
} from 'class-validator';
import { ExpenseType } from '../../../common/entities/expense.entity';

export class UpdateExpenseDto {
  @ApiPropertyOptional({
    example: 'Lab Equipment',
    description: 'Expense name',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 500.0, description: 'Expense amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({ example: '2024-01-15', description: 'Expense date' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    example: 'uuid',
    description: 'Invoice attachment ID',
  })
  @IsOptional()
  @IsUUID()
  invoiceId?: string;

  @ApiPropertyOptional({
    example: 'Payment for lab work',
    description: 'Additional notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: 'uuid',
    description: 'Doctor ID for doctor-related expenses',
  })
  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @ApiPropertyOptional({
    enum: ExpenseType,
    example: ExpenseType.LAB,
    description: 'Type of expense',
  })
  @IsOptional()
  @IsEnum(ExpenseType)
  expenseType?: ExpenseType;
}

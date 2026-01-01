import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsString,
    IsNumber,
    IsDateString,
    IsOptional,
    IsUUID,
    IsEnum,
    Min,
} from 'class-validator';
import { ExpenseType } from '../../../common/entities/expense.entity';

export class CreateExpenseDto {
    @ApiProperty({ example: 'Lab Equipment', description: 'Expense name' })
    @IsNotEmpty()
    @IsString()
    name!: string;

    @ApiProperty({ example: 500.0, description: 'Expense amount' })
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    amount!: number;

    @ApiProperty({ example: '2024-01-15', description: 'Expense date' })
    @IsNotEmpty()
    @IsDateString()
    date!: string;

    @ApiPropertyOptional({ example: 'uuid', description: 'Invoice attachment ID (optional)' })
    @IsOptional()
    @IsUUID()
    invoiceId?: string;

    @ApiPropertyOptional({ example: 'Payment for lab work', description: 'Additional notes' })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiPropertyOptional({ example: 'uuid', description: 'Doctor ID for doctor-related expenses' })
    @IsOptional()
    @IsUUID()
    doctorId?: string;

    @ApiProperty({
        enum: ExpenseType,
        example: ExpenseType.LAB,
        description: 'Type of expense',
    })
    @IsNotEmpty()
    @IsEnum(ExpenseType)
    expenseType!: ExpenseType;
}

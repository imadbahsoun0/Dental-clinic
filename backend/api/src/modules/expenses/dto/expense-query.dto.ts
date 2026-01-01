import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsDateString, IsUUID, IsEnum } from 'class-validator';
import { ExpenseType } from '../../../common/entities/expense.entity';

export class ExpenseQueryDto {
    @ApiPropertyOptional({ example: 1, description: 'Page number' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ example: 10, description: 'Items per page' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;

    @ApiPropertyOptional({ example: '2024-01-01', description: 'Start date filter' })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional({ example: '2024-12-31', description: 'End date filter' })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiPropertyOptional({ example: 'uuid', description: 'Filter by doctor ID' })
    @IsOptional()
    @IsUUID()
    doctorId?: string;

    @ApiPropertyOptional({
        enum: ExpenseType,
        example: ExpenseType.LAB,
        description: 'Filter by expense type',
    })
    @IsOptional()
    @IsEnum(ExpenseType)
    expenseType?: ExpenseType;
}

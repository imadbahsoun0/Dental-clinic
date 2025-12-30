import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class PaymentQueryDto extends PaginationDto {
    @ApiPropertyOptional({ description: 'Filter by patient ID' })
    @IsOptional()
    @IsString()
    patientId?: string;

    @ApiPropertyOptional({ description: 'Filter by start date (ISO format)' })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional({ description: 'Filter by end date (ISO format)' })
    @IsOptional()
    @IsDateString()
    endDate?: string;
}

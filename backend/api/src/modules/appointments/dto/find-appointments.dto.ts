import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsUUID } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FindAppointmentsDto extends PaginationDto {
    @ApiPropertyOptional({ description: 'Filter by specific date (YYYY-MM-DD)' })
    @IsOptional()
    @IsDateString()
    date?: string;

    @ApiPropertyOptional({ description: 'Start date for range filtering' })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional({ description: 'End date for range filtering' })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiPropertyOptional({ description: 'Filter by patient ID' })
    @IsOptional()
    @IsUUID()
    patientId?: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class FilterDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    sortBy?: string;

    @ApiPropertyOptional({ enum: ['ASC', 'DESC'] })
    @IsOptional()
    @IsString()
    sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

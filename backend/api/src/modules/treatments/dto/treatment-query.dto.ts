import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { TreatmentStatus } from '../../../common/entities/treatment.entity';

export class TreatmentQueryDto extends PaginationDto {
    @ApiPropertyOptional({ description: 'Filter by patient ID' })
    @IsOptional()
    @IsString()
    patientId?: string;

    @ApiPropertyOptional({ description: 'Filter by treatment status', enum: TreatmentStatus })
    @IsOptional()
    @IsEnum(TreatmentStatus)
    status?: TreatmentStatus;

    @ApiPropertyOptional({ description: 'Filter by treatment type ID' })
    @IsOptional()
    @IsString()
    treatmentTypeId?: string;
}

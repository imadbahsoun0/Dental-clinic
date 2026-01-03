import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
  ValidateIf,
} from 'class-validator';
import { FollowUpStatus } from '../entities/patient.entity';

export class FilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((o) => o.startDate !== '')
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((o) => o.endDate !== '')
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ enum: FollowUpStatus })
  @IsOptional()
  @IsEnum(FollowUpStatus)
  followUpStatus?: FollowUpStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

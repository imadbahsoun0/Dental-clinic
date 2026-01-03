import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { UserRole } from '../../../common/decorators/roles.decorator';
import { UserStatus } from '../../../common/entities';

export class UpdateUserDto {
  @ApiProperty({ example: 'Dr. John Doe', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: '+1 (555) 123-4567', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: UserRole, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({ enum: UserStatus, required: false })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiProperty({ example: 30, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage?: number;
}

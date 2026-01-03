import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { UserRole } from '../../../common/decorators/roles.decorator';

export class CreateUserDto {
  @ApiProperty({ example: 'Dr. John Doe' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'john.doe@dentalclinic.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123', minLength: 6, required: false })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiProperty({ example: '+1 (555) 123-4567', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.DENTIST })
  @IsEnum(UserRole)
  role!: UserRole;

  @ApiProperty({
    example: 30,
    required: false,
    description: 'Commission percentage for dentists',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage?: number;
}

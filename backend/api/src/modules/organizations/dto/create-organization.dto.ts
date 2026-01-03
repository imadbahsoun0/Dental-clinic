import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsUrl, Matches } from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'DentaCare Pro Clinic' })
  @IsString()
  name!: string;

  @ApiProperty({
    example: '123 Dental Street, Suite 100, New York, NY 10001',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: '+1 (555) 123-4567', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'info@dentacarepro.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'https://www.dentacarepro.com', required: false })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({
    example: 'Africa/Casablanca',
    required: false,
    description: 'IANA timezone name (defaults to UTC)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^(UTC|[A-Za-z_]+(?:\/[A-Za-z_]+)+)$/)
  timeZone?: string;
}

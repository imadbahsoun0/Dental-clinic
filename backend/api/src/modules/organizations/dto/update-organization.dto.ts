import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsUrl,
  IsBoolean,
  IsUUID,
  Matches,
} from 'class-validator';

export class UpdateOrganizationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({ required: false, description: 'Attachment ID for the logo' })
  @IsOptional()
  @IsUUID()
  logoId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    required: false,
    example: 'Africa/Casablanca',
    description: 'IANA timezone name (e.g. Africa/Casablanca) or UTC',
  })
  @IsOptional()
  @IsString()
  @Matches(/^(UTC|[A-Za-z_]+(?:\/[A-Za-z_]+)+)$/)
  timeZone?: string;

  @ApiProperty({
    required: false,
    nullable: true,
    description:
      'Default doctor user ID to preselect when creating a new appointment. Set null to clear.',
  })
  @IsOptional()
  @IsUUID()
  defaultDoctorId?: string | null;
}

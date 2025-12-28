import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsUrl, IsBoolean, IsUUID } from 'class-validator';

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
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsDateString, IsBoolean, IsArray } from 'class-validator';

export class CreatePatientDto {
    @ApiProperty({ example: 'John' })
    @IsString()
    firstName!: string;

    @ApiProperty({ example: 'Doe' })
    @IsString()
    lastName!: string;

    @ApiProperty({ example: '+1 (555) 123-4567' })
    @IsString()
    mobileNumber!: string;

    @ApiProperty({ example: 'john.doe@email.com', required: false })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ example: '1990-05-15', required: false })
    @IsOptional()
    @IsDateString()
    dateOfBirth?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    medicalHistory?: any;

    @ApiProperty({ example: true, required: false })
    @IsOptional()
    @IsBoolean()
    enablePaymentReminders?: boolean;

    @ApiProperty({ type: [String], required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    documentIds?: string[];
}

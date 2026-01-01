import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDateString, IsString, IsOptional } from 'class-validator';

export class CreateAppointmentDto {
    @ApiProperty({ example: 'patient-uuid-here' })
    @IsUUID()
    patientId!: string;

    @ApiProperty({ example: 'treatment-type-uuid-here', required: false })
    @IsOptional()
    @IsUUID()
    treatmentTypeId?: string;

    @ApiProperty({ example: 'treatment-uuid-here', required: false, description: 'If provided, the treatment status will be updated to IN_PROGRESS' })
    @IsOptional()
    @IsUUID()
    treatmentId?: string;

    @ApiProperty({ example: '2024-01-15' })
    @IsDateString()
    date!: string;

    @ApiProperty({ example: '14:30' })
    @IsString()
    time!: string;

    @ApiProperty({ example: 'doctor-uuid-here', description: 'Doctor ID is required' })
    @IsUUID()
    doctorId!: string;

    @ApiProperty({ required: false, example: 'Patient requested morning slot' })
    @IsOptional()
    @IsString()
    notes?: string;
}

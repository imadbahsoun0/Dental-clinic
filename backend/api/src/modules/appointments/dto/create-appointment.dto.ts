import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDateString, IsString, IsEnum, IsOptional } from 'class-validator';
import { AppointmentStatus } from '../../../common/entities/appointment.entity';

export class CreateAppointmentDto {
    @ApiProperty({ example: 'patient-uuid-here' })
    @IsUUID()
    patientId!: string;

    @ApiProperty({ example: 'treatment-type-uuid-here', required: false })
    @IsOptional()
    @IsUUID()
    treatmentTypeId?: string;

    @ApiProperty({ example: '2024-01-15' })
    @IsDateString()
    date!: string;

    @ApiProperty({ example: '14:30' })
    @IsString()
    time!: string;

    @ApiProperty({ enum: AppointmentStatus, required: false, default: AppointmentStatus.PENDING })
    @IsOptional()
    @IsEnum(AppointmentStatus)
    status?: AppointmentStatus;

    @ApiProperty({ required: false, example: 'doctor-uuid-here' })
    @IsOptional()
    @IsUUID()
    doctorId?: string;

    @ApiProperty({ required: false, example: 'Patient requested morning slot' })
    @IsOptional()
    @IsString()
    notes?: string;
}

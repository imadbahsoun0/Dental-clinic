import { PartialType } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateAppointmentDto } from './create-appointment.dto';
import { AppointmentStatus } from '../../../common/entities/appointment.entity';

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
  @ApiProperty({
    enum: AppointmentStatus,
    required: false,
    description: 'Appointment status (only for updates)',
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;
}

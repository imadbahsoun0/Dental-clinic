import { IsBoolean, IsInt, IsString, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class AppointmentReminderDto {
  @ApiProperty()
  @IsBoolean()
  enabled!: boolean;

  @ApiProperty({ description: 'Timing in hours before appointment' })
  @IsInt()
  timingInHours!: number;
}

class MessageTemplatesDto {
  @ApiProperty()
  @IsString()
  medical_history!: string;

  @ApiProperty()
  @IsString()
  payment_receipt!: string;

  @ApiProperty()
  @IsString()
  appointment_reminder!: string;

  @ApiProperty()
  @IsString()
  follow_up!: string;

  @ApiProperty()
  @IsString()
  payment_overdue!: string;
}

export class UpdateNotificationSettingsDto {
  @ApiProperty({ type: () => [AppointmentReminderDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AppointmentReminderDto)
  appointmentReminders!: AppointmentReminderDto[];

  @ApiProperty({ type: () => MessageTemplatesDto })
  @ValidateNested()
  @Type(() => MessageTemplatesDto)
  messageTemplates!: MessageTemplatesDto;
}

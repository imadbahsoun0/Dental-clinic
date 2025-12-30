import { IsBoolean, IsInt, IsString, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class AppointmentReminderDto {
    @ApiProperty()
    @IsBoolean()
    enabled!: boolean;

    @ApiProperty()
    @IsInt()
    timing!: number;

    @ApiProperty({ enum: ['hours', 'days'] })
    @IsEnum(['hours', 'days'])
    timingUnit!: 'hours' | 'days';

    @ApiProperty()
    @IsString()
    messageTemplate!: string;
}

class PaymentReminderDto {
    @ApiProperty()
    @IsBoolean()
    enabled!: boolean;

    @ApiProperty()
    @IsInt()
    timing!: number;

    @ApiProperty({ enum: ['hours', 'days'] })
    @IsEnum(['hours', 'days'])
    timingUnit!: 'hours' | 'days';

    @ApiProperty()
    @IsString()
    messageTemplate!: string;
}

export class UpdateNotificationSettingsDto {
    @ApiProperty({ type: () => AppointmentReminderDto })
    @ValidateNested()
    @Type(() => AppointmentReminderDto)
    appointmentReminder!: AppointmentReminderDto;

    @ApiProperty({ type: () => PaymentReminderDto })
    @ValidateNested()
    @Type(() => PaymentReminderDto)
    paymentReminder!: PaymentReminderDto;
}

import { ApiProperty } from '@nestjs/swagger';

class AppointmentReminderResponseDto {
    @ApiProperty()
    enabled!: boolean;

    @ApiProperty()
    timing!: number;

    @ApiProperty()
    timingUnit!: 'hours' | 'days';

    @ApiProperty()
    messageTemplate!: string;
}

class PaymentReminderResponseDto {
    @ApiProperty()
    enabled!: boolean;

    @ApiProperty()
    timing!: number;

    @ApiProperty()
    timingUnit!: 'hours' | 'days';

    @ApiProperty()
    messageTemplate!: string;
}

export class NotificationSettingsResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty({ type: () => AppointmentReminderResponseDto })
    appointmentReminder!: AppointmentReminderResponseDto;

    @ApiProperty({ type: () => PaymentReminderResponseDto })
    paymentReminder!: PaymentReminderResponseDto;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}

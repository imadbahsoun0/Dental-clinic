import { ApiProperty } from '@nestjs/swagger';

export class PatientResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    firstName!: string;

    @ApiProperty()
    lastName!: string;

    @ApiProperty()
    mobileNumber!: string;

    @ApiProperty({ required: false })
    email?: string;

    @ApiProperty({ required: false })
    dateOfBirth?: Date;

    @ApiProperty({ required: false })
    address?: string;

    @ApiProperty({ required: false })
    medicalHistory?: any;

    @ApiProperty()
    enablePaymentReminders!: boolean;

    @ApiProperty({ type: [Object], required: false })
    documents?: any[]; // Attachments

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}

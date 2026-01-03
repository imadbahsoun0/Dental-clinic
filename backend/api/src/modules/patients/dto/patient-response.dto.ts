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

    @ApiProperty({ required: false })
    followUpDate?: Date;

    @ApiProperty({ required: false })
    followUpReason?: string;

    @ApiProperty({ enum: ['pending', 'completed', 'cancelled'], required: false })
    followUpStatus?: string;

    @ApiProperty({ type: [Object], required: false })
    documents?: any[]; // Attachments

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}

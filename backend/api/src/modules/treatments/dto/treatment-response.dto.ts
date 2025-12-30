import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TreatmentStatus } from '../../../common/entities/treatment.entity';

export class TreatmentResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    patientId!: string;

    @ApiPropertyOptional()
    patient?: {
        id: string;
        firstName: string;
        lastName: string;
    };

    @ApiProperty()
    treatmentTypeId!: string;

    @ApiPropertyOptional()
    treatmentType?: {
        id: string;
        name: string;
        color: string;
    };

    @ApiProperty({ type: [Number] })
    toothNumbers!: number[];

    @ApiProperty()
    totalPrice!: number;

    @ApiProperty()
    discount!: number;

    @ApiProperty({ enum: TreatmentStatus })
    status!: TreatmentStatus;

    @ApiPropertyOptional()
    appointmentId?: string;

    @ApiPropertyOptional()
    appointment?: {
        id: string;
        date: string;
        time: string;
        doctor?: {
            id: string;
            name: string;
        };
    };

    @ApiPropertyOptional()
    notes?: string;

    @ApiProperty()
    createdAt!: string;

    @ApiProperty()
    updatedAt!: string;
}

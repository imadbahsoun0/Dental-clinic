import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PendingTreatmentDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    patientId!: string;

    @ApiProperty()
    patientFirstName!: string;

    @ApiProperty()
    patientLastName!: string;

    @ApiProperty()
    treatmentTypeId!: string;

    @ApiProperty()
    treatmentTypeName!: string;

    @ApiProperty()
    totalPrice!: number;

    @ApiProperty()
    discount!: number;

    @ApiPropertyOptional()
    notes?: string;

    @ApiProperty()
    createdAt!: string;
}

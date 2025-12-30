import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../../../common/entities/payment.entity';

export class PaymentResponseDto {
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
    amount!: number;

    @ApiProperty()
    date!: string;

    @ApiProperty({ enum: PaymentMethod })
    paymentMethod!: PaymentMethod;

    @ApiPropertyOptional()
    notes?: string;

    @ApiProperty()
    createdAt!: string;

    @ApiProperty()
    updatedAt!: string;
}

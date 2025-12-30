import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional, IsDateString, Min } from 'class-validator';
import { PaymentMethod } from '../../../common/entities/payment.entity';

export class CreatePaymentDto {
    @ApiProperty({ description: 'Patient ID' })
    @IsNotEmpty()
    @IsString()
    patientId!: string;

    @ApiProperty({ description: 'Payment amount', example: 100.00 })
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    amount!: number;

    @ApiProperty({ description: 'Payment date (ISO format)', example: '2024-01-15' })
    @IsNotEmpty()
    @IsDateString()
    date!: string;

    @ApiProperty({ description: 'Payment method', enum: PaymentMethod })
    @IsNotEmpty()
    @IsEnum(PaymentMethod)
    paymentMethod!: PaymentMethod;

    @ApiPropertyOptional({ description: 'Additional notes' })
    @IsOptional()
    @IsString()
    notes?: string;
}

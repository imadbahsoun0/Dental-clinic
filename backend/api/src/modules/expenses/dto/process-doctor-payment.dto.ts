import { IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProcessDoctorPaymentDto {
  @ApiProperty({
    description: 'ID of the doctor to pay',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID()
  doctorId: string;

  @ApiProperty({
    description: 'Payment amount',
    example: 1000,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Payment notes',
    example: 'Commission payment for December 2025',
  })
  @IsNotEmpty()
  @IsString()
  notes: string;
}

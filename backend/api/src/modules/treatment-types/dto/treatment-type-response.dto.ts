import { ApiProperty } from '@nestjs/swagger';
import { PriceVariantDto } from './create-treatment-type.dto';

export class TreatmentTypeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  categoryId: string;

  @ApiProperty({ type: [PriceVariantDto] })
  priceVariants: PriceVariantDto[];

  @ApiProperty()
  duration: number;

  @ApiProperty()
  color: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

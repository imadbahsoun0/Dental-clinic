import { ApiProperty } from '@nestjs/swagger';

export class TreatmentCategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  icon?: string;

  @ApiProperty({ required: false })
  order?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

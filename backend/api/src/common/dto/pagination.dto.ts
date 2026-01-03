import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min, Max } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 1000, default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  @IsOptional()
  limit?: number = 10;
}

export class PaginatedResponse<T> {
  @ApiProperty()
  data: T[];

  @ApiProperty()
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.meta = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

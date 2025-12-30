import { IsString, IsNotEmpty, IsOptional, IsInt, IsArray, ValidateNested, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PriceVariantDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsNumber()
    price: number;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    currency?: string;

    @ApiProperty({ required: false })
    @IsArray()
    @IsNumber({}, { each: true })
    @IsOptional()
    toothNumbers?: number[];

    @ApiProperty({ required: false })
    @IsBoolean()
    @IsOptional()
    isDefault?: boolean;
}

export class CreateTreatmentTypeDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    categoryId: string;

    @ApiProperty({ type: [PriceVariantDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PriceVariantDto)
    priceVariants: PriceVariantDto[];

    @ApiProperty()
    @IsInt()
    duration: number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    color: string;
}

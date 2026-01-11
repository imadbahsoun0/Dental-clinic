import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateWhatsappIntegrationDto {
  @ApiProperty({ required: false, example: 'http://localhost:3002' })
  @IsOptional()
  @IsUrl({ require_tld: false })
  wahaApiUrl?: string;

  @ApiProperty({ required: false, example: 'your-waha-api-key' })
  @IsOptional()
  @IsString()
  wahaApiKey?: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class WhatsappIntegrationConfigDto {
  @ApiProperty({ required: false, example: 'http://localhost:3002' })
  wahaApiUrl?: string;

  @ApiProperty({ example: true })
  hasApiKey!: boolean;
}

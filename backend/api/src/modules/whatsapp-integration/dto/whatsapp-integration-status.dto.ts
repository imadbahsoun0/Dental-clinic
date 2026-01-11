import { ApiProperty } from '@nestjs/swagger';

export type WahaSessionStatus =
  | 'STOPPED'
  | 'STARTING'
  | 'SCAN_QR_CODE'
  | 'WORKING'
  | 'FAILED';

export class WhatsappIntegrationStatusDto {
  @ApiProperty({ enum: ['STOPPED', 'STARTING', 'SCAN_QR_CODE', 'WORKING', 'FAILED'] })
  status!: WahaSessionStatus;

  @ApiProperty({ example: true })
  isConnected!: boolean;

  @ApiProperty({ example: false })
  needsQrScan!: boolean;
}

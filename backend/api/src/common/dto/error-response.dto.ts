import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponse {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Error message' })
  message: string;

  @ApiProperty({ example: 'BAD_REQUEST' })
  error?: string;

  @ApiProperty({ example: ['field1 is required', 'field2 must be a string'] })
  details?: string[];

  @ApiProperty({ example: '2025-12-27T10:00:00Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/v1/patients' })
  path?: string;

  constructor(
    message: string,
    error?: string,
    details?: string[],
    path?: string,
  ) {
    this.success = false;
    this.message = message;
    this.error = error;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.path = path;
  }
}

import { ApiProperty } from '@nestjs/swagger';

export class StandardResponse<T = any> {
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: 'Operation completed successfully' })
    message: string;

    @ApiProperty()
    data?: T;

    @ApiProperty({ example: '2025-12-27T10:00:00Z' })
    timestamp: string;

    constructor(data?: T, message = 'Success') {
        this.success = true;
        this.message = message;
        this.data = data;
        this.timestamp = new Date().toISOString();
    }
}

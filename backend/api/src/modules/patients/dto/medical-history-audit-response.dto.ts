import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MedicalHistoryAuditResponseDto {
    @ApiProperty({ example: 'uuid' })
    id!: string;

    @ApiProperty({ example: 'uuid' })
    patientId!: string;

    @ApiProperty({
        example: {
            id: 'uuid',
            firstName: 'John',
            lastName: 'Doe',
            role: 'secretary',
        },
    })
    editedBy!: {
        id: string;
        firstName: string;
        lastName: string;
        role: string;
    };

    @ApiProperty({
        example: {
            'questionId-1': {
                old: 'No',
                new: 'Yes',
            },
        },
    })
    changes!: Record<string, { old: unknown; new: unknown }>;

    @ApiPropertyOptional({ example: 'Updated by secretary - patient called with new information' })
    notes?: string;

    @ApiProperty({ example: '2024-01-01T12:00:00.000Z' })
    createdAt!: Date;

    @ApiProperty({ example: '2024-01-01T12:00:00.000Z' })
    updatedAt!: Date;
}

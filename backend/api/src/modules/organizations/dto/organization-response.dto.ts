import { ApiProperty } from '@nestjs/swagger';

export class OrganizationResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;

    @ApiProperty({ required: false })
    location?: string;

    @ApiProperty({ required: false })
    phone?: string;

    @ApiProperty({ required: false })
    email?: string;

    @ApiProperty({ required: false })
    website?: string;

    @ApiProperty({ required: false })
    logo?: any; // Attachment object

    @ApiProperty()
    isActive!: boolean;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}

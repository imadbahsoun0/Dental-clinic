import { ApiProperty } from '@nestjs/swagger';

export class OrganizationLogoDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    filename!: string;

    @ApiProperty()
    mimeType!: string;

    @ApiProperty()
    size!: number;

    @ApiProperty()
    url!: string | null;
}

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
    logo?: OrganizationLogoDto | null;

    @ApiProperty()
    timeZone!: string;

    @ApiProperty()
    isActive!: boolean;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}

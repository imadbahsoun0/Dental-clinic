import { ApiProperty } from '@nestjs/swagger';

export class UserOrgResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    orgId!: string;

    @ApiProperty()
    role!: string;

    @ApiProperty()
    status!: string;

    @ApiProperty({ required: false })
    wallet?: number;

    @ApiProperty({ required: false })
    percentage?: number;
}

export class UserResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;

    @ApiProperty()
    email!: string;

    @ApiProperty({ required: false })
    phone?: string;

    @ApiProperty({ type: [UserOrgResponseDto] })
    organizations!: UserOrgResponseDto[];

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}

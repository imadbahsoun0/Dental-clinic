import { ApiProperty } from '@nestjs/swagger';

export class UserOrgDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    userId!: string;

    @ApiProperty()
    orgId!: string;

    @ApiProperty({ required: false })
    orgName?: string;

    @ApiProperty({ enum: ['admin', 'dentist', 'secretary'] })
    role!: string;

    @ApiProperty({ enum: ['active', 'inactive'] })
    status!: string;

    @ApiProperty({ required: false })
    wallet?: number;

    @ApiProperty({ required: false })
    percentage?: number;
}

export class UserDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;

    @ApiProperty()
    email!: string;

    @ApiProperty({ required: false })
    phone?: string;

    @ApiProperty({ type: [UserOrgDto], required: false })
    organizations?: UserOrgDto[];

    @ApiProperty({ type: UserOrgDto, required: false })
    currentOrg?: UserOrgDto;
}

export class LoginResponseDto {
    @ApiProperty({ type: UserDto })
    user!: UserDto;

    @ApiProperty()
    needsOrgSelection!: boolean;

    @ApiProperty({ required: false })
    accessToken?: string;
}

export class SelectOrgResponseDto {
    @ApiProperty()
    accessToken!: string;

    @ApiProperty({ type: UserOrgDto })
    currentOrg!: UserOrgDto;
}

export class RefreshResponseDto {
    @ApiProperty()
    accessToken!: string;
}

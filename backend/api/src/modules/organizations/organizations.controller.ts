import { Controller, Get, Post, Body, Patch } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationResponseDto } from './dto/organization-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../common/decorators/current-user.decorator';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { ApiStandardResponse } from '../../common/decorators/api-standard-response.decorator';
import { StandardResponse } from '../../common/dto/standard-response.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Organizations')
@ApiBearerAuth('JWT-auth')
@Controller('organizations')
export class OrganizationsController {
    constructor(private readonly organizationsService: OrganizationsService) { }

    @Post()
    @Public() // For now, manual creation - in production, this would be super admin only
    @ApiOperation({ summary: 'Create a new organization (manual/super admin only)' })
    @ApiStandardResponse(OrganizationResponseDto, false, 'created')
    async create(@Body() createOrgDto: CreateOrganizationDto) {
        // In production, get createdBy from super admin token
        const result = await this.organizationsService.create(createOrgDto, 'system');
        return new StandardResponse(result, 'Organization created successfully');
    }

    @Get('current')
    @ApiOperation({ summary: 'Get current organization details' })
    @ApiStandardResponse(OrganizationResponseDto)
    async getCurrent(@CurrentUser() user: CurrentUserData) {
        const result = await this.organizationsService.findOne(user.orgId);
        return new StandardResponse(result);
    }

    @Patch('current')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Update current organization (admin only)' })
    @ApiStandardResponse(OrganizationResponseDto)
    async updateCurrent(
        @Body() updateOrgDto: UpdateOrganizationDto,
        @CurrentUser() user: CurrentUserData,
    ) {
        const result = await this.organizationsService.update(
            user.orgId,
            updateOrgDto,
            user.id,
        );
        return new StandardResponse(result, 'Organization updated successfully');
    }
}

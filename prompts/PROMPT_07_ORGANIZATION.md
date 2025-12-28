# Prompt 7: Organization Module

## Objective
Implement organization management APIs for creating and managing organizations, clinic branding, and organization-specific settings.

## Context
- Prompts 1-6 completed: Auth, RBAC, and user management working
- Organizations are the tenant containers in multi-tenant architecture
- Only super admins can create organizations (manual for now)
- Admins can update their organization settings

## Prerequisites
- Prompts 1-6 completed successfully
- Organization entity exists in database

## Tasks

### 1. Create Organization DTOs

**File: `src/modules/organizations/dto/create-organization.dto.ts`**
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsUrl } from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'DentaCare Pro Clinic' })
  @IsString()
  name!: string;

  @ApiProperty({ example: '123 Dental Street, Suite 100, New York, NY 10001', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: '+1 (555) 123-4567', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'info@dentacarepro.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'https://www.dentacarepro.com', required: false })
  @IsOptional()
  @IsUrl()
  website?: string;
}
```

**File: `src/modules/organizations/dto/update-organization.dto.ts`**
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsUrl, IsBoolean, IsUUID } from 'class-validator';

export class UpdateOrganizationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({ required: false, description: 'Attachment ID for the logo' })
  @IsOptional()
  @IsUUID()
  logoId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
```

**File: `src/modules/organizations/dto/organization-response.dto.ts`**
```typescript
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
```

### 2. Create Organizations Service

**File: `src/modules/organizations/organizations.service.ts`**
```typescript
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Organization, Attachment } from '../../common/entities';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private em: EntityManager) {}

  async create(createOrgDto: CreateOrganizationDto, createdBy: string) {
    const organization = new Organization(createOrgDto.name);
    organization.location = createOrgDto.location;
    organization.phone = createOrgDto.phone;
    organization.email = createOrgDto.email;
    organization.website = createOrgDto.website;
    organization.createdBy = createdBy;

    this.em.persist(organization);
    await this.em.flush();

    return this.mapToResponse(organization);
  }

  async findOne(orgId: string) {
    const organization = await this.em.findOne(Organization, { id: orgId });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return this.mapToResponse(organization);
  }

  async update(orgId: string, updateOrgDto: UpdateOrganizationDto, updatedBy: string) {
    const organization = await this.em.findOne(Organization, { id: orgId });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Update fields
    if (updateOrgDto.name) organization.name = updateOrgDto.name;
    if (updateOrgDto.location !== undefined) organization.location = updateOrgDto.location;
    if (updateOrgDto.phone !== undefined) organization.phone = updateOrgDto.phone;
    if (updateOrgDto.email !== undefined) organization.email = updateOrgDto.email;
    if (updateOrgDto.website !== undefined) organization.website = updateOrgDto.website;
    if (updateOrgDto.logoId) {
      organization.logo = this.em.getReference(Attachment, updateOrgDto.logoId);
    }
    if (updateOrgDto.isActive !== undefined) organization.isActive = updateOrgDto.isActive;

    organization.updatedBy = updatedBy;

    await this.em.flush();

    return this.mapToResponse(organization);
  }

  private mapToResponse(org: Organization) {
    return {
      id: org.id,
      name: org.name,
      location: org.location,
      phone: org.phone,
      email: org.email,
      website: org.website,
      logo: org.logo,
      isActive: org.isActive,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    };
  }
}
```

### 3. Create Organizations Controller

**File: `src/modules/organizations/organizations.controller.ts`**
```typescript
import { Controller, Get, Post, Body, Patch } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationResponseDto } from './dto/organization-response.dto';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { ApiStandardResponse } from '../../common/decorators/api-standard-response.decorator';
import { StandardResponse } from '../../common/dto/standard-response.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Organizations')
@ApiBearerAuth('JWT-auth')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

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
```

### 4. Create Organizations Module

**File: `src/modules/organizations/organizations.module.ts`**
```typescript
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { Organization } from '../../common/entities';

@Module({
  imports: [MikroOrmModule.forFeature([Organization])],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
```

### 5. Update App Module

Add OrganizationsModule to imports in `src/app.module.ts`.

### 6. Generate API Client

Run the following command in the `frontend` directory to update the API client with the new endpoints:

```bash
cd frontend
npm run generate:api
```

### 7. Frontend Integration

**File: `frontend/app/settings/page.tsx`** or **`frontend/dashboard/page.tsx`** (update to use real API):

Create or update setting components to fetch current organization details using `api.organizations.organizationsControllerGetCurrent`.
Connect the organization settings form to `api.organizations.organizationsControllerUpdateCurrent`.

## Acceptance Criteria

- [ ] Organizations module created
- [ ] Create organization endpoint working
- [ ] Get current organization endpoint working
- [ ] Update organization endpoint working
- [ ] Only admins can update organization
- [ ] All users can view their organization
- [ ] Swagger documentation complete

## Testing Steps

1. **Create organization** (manual/public for now):
   ```bash
   curl -X POST http://localhost:3000/api/v1/organizations \
     -H "Content-Type: application/json" \
     -d '{
       "name": "DentaCare Pro Clinic",
       "location": "123 Dental St, NY",
       "phone": "+1 (555) 123-4567",
       "email": "info@dentacarepro.com"
     }'
   ```

2. **Get current organization**:
   ```bash
   curl -X GET http://localhost:3000/api/v1/organizations/current \
     -H "Authorization: Bearer TOKEN"
   ```

3. **Update organization (admin)**:
   ```bash
   curl -X PATCH http://localhost:3000/api/v1/organizations/current \
     -H "Authorization: Bearer ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"logo": "base64_logo_here"}'
   ```

## Files Created

```
src/modules/organizations/
├── organizations.module.ts
├── organizations.controller.ts
├── organizations.service.ts
└── dto/
    ├── create-organization.dto.ts
    ├── update-organization.dto.ts
    └── organization-response.dto.ts
```

## Next Steps

Proceed to **Prompt 8: Patient Module**

---

**Estimated Time**: 45-60 minutes
**Difficulty**: Medium
**Dependencies**: Prompts 1-6

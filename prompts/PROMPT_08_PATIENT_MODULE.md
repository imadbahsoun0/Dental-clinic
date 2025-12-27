# Prompt 8: Patient Module

## Objective
Implement patient management APIs with full CRUD operations, medical history support, search, filtering, and pagination - all scoped to the user's organization.

## Context
- Prompts 1-7 completed: Auth, RBAC, users, and organizations working
- All roles can view patients
- Secretary and Admin can create/edit patients
- Data scoped to organization

## Prerequisites
- Prompts 1-7 completed successfully
- Patient entity exists in database

## Tasks

### 1. Create Patient DTOs

**File: `src/modules/patients/dto/create-patient.dto.ts`**
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsDateString, IsBoolean } from 'class-validator';

export class CreatePatientDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName!: string;

  @ApiProperty({ example: '+1 (555) 123-4567' })
  @IsString()
  mobileNumber!: string;

  @ApiProperty({ example: 'john.doe@email.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '1990-05-15', required: false })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  medicalHistory?: any;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  enablePaymentReminders?: boolean;
}
```

**File: `src/modules/patients/dto/update-patient.dto.ts`**
```typescript
import { PartialType } from '@nestjs/swagger';
import { CreatePatientDto } from './create-patient.dto';

export class UpdatePatientDto extends PartialType(CreatePatientDto) {}
```

**File: `src/modules/patients/dto/patient-response.dto.ts`**
```typescript
import { ApiProperty } from '@nestjs/swagger';

export class PatientResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty()
  mobileNumber!: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ required: false })
  dateOfBirth?: Date;

  @ApiProperty({ required: false })
  address?: string;

  @ApiProperty({ required: false })
  medicalHistory?: any;

  @ApiProperty()
  enablePaymentReminders!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
```

### 2. Create Patients Service

**File: `src/modules/patients/patients.service.ts`**
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Patient } from '../../common/entities';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { FilterDto } from '../../common/dto/filter.dto';

@Injectable()
export class PatientsService {
  constructor(private em: EntityManager) {}

  async create(createPatientDto: CreatePatientDto, orgId: string, createdBy: string) {
    const patient = this.em.create(Patient, {
      ...createPatientDto,
      orgId,
      createdBy,
      dateOfBirth: createPatientDto.dateOfBirth ? new Date(createPatientDto.dateOfBirth) : undefined,
    });

    await this.em.persistAndFlush(patient);
    return this.mapToResponse(patient);
  }

  async findAll(orgId: string, pagination: PaginationDto, filter?: FilterDto) {
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;

    const qb = this.em.createQueryBuilder(Patient);
    qb.where({ orgId });

    // Search filter
    if (filter?.search) {
      qb.andWhere({
        $or: [
          { firstName: { $ilike: `%${filter.search}%` } },
          { lastName: { $ilike: `%${filter.search}%` } },
          { mobileNumber: { $ilike: `%${filter.search}%` } },
          { email: { $ilike: `%${filter.search}%` } },
        ],
      });
    }

    // Date range filter
    if (filter?.startDate && filter?.endDate) {
      qb.andWhere({
        createdAt: {
          $gte: new Date(filter.startDate),
          $lte: new Date(filter.endDate),
        },
      });
    }

    // Sorting
    const sortBy = filter?.sortBy || 'createdAt';
    const sortOrder = filter?.sortOrder || 'DESC';
    qb.orderBy({ [sortBy]: sortOrder });

    qb.limit(limit).offset(offset);

    const [patients, total] = await qb.getResultAndCount();

    return {
      data: patients.map(p => this.mapToResponse(p)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, orgId: string) {
    const patient = await this.em.findOne(Patient, { id, orgId });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return this.mapToResponse(patient);
  }

  async update(id: string, updatePatientDto: UpdatePatientDto, orgId: string, updatedBy: string) {
    const patient = await this.em.findOne(Patient, { id, orgId });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    this.em.assign(patient, {
      ...updatePatientDto,
      updatedBy,
      dateOfBirth: updatePatientDto.dateOfBirth ? new Date(updatePatientDto.dateOfBirth) : patient.dateOfBirth,
    });

    await this.em.flush();
    return this.mapToResponse(patient);
  }

  async remove(id: string, orgId: string) {
    const patient = await this.em.findOne(Patient, { id, orgId });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    await this.em.removeAndFlush(patient);
    return { message: 'Patient deleted successfully' };
  }

  async search(query: string, orgId: string) {
    const patients = await this.em.find(Patient, {
      orgId,
      $or: [
        { firstName: { $ilike: `%${query}%` } },
        { lastName: { $ilike: `%${query}%` } },
        { mobileNumber: { $ilike: `%${query}%` } },
      ],
    }, { limit: 10 });

    return patients.map(p => this.mapToResponse(p));
  }

  private mapToResponse(patient: Patient) {
    return {
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      mobileNumber: patient.mobileNumber,
      email: patient.email,
      dateOfBirth: patient.dateOfBirth,
      address: patient.address,
      medicalHistory: patient.medicalHistory,
      enablePaymentReminders: patient.enablePaymentReminders,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    };
  }
}
```

### 3. Create Patients Controller

**File: `src/modules/patients/patients.controller.ts`**
```typescript
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientResponseDto } from './dto/patient-response.dto';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { ApiStandardResponse } from '../../common/decorators/api-standard-response.decorator';
import { StandardResponse } from '../../common/dto/standard-response.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { FilterDto } from '../../common/dto/filter.dto';
import { ParseUUIDPipe } from '../../common/pipes/parse-uuid.pipe';

@ApiTags('Patients')
@ApiBearerAuth('JWT-auth')
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  @ApiOperation({ summary: 'Create a new patient' })
  @ApiStandardResponse(PatientResponseDto, false, 'created')
  async create(
    @Body() createPatientDto: CreatePatientDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    const result = await this.patientsService.create(
      createPatientDto,
      user.orgId,
      user.id,
    );
    return new StandardResponse(result, 'Patient created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'Get all patients' })
  @ApiStandardResponse(PatientResponseDto, true)
  async findAll(
    @CurrentUser() user: CurrentUserData,
    @Query() pagination: PaginationDto,
    @Query() filter: FilterDto,
  ) {
    const result = await this.patientsService.findAll(user.orgId, pagination, filter);
    return new StandardResponse(result);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search patients' })
  @ApiStandardResponse(PatientResponseDto, true)
  async search(
    @Query('q') query: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    const result = await this.patientsService.search(query, user.orgId);
    return new StandardResponse(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a patient by ID' })
  @ApiStandardResponse(PatientResponseDto)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    const result = await this.patientsService.findOne(id, user.orgId);
    return new StandardResponse(result);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  @ApiOperation({ summary: 'Update a patient' })
  @ApiStandardResponse(PatientResponseDto)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    const result = await this.patientsService.update(
      id,
      updatePatientDto,
      user.orgId,
      user.id,
    );
    return new StandardResponse(result, 'Patient updated successfully');
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  @ApiOperation({ summary: 'Delete a patient' })
  @ApiStandardResponse(Object)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    const result = await this.patientsService.remove(id, user.orgId);
    return new StandardResponse(result);
  }
}
```

### 4. Create Patients Module

**File: `src/modules/patients/patients.module.ts`**
```typescript
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { Patient } from '../../common/entities';

@Module({
  imports: [MikroOrmModule.forFeature([Patient])],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}
```

### 5. Update App Module

Add PatientsModule to imports in `src/app.module.ts`.

## Acceptance Criteria

- [ ] Patients module created
- [ ] Create patient endpoint working
- [ ] List patients with pagination working
- [ ] Search patients working
- [ ] Get patient by ID working
- [ ] Update patient working
- [ ] Delete patient working
- [ ] All data scoped to organization
- [ ] Role-based access working (secretary+ can create/edit)
- [ ] Filtering and sorting working
- [ ] Swagger documentation complete

## Testing Steps

1. **Create patient**:
   ```bash
   curl -X POST http://localhost:3000/api/v1/patients \
     -H "Authorization: Bearer ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "firstName": "John",
       "lastName": "Doe",
       "mobileNumber": "+1 (555) 123-4567",
       "email": "john.doe@email.com",
       "dateOfBirth": "1990-05-15"
     }'
   ```

2. **List patients with pagination**:
   ```bash
   curl -X GET "http://localhost:3000/api/v1/patients?page=1&limit=10" \
     -H "Authorization: Bearer TOKEN"
   ```

3. **Search patients**:
   ```bash
   curl -X GET "http://localhost:3000/api/v1/patients/search?q=John" \
     -H "Authorization: Bearer TOKEN"
   ```

4. **Filter patients**:
   ```bash
   curl -X GET "http://localhost:3000/api/v1/patients?search=Doe&sortBy=firstName&sortOrder=ASC" \
     -H "Authorization: Bearer TOKEN"
   ```

## Files Created

```
src/modules/patients/
├── patients.module.ts
├── patients.controller.ts
├── patients.service.ts
└── dto/
    ├── create-patient.dto.ts
    ├── update-patient.dto.ts
    └── patient-response.dto.ts
```

## Next Steps

Proceed to **Prompt 9: Appointment Module**

---

**Estimated Time**: 60-75 minutes
**Difficulty**: Medium
**Dependencies**: Prompts 1-7

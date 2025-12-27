# Prompt 8: Patient Module

## Objective
Implement patient management APIs with full CRUD operations, medical history support, search, filtering, and pagination - all scoped to the user's organization.

## Context
- Prompts 1-7 completed: Auth, RBAC, users, and organizations working
- All roles can view patients
- Secretary and Admin can create/edit patients
- Data scoped to organization
- Patients can have file attachments (documents)

## Prerequisites
- Prompts 1-7 completed successfully
- Patient and Attachment entities exist in database

## Tasks

### 1. Create Patient DTOs

**File: `src/modules/patients/dto/create-patient.dto.ts`**
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsDateString, IsBoolean, IsArray } from 'class-validator';

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

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documentIds?: string[];
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

  @ApiProperty({ type: [Object], required: false })
  documents?: any[]; // Attachments

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
import { Patient, Attachment } from '../../common/entities';
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

    if (createPatientDto.documentIds?.length) {
       const attachments = await this.em.find(Attachment, { id: { $in: createPatientDto.documentIds } });
       patient.documents.set(attachments);
    }

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

    // Populate documents if needed, usually lazy or specific request
    await this.em.populate(patients, ['documents']);

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
    const patient = await this.em.findOne(Patient, { id, orgId }, { populate: ['documents'] });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return this.mapToResponse(patient);
  }

  async update(id: string, updatePatientDto: UpdatePatientDto, orgId: string, updatedBy: string) {
    const patient = await this.em.findOne(Patient, { id, orgId }, { populate: ['documents'] });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    this.em.assign(patient, {
      ...updatePatientDto,
      updatedBy,
      dateOfBirth: updatePatientDto.dateOfBirth ? new Date(updatePatientDto.dateOfBirth) : patient.dateOfBirth,
    });

    if (updatePatientDto.documentIds) {
       const attachments = await this.em.find(Attachment, { id: { $in: updatePatientDto.documentIds } });
       patient.documents.set(attachments);
    }

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
      documents: patient.documents.isInitialized() ? patient.documents.getItems() : [],
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    };
  }
}
```

### 3. Create Patients Controller
... (Same as before)

### 4. Create Patients Module
... (Ensure Attachment is in MikroOrmModule.forFeature)

## Acceptance Criteria
- [ ] Patients module created
- [ ] Create patient endpoint working (with document linking)
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
...
(Example curl can include documentIds)

## Next Steps
Proceed to **Prompt 9: Appointment Module**

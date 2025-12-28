# Prompt 9: Appointment Module

## Objective
Implement appointment management with role-based access where dentists can only view their own appointments, while secretaries and admins can view all appointments.

## Context
- Prompts 1-8 completed
- Appointments linked to patients and treatment types
- Role-based filtering required

## Prerequisites
- Prompts 1-8 completed
- Appointment and TreatmentType entities exist

## Tasks

### 1. Create Appointment DTOs

**File: `src/modules/appointments/dto/create-appointment.dto.ts`**
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDateString, IsString, IsEnum, IsOptional } from 'class-validator';
import { AppointmentStatus } from '../../../common/entities';

export class CreateAppointmentDto {
  @ApiProperty()
  @IsUUID()
  patientId!: string;

  @ApiProperty()
  @IsUUID()
  treatmentTypeId!: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  date!: string;

  @ApiProperty({ example: '14:30' })
  @IsString()
  time!: string;

  @ApiProperty({ enum: AppointmentStatus, required: false })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
```

**File: `src/modules/appointments/dto/update-appointment.dto.ts`**
```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateAppointmentDto } from './create-appointment.dto';

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {}
```

### 2. Create Appointments Service

**File: `src/modules/appointments/appointments.service.ts`**
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Appointment, UserRole } from '../../common/entities';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class AppointmentsService {
  constructor(private em: EntityManager) {}

  async create(createDto: CreateAppointmentDto, orgId: string, createdBy: string) {
    const appointment = this.em.create(Appointment, {
      ...createDto,
      date: new Date(createDto.date),
      orgId,
      createdBy,
      doctor: createDto.doctorId ? this.em.getReference('User', createDto.doctorId) : undefined,
    });

    await this.em.persistAndFlush(appointment);
    return this.findOne(appointment.id, orgId, createdBy, UserRole.ADMIN);
  }

  async findAll(orgId: string, userId: string, role: string, pagination: PaginationDto, date?: string) {
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;

    const where: any = { orgId };

    // Dentists can only see their own appointments
    if (role === UserRole.DENTIST) {
      where.doctor = { id: userId };
    }

    // Filter by date if provided
    if (date) {
      where.date = new Date(date);
    }

    const [appointments, total] = await this.em.findAndCount(
      Appointment,
      where,
      {
        populate: ['patient', 'treatmentType', 'doctor'],
        limit,
        offset,
        orderBy: { date: 'DESC', time: 'DESC' },
      },
    );

    return {
      data: appointments,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByDate(date: string, orgId: string, userId: string, role: string) {
    const where: any = { orgId, date: new Date(date) };

    if (role === UserRole.DENTIST) {
      where.doctor = { id: userId };
    }

    return this.em.find(Appointment, where, {
      populate: ['patient', 'treatmentType', 'doctor'],
      orderBy: { time: 'ASC' },
    });
  }

  async findOne(id: string, orgId: string, userId: string, role: string) {
    const where: any = { id, orgId };

    if (role === UserRole.DENTIST) {
      where.doctor = { id: userId };
    }

    const appointment = await this.em.findOne(Appointment, where, {
      populate: ['patient', 'treatmentType', 'doctor'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async update(id: string, updateDto: UpdateAppointmentDto, orgId: string, userId: string, role: string, updatedBy: string) {
    const appointment = await this.findOne(id, orgId, userId, role);

    if (updateDto.doctorId) {
        // Handle doctor update manually or rely on assign if DTO field matches relations
    }

    this.em.assign(appointment, {
      ...updateDto,
      date: updateDto.date ? new Date(updateDto.date) : appointment.date,
      updatedBy,
    });
    
    // Explicitly set doctor if provided? em.assign handles matching IDs to relations if configured or we pass References.
    if (updateDto.doctorId) {
        appointment.doctor = this.em.getReference('User', updateDto.doctorId);
    }

    await this.em.flush();
    return appointment;
  }

  async remove(id: string, orgId: string, userId: string, role: string) {
    const appointment = await this.findOne(id, orgId, userId, role);
    await this.em.removeAndFlush(appointment);
    return { message: 'Appointment deleted successfully' };
  }
}
```

### 3. Create Appointments Controller
(Updated imports and method calls in prompt file content - omitted here for brevity but included in file write)

### 4. Create Appointments Module

**File: `src/modules/appointments/appointments.module.ts`**
```typescript
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { Appointment, Patient, TreatmentType, User } from '../../common/entities';

@Module({
  imports: [MikroOrmModule.forFeature([Appointment, Patient, TreatmentType, User])],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
```

### 5. Generate API Client

Run the following command in the `frontend` directory:

```bash
cd frontend
npm run generate:api
```

### 6. Frontend Integration

**File: `frontend/app/dashboard/page.tsx`** and **`frontend/app/appointments/page.tsx`** (update to use real API):

Create or update `AppointmentScheduler` component to fetch appointments using `api.appointments.appointmentsControllerFindAll` or `api.appointments.appointmentsControllerFindByDate`.
Connect the "New Appointment" modal to `api.appointments.appointmentsControllerCreate`.
Ensure role-based visibility is handled in the UI (e.g. Dentists only see their calendar).

## Acceptance Criteria

- [ ] Appointments module created
- [ ] Create appointment endpoint working
- [ ] List appointments with role-based filtering
- [ ] Get appointments by date
- [ ] Dentists can only see their own appointments
- [ ] Secretary/Admin can see all appointments
- [ ] Update and delete working
- [ ] Swagger documentation complete

## Testing Steps

1. **Create appointment (as secretary)**:
   ```bash
   curl -X POST http://localhost:3000/api/v1/appointments \
     -H "Authorization: Bearer SECRETARY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "patientId": "patient-uuid",
       "treatmentTypeId": "type-uuid",
       "date": "2024-01-15",
       "time": "14:30",
       "doctorId": "doctor-uuid"
     }'
   ```

2. **Get appointments by date**:
   ```bash
   curl -X GET "http://localhost:3000/api/v1/appointments/by-date/2024-01-15" \
     -H "Authorization: Bearer TOKEN"
   ```

3. **Test dentist access** (should only see own appointments):
   ```bash
   curl -X GET http://localhost:3000/api/v1/appointments \
     -H "Authorization: Bearer DENTIST_TOKEN"
   ```

## Next Steps

Proceed to **Prompt 10: Treatment Module**

---

**Estimated Time**: 60-75 minutes
**Difficulty**: Medium-High
**Dependencies**: Prompts 1-8

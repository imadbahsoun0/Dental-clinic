# Prompt 9: Appointment Module

## Objective
Implement appointment management with role-based access where dentists can only view their own appointments, while secretaries and admins can view all appointments.

## Context
- Prompts 1-8 completed
- Appointments linked to patients and appointment types
- Role-based filtering required

## Prerequisites
- Prompts 1-8 completed
- Appointment and AppointmentType entities exist

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
  appointmentTypeId!: string;

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
  @IsString()
  drName?: string;

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
      const user = await this.em.findOne('User', { id: userId });
      where.drName = user?.name;
    }

    // Filter by date if provided
    if (date) {
      where.date = new Date(date);
    }

    const [appointments, total] = await this.em.findAndCount(
      Appointment,
      where,
      {
        populate: ['patient', 'appointmentType'],
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
      const user = await this.em.findOne('User', { id: userId });
      where.drName = user?.name;
    }

    return this.em.find(Appointment, where, {
      populate: ['patient', 'appointmentType'],
      orderBy: { time: 'ASC' },
    });
  }

  async findOne(id: string, orgId: string, userId: string, role: string) {
    const where: any = { id, orgId };

    if (role === UserRole.DENTIST) {
      const user = await this.em.findOne('User', { id: userId });
      where.drName = user?.name;
    }

    const appointment = await this.em.findOne(Appointment, where, {
      populate: ['patient', 'appointmentType'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async update(id: string, updateDto: UpdateAppointmentDto, orgId: string, userId: string, role: string, updatedBy: string) {
    const appointment = await this.findOne(id, orgId, userId, role);

    this.em.assign(appointment, {
      ...updateDto,
      date: updateDto.date ? new Date(updateDto.date) : appointment.date,
      updatedBy,
    });

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

**File: `src/modules/appointments/appointments.controller.ts`**
```typescript
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { ApiStandardResponse } from '../../common/decorators/api-standard-response.decorator';
import { StandardResponse } from '../../common/dto/standard-response.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ParseUUIDPipe } from '../../common/pipes/parse-uuid.pipe';

@ApiTags('Appointments')
@ApiBearerAuth('JWT-auth')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiStandardResponse(Object, false, 'created')
  async create(
    @Body() createDto: CreateAppointmentDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    const result = await this.appointmentsService.create(createDto, user.orgId, user.id);
    return new StandardResponse(result, 'Appointment created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'Get all appointments (role-based)' })
  @ApiStandardResponse(Object, true)
  async findAll(
    @CurrentUser() user: CurrentUserData,
    @Query() pagination: PaginationDto,
    @Query('date') date?: string,
  ) {
    const result = await this.appointmentsService.findAll(
      user.orgId,
      user.id,
      user.role,
      pagination,
      date,
    );
    return new StandardResponse(result);
  }

  @Get('by-date/:date')
  @ApiOperation({ summary: 'Get appointments by date' })
  @ApiStandardResponse(Object, true)
  async findByDate(
    @Param('date') date: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    const result = await this.appointmentsService.findByDate(date, user.orgId, user.id, user.role);
    return new StandardResponse(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an appointment by ID' })
  @ApiStandardResponse(Object)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    const result = await this.appointmentsService.findOne(id, user.orgId, user.id, user.role);
    return new StandardResponse(result);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  @ApiOperation({ summary: 'Update an appointment' })
  @ApiStandardResponse(Object)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateAppointmentDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    const result = await this.appointmentsService.update(
      id,
      updateDto,
      user.orgId,
      user.id,
      user.role,
      user.id,
    );
    return new StandardResponse(result, 'Appointment updated successfully');
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  @ApiOperation({ summary: 'Delete an appointment' })
  @ApiStandardResponse(Object)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    const result = await this.appointmentsService.remove(id, user.orgId, user.id, user.role);
    return new StandardResponse(result);
  }
}
```

### 4. Create Appointments Module

**File: `src/modules/appointments/appointments.module.ts`**
```typescript
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { Appointment, Patient, AppointmentType, User } from '../../common/entities';

@Module({
  imports: [MikroOrmModule.forFeature([Appointment, Patient, AppointmentType, User])],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
```

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
       "appointmentTypeId": "type-uuid",
       "date": "2024-01-15",
       "time": "14:30",
       "drName": "Dr. Sarah Smith"
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

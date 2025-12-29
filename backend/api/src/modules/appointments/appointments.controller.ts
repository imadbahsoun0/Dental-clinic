import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { FindAppointmentsDto } from './dto/find-appointments.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../common/decorators/current-user.decorator';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { ApiStandardResponse } from '../../common/decorators/api-standard-response.decorator';
import { StandardResponse } from '../../common/dto/standard-response.dto';

@ApiTags('Appointments')
@ApiBearerAuth('JWT-auth')
@Controller('appointments')
export class AppointmentsController {
    constructor(private readonly appointmentsService: AppointmentsService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.SECRETARY)
    @ApiOperation({ summary: 'Create a new appointment' })
    @ApiStandardResponse(Object, false, 'created')
    async create(
        @Body() createAppointmentDto: CreateAppointmentDto,
        @CurrentUser() user: CurrentUserData,
    ) {
        const result = await this.appointmentsService.create(createAppointmentDto, user.orgId, user.id);
        return new StandardResponse(result, 'Appointment created successfully');
    }

    @Get()
    @ApiOperation({ summary: 'List all appointments with role-based filtering' })
    @ApiStandardResponse(Object, true)
    async findAll(
        @Query() query: FindAppointmentsDto,
        @CurrentUser() user: CurrentUserData,
    ) {
        const result = await this.appointmentsService.findAll(
            user.orgId,
            user.id,
            user.role,
            query,
            query.date,
            query.startDate,
            query.endDate
        );
        return new StandardResponse({ data: result.data, meta: result.meta }, 'Appointments retrieved successfully');
    }

    @Get('stats/today')
    @ApiOperation({ summary: 'Get today\'s appointment statistics' })
    @ApiStandardResponse(Object)
    async getTodayStats(@CurrentUser() user: CurrentUserData) {
        const stats = await this.appointmentsService.getTodayStats(user.orgId, user.id, user.role);
        return new StandardResponse(stats);
    }

    @Get('by-date/:date')
    @ApiOperation({ summary: 'Get appointments by specific date' })
    @ApiStandardResponse(Object, true)
    async findByDate(
        @Param('date') date: string,
        @CurrentUser() user: CurrentUserData,
    ) {
        const result = await this.appointmentsService.findByDate(date, user.orgId, user.id, user.role);
        return new StandardResponse(result, 'Appointments retrieved successfully');
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get appointment by ID' })
    @ApiStandardResponse(Object)
    async findOne(
        @Param('id') id: string,
        @CurrentUser() user: CurrentUserData,
    ) {
        const result = await this.appointmentsService.findOne(id, user.orgId, user.id, user.role);
        return new StandardResponse(result);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.SECRETARY)
    @ApiOperation({ summary: 'Update appointment' })
    @ApiStandardResponse(Object)
    async update(
        @Param('id') id: string,
        @Body() updateAppointmentDto: UpdateAppointmentDto,
        @CurrentUser() user: CurrentUserData,
    ) {
        const result = await this.appointmentsService.update(id, updateAppointmentDto, user.orgId, user.id, user.role, user.id);
        return new StandardResponse(result, 'Appointment updated successfully');
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN, UserRole.SECRETARY)
    @ApiOperation({ summary: 'Delete appointment' })
    @ApiStandardResponse(Object)
    async remove(
        @Param('id') id: string,
        @CurrentUser() user: CurrentUserData,
    ) {
        await this.appointmentsService.remove(id, user.orgId, user.id, user.role, user.id);
        return new StandardResponse(null, 'Appointment deleted successfully');
    }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientResponseDto } from './dto/patient-response.dto';
import { PatientQueryDto } from './dto/patient-query.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../common/decorators/current-user.decorator';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { ApiStandardResponse } from '../../common/decorators/api-standard-response.decorator';
import { StandardResponse } from '../../common/dto/standard-response.dto';

@ApiTags('Patients')
@ApiBearerAuth('JWT-auth')
@Controller('patients')
export class PatientsController {
    constructor(private readonly patientsService: PatientsService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.SECRETARY)
    @ApiOperation({ summary: 'Create a new patient' })
    @ApiStandardResponse(PatientResponseDto, false, 'created')
    async create(
        @Body() createPatientDto: CreatePatientDto,
        @CurrentUser() user: CurrentUserData,
    ) {
        const result = await this.patientsService.create(createPatientDto, user.orgId, user.id);
        return new StandardResponse(result, 'Patient created successfully');
    }

    @Get()
    @ApiOperation({ summary: 'List all patients with pagination and filtering' })
    @ApiStandardResponse(PatientResponseDto, true)
    async findAll(
        @Query() query: PatientQueryDto,
        @CurrentUser() user: CurrentUserData,
    ) {
        const { page, limit, ...filter } = query;
        const pagination = { page, limit };
        const result = await this.patientsService.findAll(user.orgId, pagination, filter);
        return new StandardResponse({ data: result.data, meta: result.meta }, 'Patients retrieved successfully');
    }

    @Get('search')
    @ApiOperation({ summary: 'Search patients by name or phone' })
    @ApiStandardResponse(PatientResponseDto, true)
    async search(
        @Query('q') query: string,
        @CurrentUser() user: CurrentUserData,
    ) {
        const result = await this.patientsService.search(query, user.orgId);
        return new StandardResponse(result, 'Patients search results');
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get patient by ID' })
    @ApiStandardResponse(PatientResponseDto)
    async findOne(
        @Param('id') id: string,
        @CurrentUser() user: CurrentUserData,
    ) {
        const result = await this.patientsService.findOne(id, user.orgId);
        return new StandardResponse(result);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.SECRETARY)
    @ApiOperation({ summary: 'Update patient' })
    @ApiStandardResponse(PatientResponseDto)
    async update(
        @Param('id') id: string,
        @Body() updatePatientDto: UpdatePatientDto,
        @CurrentUser() user: CurrentUserData,
    ) {
        const result = await this.patientsService.update(id, updatePatientDto, user.orgId, user.id);
        return new StandardResponse(result, 'Patient updated successfully');
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN, UserRole.SECRETARY)
    @ApiOperation({ summary: 'Delete patient' })
    @ApiStandardResponse(Object)
    async remove(
        @Param('id') id: string,
        @CurrentUser() user: CurrentUserData,
    ) {
        await this.patientsService.remove(id, user.orgId, user.id);
        return new StandardResponse(null, 'Patient deleted successfully');
    }
}

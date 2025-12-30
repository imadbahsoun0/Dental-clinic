import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MedicalHistoryService } from './medical-history.service';
import { CreateMedicalHistoryQuestionDto } from './dto/create-medical-history-question.dto';
import { UpdateMedicalHistoryQuestionDto } from './dto/update-medical-history-question.dto';
import { MedicalHistoryQuestionResponseDto } from './dto/medical-history-question-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../common/decorators/current-user.decorator';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { ApiStandardResponse } from '../../common/decorators/api-standard-response.decorator';
import { StandardResponse } from '../../common/dto/standard-response.dto';
import { ParseUUIDPipe } from '../../common/pipes/parse-uuid.pipe';

@ApiTags('Medical History')
@ApiBearerAuth('JWT-auth')
@Controller('medical-history')
@Roles(UserRole.ADMIN) // Only admins can manage medical history questions
export class MedicalHistoryController {
    constructor(private readonly medicalHistoryService: MedicalHistoryService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new medical history question' })
    @ApiStandardResponse(MedicalHistoryQuestionResponseDto, false, 'created')
    async create(
        @Body() createDto: CreateMedicalHistoryQuestionDto,
        @CurrentUser() user: CurrentUserData,
    ) {
        const result = await this.medicalHistoryService.create(createDto, user.orgId);
        return new StandardResponse(result, 'Medical history question created successfully');
    }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.DENTIST, UserRole.SECRETARY) // All can view questions
    @ApiOperation({ summary: 'Get all medical history questions' })
    @ApiStandardResponse(MedicalHistoryQuestionResponseDto, true)
    async findAll(@CurrentUser() user: CurrentUserData) {
        const result = await this.medicalHistoryService.findAll(user.orgId);
        return new StandardResponse(result);
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.DENTIST, UserRole.SECRETARY)
    @ApiOperation({ summary: 'Get a medical history question by ID' })
    @ApiStandardResponse(MedicalHistoryQuestionResponseDto)
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: CurrentUserData,
    ) {
        const result = await this.medicalHistoryService.findOne(id, user.orgId);
        return new StandardResponse(result);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a medical history question' })
    @ApiStandardResponse(MedicalHistoryQuestionResponseDto)
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateDto: UpdateMedicalHistoryQuestionDto,
        @CurrentUser() user: CurrentUserData,
    ) {
        const result = await this.medicalHistoryService.update(id, user.orgId, updateDto);
        return new StandardResponse(result, 'Medical history question updated successfully');
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a medical history question' })
    @ApiStandardResponse(Object)
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: CurrentUserData,
    ) {
        const result = await this.medicalHistoryService.remove(id, user.orgId);
        return new StandardResponse(result);
    }
}

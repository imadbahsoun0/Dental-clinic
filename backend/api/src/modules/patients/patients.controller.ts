import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientResponseDto } from './dto/patient-response.dto';
import { PatientQueryDto } from './dto/patient-query.dto';
import { SubmitMedicalHistoryDto } from './dto/submit-medical-history.dto';
import { MedicalHistorySubmissionResponseDto } from './dto/medical-history-submission-response.dto';
import { UpdatePatientMedicalHistoryDto } from './dto/update-patient-medical-history.dto';
import { MedicalHistoryAuditResponseDto } from './dto/medical-history-audit-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../common/decorators/current-user.decorator';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ApiStandardResponse } from '../../common/decorators/api-standard-response.decorator';
import { StandardResponse } from '../../common/dto/standard-response.dto';

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
  @ApiOperation({ summary: 'List all patients with pagination and filtering' })
  @ApiStandardResponse(PatientResponseDto, true)
  async findAll(
    @Query() query: PatientQueryDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    const { page, limit, ...filter } = query;
    const pagination = { page, limit };
    const result = await this.patientsService.findAll(
      user.orgId,
      pagination,
      filter,
    );
    return new StandardResponse(
      { data: result.data, meta: result.meta },
      'Patients retrieved successfully',
    );
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

  @Get('follow-ups')
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  @ApiOperation({ summary: 'Get patients with follow-ups by status' })
  @ApiStandardResponse(PatientResponseDto, true)
  async getFollowUps(
    @Query() query: PatientQueryDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    const { page, limit, ...filter } = query;
    const pagination = { page, limit };
    const result = await this.patientsService.getPatientsWithFollowUps(
      user.orgId,
      pagination,
      filter,
    );
    return new StandardResponse(
      { data: result.data, meta: result.meta },
      'Follow-ups retrieved successfully',
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get patient by ID' })
  @ApiStandardResponse(PatientResponseDto)
  async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
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
  @ApiOperation({ summary: 'Delete patient' })
  @ApiStandardResponse(Object)
  async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    await this.patientsService.remove(id, user.orgId, user.id);
    return new StandardResponse(null, 'Patient deleted successfully');
  }

  @Public()
  @Post(':id/medical-history')
  @ApiOperation({
    summary: 'Submit medical history for a patient (public - no auth required)',
  })
  @ApiStandardResponse(MedicalHistorySubmissionResponseDto, false, 'created')
  async submitMedicalHistory(
    @Param('id') id: string,
    @Body() submitDto: SubmitMedicalHistoryDto,
  ) {
    const result = await this.patientsService.submitMedicalHistory(
      id,
      submitDto,
    );
    return new StandardResponse(
      result,
      'Medical history submitted successfully',
    );
  }

  @Public()
  @Get(':id/medical-history')
  @ApiOperation({
    summary:
      'Get medical history submission for a patient (public - no auth required)',
  })
  @ApiStandardResponse(MedicalHistorySubmissionResponseDto)
  async getMedicalHistory(@Param('id') id: string) {
    const result = await this.patientsService.getMedicalHistory(id);
    return new StandardResponse(result);
  }

  @Post('migrate/medical-history-question-text')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Migrate existing medical history to include question text',
  })
  @ApiStandardResponse(Object)
  async migrateMedicalHistoryQuestionText(
    @CurrentUser() user: CurrentUserData,
  ) {
    const result =
      await this.patientsService.updateMedicalHistoryWithQuestionText(
        user.orgId,
      );
    return new StandardResponse(result, result.message);
  }

  @Get('unpaid/list')
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  @ApiOperation({ summary: 'Get patients with unpaid balances' })
  @ApiStandardResponse(Object, true)
  async getUnpaidPatients(
    @Query() query: PatientQueryDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    const { page, limit } = query;
    const pagination = { page, limit };
    const result = await this.patientsService.getUnpaidPatients(
      user.orgId,
      pagination,
    );
    return new StandardResponse(
      { data: result.data, meta: result.meta },
      'Unpaid patients retrieved successfully',
    );
  }

  @Post(':id/send-medical-history')
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  @ApiOperation({ summary: 'Manually send medical history link to patient' })
  @ApiStandardResponse(Object)
  async sendMedicalHistoryReminder(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    const result = await this.patientsService.sendMedicalHistoryReminder(
      id,
      user.orgId,
    );
    return new StandardResponse(result, result.message);
  }

  @Post(':id/send-follow-up')
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  @ApiOperation({ summary: 'Send follow-up reminder to patient' })
  @ApiStandardResponse(Object)
  async sendFollowUpReminder(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    const result = await this.patientsService.sendFollowUpReminder(
      id,
      user.orgId,
    );
    return new StandardResponse(result, result.message);
  }

  @Post(':id/send-payment-overdue')
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  @ApiOperation({ summary: 'Send payment overdue reminder to patient' })
  @ApiStandardResponse(Object)
  async sendPaymentOverdueReminder(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    const result = await this.patientsService.sendPaymentOverdueReminder(
      id,
      user.orgId,
    );
    return new StandardResponse(result, result.message);
  }

  @Patch(':id/medical-history')
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  @ApiOperation({
    summary: 'Update patient medical history (with audit trail)',
  })
  @ApiStandardResponse(MedicalHistorySubmissionResponseDto)
  async updateMedicalHistory(
    @Param('id') id: string,
    @Body() updateDto: UpdatePatientMedicalHistoryDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    const result = await this.patientsService.updateMedicalHistory(
      id,
      updateDto,
      user.orgId,
      user.id,
    );
    return new StandardResponse(result, 'Medical history updated successfully');
  }

  @Get(':id/medical-history/audit')
  @Roles(UserRole.ADMIN, UserRole.SECRETARY, UserRole.DENTIST)
  @ApiOperation({ summary: 'Get medical history audit trail for a patient' })
  @ApiStandardResponse(MedicalHistoryAuditResponseDto, true)
  async getMedicalHistoryAudit(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    const result = await this.patientsService.getMedicalHistoryAudit(
      id,
      user.orgId,
    );
    return new StandardResponse(
      result,
      'Medical history audit retrieved successfully',
    );
  }
}

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
import { TreatmentsService } from './treatments.service';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';
import { TreatmentQueryDto } from './dto/treatment-query.dto';
import { TreatmentResponseDto } from './dto/treatment-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../common/decorators/current-user.decorator';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { ApiStandardResponse } from '../../common/decorators/api-standard-response.decorator';
import { StandardResponse } from '../../common/dto/standard-response.dto';

@ApiTags('Treatments')
@ApiBearerAuth('JWT-auth')
@Controller('treatments')
export class TreatmentsController {
  constructor(private readonly treatmentsService: TreatmentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SECRETARY, UserRole.DENTIST)
  @ApiOperation({ summary: 'Create a new treatment' })
  @ApiStandardResponse(TreatmentResponseDto, false, 'created')
  async create(
    @Body() createTreatmentDto: CreateTreatmentDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    const result = await this.treatmentsService.create(
      createTreatmentDto,
      user.orgId,
      user.id,
    );
    return new StandardResponse(result, 'Treatment created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'List all treatments with role-based filtering' })
  @ApiStandardResponse(TreatmentResponseDto, true)
  async findAll(
    @Query() query: TreatmentQueryDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    const result = await this.treatmentsService.findAll(
      user.orgId,
      user.id,
      user.role,
      query,
    );
    return new StandardResponse(
      { data: result.data, meta: result.meta },
      'Treatments retrieved successfully',
    );
  }

  @Get('patient/:patientId/stats')
  @ApiOperation({ summary: 'Get treatment statistics for a patient' })
  @ApiStandardResponse(Object)
  async getPatientStats(
    @Param('patientId') patientId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    const stats = await this.treatmentsService.getPatientTreatmentStats(
      patientId,
      user.orgId,
    );
    return new StandardResponse(stats);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get treatment by ID' })
  @ApiStandardResponse(TreatmentResponseDto)
  async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    const result = await this.treatmentsService.findOne(
      id,
      user.orgId,
      user.id,
      user.role,
    );
    return new StandardResponse(result);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SECRETARY, UserRole.DENTIST)
  @ApiOperation({ summary: 'Update treatment' })
  @ApiStandardResponse(TreatmentResponseDto)
  async update(
    @Param('id') id: string,
    @Body() updateTreatmentDto: UpdateTreatmentDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    const result = await this.treatmentsService.update(
      id,
      updateTreatmentDto,
      user.orgId,
      user.id,
      user.role,
      user.id,
    );
    return new StandardResponse(result, 'Treatment updated successfully');
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SECRETARY, UserRole.DENTIST)
  @ApiOperation({ summary: 'Delete treatment' })
  @ApiStandardResponse(Object)
  async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    await this.treatmentsService.remove(
      id,
      user.orgId,
      user.id,
      user.role,
      user.id,
    );
    return new StandardResponse(null, 'Treatment deleted successfully');
  }
}

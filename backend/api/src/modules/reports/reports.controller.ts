import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiStandardResponse } from '../../common/decorators/api-standard-response.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../common/decorators/current-user.decorator';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { StandardResponse } from '../../common/dto/standard-response.dto';
import { ReportsService } from './reports.service';
import { IncomeReportQueryDto } from './dto/income-report-query.dto';
import { IncomeReportDto } from './dto/income-report.dto';
import { IncomePeriodDetailsQueryDto } from './dto/income-period-details-query.dto';
import { IncomePeriodDetailsDto } from './dto/income-period-details.dto';
import { TreatmentReportQueryDto } from './dto/treatment-report-query.dto';
import { TreatmentReportDto } from './dto/treatment-report.dto';

@ApiTags('Reports')
@ApiBearerAuth('JWT-auth')
@Controller('reports')
@Roles(UserRole.ADMIN)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('income')
  @ApiOperation({
    summary: 'Income report (payments - expenses) grouped by day/month',
  })
  @ApiStandardResponse(IncomeReportDto)
  async getIncomeReport(
    @CurrentUser() user: CurrentUserData,
    @Query() query: IncomeReportQueryDto,
  ) {
    const report = await this.reportsService.getIncomeReport(user.orgId, query);
    return new StandardResponse(report, 'Income report retrieved successfully');
  }

  @Get('income/details')
  @ApiOperation({
    summary:
      'Income report period details (payments + expenses) for a specific day/month period key',
  })
  @ApiStandardResponse(IncomePeriodDetailsDto)
  async getIncomePeriodDetails(
    @CurrentUser() user: CurrentUserData,
    @Query() query: IncomePeriodDetailsQueryDto,
  ) {
    const report = await this.reportsService.getIncomePeriodDetails(user.orgId, query);
    return new StandardResponse(report, 'Income period details retrieved successfully');
  }

  @Get('treatments')
  @ApiOperation({ summary: 'Treatment report (counts and values) for the org' })
  @ApiStandardResponse(TreatmentReportDto)
  async getTreatmentReport(
    @CurrentUser() user: CurrentUserData,
    @Query() query: TreatmentReportQueryDto,
  ) {
    const report = await this.reportsService.getTreatmentReport(user.orgId, query);
    return new StandardResponse(report, 'Treatment report retrieved successfully');
  }
}

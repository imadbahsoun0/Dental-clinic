import { Controller, Get, Patch, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { PendingTreatmentDto } from './dto/pending-treatment.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../common/decorators/current-user.decorator';
import { ApiStandardResponse } from '../../common/decorators/api-standard-response.decorator';
import { StandardResponse } from '../../common/dto/standard-response.dto';
import { TreatmentsService } from '../treatments/treatments.service';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { TreatmentStatus } from '../../common/entities/treatment.entity';

@ApiTags('Dashboard')
@ApiBearerAuth('JWT-auth')
@Controller('dashboard')
export class DashboardController {
    constructor(
        private readonly dashboardService: DashboardService,
        private readonly treatmentsService: TreatmentsService,
    ) { }

    @Get('stats')
    @ApiOperation({ summary: 'Get dashboard statistics' })
    @ApiStandardResponse(DashboardStatsDto)
    async getStats(@CurrentUser() user: CurrentUserData) {
        const stats = await this.dashboardService.getDashboardStats(user.orgId);
        return new StandardResponse(stats, 'Dashboard stats retrieved successfully');
    }

    @Get('pending-treatments')
    @ApiOperation({ summary: 'Get all pending treatments' })
    @ApiStandardResponse(PendingTreatmentDto, true)
    async getPendingTreatments(@CurrentUser() user: CurrentUserData) {
        const treatments = await this.dashboardService.getPendingTreatments(user.orgId);
        return new StandardResponse(treatments, 'Pending treatments retrieved successfully');
    }

    @Patch('pending-treatments/:id/cancel')
    @Roles(UserRole.ADMIN, UserRole.SECRETARY, UserRole.DENTIST)
    @ApiOperation({ summary: 'Cancel a pending treatment' })
    @ApiStandardResponse(Object)
    async cancelPendingTreatment(
        @Param('id') id: string,
        @CurrentUser() user: CurrentUserData,
    ) {
        // Use the treatments service to update the status to cancelled
        const result = await this.treatmentsService.update(
            id,
            { status: TreatmentStatus.CANCELLED },
            user.orgId,
            user.id,
            user.role,
            user.id
        );
        return new StandardResponse(result, 'Treatment cancelled successfully');
    }
}

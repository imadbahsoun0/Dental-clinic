import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentQueryDto } from './dto/payment-query.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../common/decorators/current-user.decorator';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { ApiStandardResponse } from '../../common/decorators/api-standard-response.decorator';
import { StandardResponse } from '../../common/dto/standard-response.dto';

@ApiTags('Payments')
@ApiBearerAuth('JWT-auth')
@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.SECRETARY)
    @ApiOperation({ summary: 'Create a new payment' })
    @ApiStandardResponse(PaymentResponseDto, false, 'created')
    async create(
        @Body() createPaymentDto: CreatePaymentDto,
        @CurrentUser() user: CurrentUserData,
    ) {
        const result = await this.paymentsService.create(createPaymentDto, user.orgId, user.id);
        return new StandardResponse(result, 'Payment created successfully');
    }

    @Get()
    @ApiOperation({ summary: 'List all payments with filtering' })
    @ApiStandardResponse(PaymentResponseDto, true)
    async findAll(
        @Query() query: PaymentQueryDto,
        @CurrentUser() user: CurrentUserData,
    ) {
        const result = await this.paymentsService.findAll(
            user.orgId,
            user.id,
            user.role,
            query,
        );
        return new StandardResponse({ data: result.data, meta: result.meta }, 'Payments retrieved successfully');
    }

    @Get('patient/:patientId/stats')
    @ApiOperation({ summary: 'Get payment statistics for a patient' })
    @ApiStandardResponse(Object)
    async getPatientStats(
        @Param('patientId') patientId: string,
        @CurrentUser() user: CurrentUserData,
    ) {
        const stats = await this.paymentsService.getPatientPaymentStats(patientId, user.orgId);
        return new StandardResponse(stats);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get payment by ID' })
    @ApiStandardResponse(PaymentResponseDto)
    async findOne(
        @Param('id') id: string,
        @CurrentUser() user: CurrentUserData,
    ) {
        const result = await this.paymentsService.findOne(id, user.orgId, user.id, user.role);
        return new StandardResponse(result);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.SECRETARY)
    @ApiOperation({ summary: 'Update payment' })
    @ApiStandardResponse(PaymentResponseDto)
    async update(
        @Param('id') id: string,
        @Body() updatePaymentDto: UpdatePaymentDto,
        @CurrentUser() user: CurrentUserData,
    ) {
        const result = await this.paymentsService.update(id, updatePaymentDto, user.orgId, user.id, user.role, user.id);
        return new StandardResponse(result, 'Payment updated successfully');
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN, UserRole.SECRETARY)
    @ApiOperation({ summary: 'Delete payment' })
    @ApiStandardResponse(Object)
    async remove(
        @Param('id') id: string,
        @CurrentUser() user: CurrentUserData,
    ) {
        await this.paymentsService.remove(id, user.orgId, user.id, user.role, user.id);
        return new StandardResponse(null, 'Payment deleted successfully');
    }

    @Post(':id/send-receipt')
    @Roles(UserRole.ADMIN, UserRole.SECRETARY)
    @ApiOperation({ summary: 'Manually send payment receipt to patient' })
    @ApiStandardResponse(Object)
    async sendPaymentReceipt(
        @Param('id') id: string,
        @CurrentUser() user: CurrentUserData,
    ) {
        const result = await this.paymentsService.sendPaymentReceipt(id, user.orgId);
        return new StandardResponse(result, result.message);
    }
}

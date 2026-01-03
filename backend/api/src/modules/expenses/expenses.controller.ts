import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseQueryDto } from './dto/expense-query.dto';
import { ProcessDoctorPaymentDto } from './dto/process-doctor-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { StandardResponse } from '../../common/dto/standard-response.dto';
import type { CurrentUserData } from '../../common/decorators/current-user.decorator';

interface JwtPayload {
  sub: string;
  email: string;
  orgId: string;
  role: UserRole;
}

@ApiTags('Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  @ApiOperation({ summary: 'Create a new expense' })
  async create(
    @Body() createDto: CreateExpenseDto,
    @CurrentUser() user: CurrentUserData,
  ): Promise<StandardResponse> {
    const data = await this.expensesService.create(
      createDto,
      user.orgId,
      user.id,
    );
    return new StandardResponse(data, 'Expense created successfully');
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  @ApiOperation({ summary: 'Get all expenses with filtering and pagination' })
  async findAll(
    @Query() query: ExpenseQueryDto,
    @CurrentUser() user: CurrentUserData,
  ): Promise<StandardResponse> {
    const result = await this.expensesService.findAll(
      user.orgId,
      query,
      user.id,
      user.role,
    );
    return new StandardResponse(
      { data: result.data, meta: result.meta },
      'Expenses retrieved successfully',
    );
  }

  @Get('total')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get total expenses by date range' })
  async getTotalByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<StandardResponse> {
    const data = await this.expensesService.getTotalByDateRange(
      user.orgId,
      startDate,
      endDate,
    );
    return new StandardResponse(data, 'Total expenses calculated successfully');
  }

  @Get('doctor/:doctorId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get total expenses for a doctor' })
  async getTotalByDoctor(
    @Param('doctorId') doctorId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @CurrentUser() user?: CurrentUserData,
  ): Promise<StandardResponse> {
    const data = await this.expensesService.getTotalByDoctor(
      user!.orgId,
      doctorId,
      startDate,
      endDate,
    );
    return new StandardResponse(
      data,
      'Doctor expenses calculated successfully',
    );
  }

  @Post('doctor-payment')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Process doctor payment from wallet' })
  async processDoctorPayment(
    @Body() body: ProcessDoctorPaymentDto,
    @CurrentUser() user: CurrentUserData,
  ): Promise<StandardResponse> {
    const data = await this.expensesService.processDoctorPayment(
      user.orgId,
      body.doctorId,
      body.amount,
      body.notes,
      user.id,
    );
    return new StandardResponse(data, 'Doctor payment processed successfully');
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  @ApiOperation({ summary: 'Get a single expense by ID' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<StandardResponse> {
    const data = await this.expensesService.findOne(
      id,
      user.orgId,
      user.id,
      user.role,
    );
    return new StandardResponse(data, 'Expense retrieved successfully');
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  @ApiOperation({ summary: 'Update an expense' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateExpenseDto,
    @CurrentUser() user: CurrentUserData,
  ): Promise<StandardResponse> {
    const data = await this.expensesService.update(
      id,
      updateDto,
      user.orgId,
      user.id,
      user.role,
    );
    return new StandardResponse(data, 'Expense updated successfully');
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete an expense (soft delete)' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<StandardResponse> {
    const data = await this.expensesService.remove(id, user.orgId);
    return new StandardResponse(undefined, data.message);
  }
}

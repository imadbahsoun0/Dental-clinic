import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Expense, ExpenseType } from '../../common/entities/expense.entity';
import { UserOrganization } from '../../common/entities/user-organization.entity';
import { User } from '../../common/entities/user.entity';
import { Attachment } from '../../common/entities/attachment.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseQueryDto } from './dto/expense-query.dto';

@Injectable()
export class ExpensesService {
    constructor(private em: EntityManager) { }

    async create(createDto: CreateExpenseDto, orgId: string, createdBy: string) {
        const expense = this.em.create(Expense, {
            name: createDto.name,
            amount: createDto.amount,
            date: new Date(createDto.date),
            expenseType: createDto.expenseType || ExpenseType.OTHER,
            notes: createDto.notes,
            orgId,
            createdBy,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        if (createDto.invoiceId) {
            expense.invoice = this.em.getReference(Attachment, createDto.invoiceId);
        }

        if (createDto.doctorId) {
            expense.doctor = this.em.getReference(User, createDto.doctorId);
        }

        await this.em.persistAndFlush(expense);
        return this.mapToResponse(expense);
    }

    async findAll(orgId: string, query: ExpenseQueryDto) {
        const { page = 1, limit = 10, startDate, endDate, doctorId, expenseType } = query;
        const offset = (page - 1) * limit;

        const where: any = { orgId, deletedAt: null };

        if (startDate && endDate) {
            where.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        } else if (startDate) {
            where.date = { $gte: new Date(startDate) };
        } else if (endDate) {
            where.date = { $lte: new Date(endDate) };
        }

        if (doctorId) {
            where.doctor = { id: doctorId };
        }

        if (expenseType) {
            where.expenseType = expenseType;
        }

        const [expenses, total] = await this.em.findAndCount(
            Expense,
            where,
            {
                populate: ['invoice', 'doctor'],
                limit,
                offset,
                orderBy: { date: 'DESC', createdAt: 'DESC' },
            },
        );

        return {
            data: expenses.map((e) => this.mapToResponse(e)),
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async findOne(id: string, orgId: string) {
        const expense = await this.em.findOne(
            Expense,
            { id, orgId, deletedAt: null },
            { populate: ['invoice', 'doctor'] },
        );

        if (!expense) {
            throw new NotFoundException('Expense not found');
        }

        return this.mapToResponse(expense);
    }

    async update(id: string, updateDto: UpdateExpenseDto, orgId: string) {
        const expense = await this.em.findOne(
            Expense,
            { id, orgId, deletedAt: null },
            { populate: ['invoice', 'doctor'] },
        );

        if (!expense) {
            throw new NotFoundException('Expense not found');
        }

        const { invoiceId, doctorId, ...updateData } = updateDto;

        this.em.assign(expense, {
            ...updateData,
            date: updateDto.date ? new Date(updateDto.date) : expense.date,
            updatedAt: new Date(),
        });

        if (invoiceId !== undefined) {
            expense.invoice = invoiceId ? this.em.getReference(Attachment, invoiceId) : undefined;
        }

        if (doctorId !== undefined) {
            expense.doctor = doctorId ? this.em.getReference(User, doctorId) : undefined;
        }

        await this.em.flush();
        return this.mapToResponse(expense);
    }

    async remove(id: string, orgId: string) {
        const expense = await this.em.findOne(Expense, { id, orgId, deletedAt: null });

        if (!expense) {
            throw new NotFoundException('Expense not found');
        }

        // Soft delete
        expense.deletedAt = new Date();
        await this.em.flush();

        return { message: 'Expense deleted successfully' };
    }

    async getTotalByDateRange(orgId: string, startDate: string, endDate: string) {
        const expenses = await this.em.find(Expense, {
            orgId,
            deletedAt: null,
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            },
        });

        const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

        return { total, count: expenses.length };
    }

    async getTotalByDoctor(orgId: string, doctorId: string, startDate?: string, endDate?: string) {
        const where: any = {
            orgId,
            deletedAt: null,
            doctor: { id: doctorId },
        };

        if (startDate && endDate) {
            where.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        const expenses = await this.em.find(Expense, where);
        const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

        return { total, count: expenses.length };
    }

    async processDoctorPayment(
        orgId: string,
        doctorId: string,
        amount: number,
        notes: string,
        createdBy: string,
    ) {
        // Find doctor's organization membership
        const userOrg = await this.em.findOne(UserOrganization, {
            user: { id: doctorId },
            orgId,
        });

        if (!userOrg) {
            throw new NotFoundException('Doctor not found in this organization');
        }

        // Check wallet balance
        if ((userOrg.wallet || 0) < amount) {
            throw new BadRequestException('Insufficient wallet balance');
        }

        // Deduct from wallet
        userOrg.wallet = (userOrg.wallet || 0) - amount;

        // Create expense record for the payment
        const expense = this.em.create(Expense, {
            name: `Doctor Payment - ${notes}`,
            amount,
            date: new Date(),
            expenseType: ExpenseType.DOCTOR_PAYMENT,
            notes,
            doctor: this.em.getReference(User, doctorId),
            orgId,
            createdBy,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        this.em.persist(expense);
        await this.em.flush();

        return {
            expense: this.mapToResponse(expense),
            newWalletBalance: userOrg.wallet,
        };
    }

    private mapToResponse(expense: Expense) {
        return {
            id: expense.id,
            name: expense.name,
            amount: Number(expense.amount),
            date: expense.date,
            expenseType: expense.expenseType,
            notes: expense.notes,
            invoice: expense.invoice
                ? { id: expense.invoice.id, filename: expense.invoice.filename }
                : null,
            doctor: expense.doctor
                ? { id: expense.doctor.id, name: expense.doctor.name }
                : null,
            createdAt: expense.createdAt,
            updatedAt: expense.updatedAt,
        };
    }
}

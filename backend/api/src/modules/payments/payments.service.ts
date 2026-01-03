import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Payment, Treatment } from '../../common/entities';
import { TreatmentStatus } from '../../common/entities/treatment.entity';
import { UserRole } from '../../common/decorators/roles.decorator';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentQueryDto } from './dto/payment-query.dto';
import { ReminderService } from '../reminders/reminder.service';

@Injectable()
export class PaymentsService {
  constructor(
    private em: EntityManager,
    private reminderService: ReminderService,
  ) {}

    async create(createDto: CreatePaymentDto, orgId: string, createdBy: string) {
        const payment = this.em.create(Payment, {
            amount: createDto.amount,
            date: new Date(createDto.date),
            paymentMethod: createDto.paymentMethod,
            ...(createDto.notes && { notes: createDto.notes }),
            orgId,
            createdBy,
            patient: this.em.getReference('Patient', createDto.patientId) as any,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await this.em.persistAndFlush(payment);
        
        // Calculate remaining balance and send receipt
        try {
            const remainingBalance = await this.calculateRemainingBalance(createDto.patientId, orgId);
            await this.reminderService.sendPaymentReceipt(
                createDto.patientId,
                payment.id,
                createDto.amount,
                remainingBalance,
                orgId,
            );
        } catch (error) {
            // Log error but don't fail payment creation
            console.error('Failed to send payment receipt:', error);
        }
        
        return this.findOne(payment.id, orgId, createdBy, UserRole.ADMIN);
    }

    /**
     * Calculate remaining balance for a patient
     */
    private async calculateRemainingBalance(patientId: string, orgId: string): Promise<number> {
        // Get all completed treatments
        const completedTreatments = await this.em.find(Treatment, {
            patient: patientId,
            orgId,
            status: TreatmentStatus.COMPLETED,
            deletedAt: null,
        });

        const totalTreatmentCost = completedTreatments.reduce((sum, t) => {
            return sum + (Number(t.totalPrice) - Number(t.discount));
        }, 0);

        // Get total payments
        const payments = await this.em.find(Payment, {
            patient: patientId,
            orgId,
            deletedAt: null,
        });

        const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);

        return totalTreatmentCost - totalPaid;
    }

    async findAll(
        orgId: string,
        userId: string,
        role: string,
        query: PaymentQueryDto,
    ) {
        const { page = 1, limit = 10, patientId, startDate, endDate } = query;
        const offset = (page - 1) * limit;

        const where: any = { orgId, deletedAt: null };

        // Apply filters
        if (patientId) {
            where.patient = { id: patientId };
        }

        // Filter by date range
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

        const [payments, total] = await this.em.findAndCount(
            Payment,
            where,
            {
                populate: ['patient'],
                limit,
                offset,
                orderBy: { date: 'DESC', createdAt: 'DESC' },
            },
        );

        // Transform to match frontend expectations
        const transformedPayments = payments.map(p => this.transformPayment(p));

        return {
            data: transformedPayments,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async findOne(id: string, orgId: string, userId: string, role: string) {
        const where: any = { id, orgId, deletedAt: null };

        const payment = await this.em.findOne(Payment, where, {
            populate: ['patient'],
        });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        return this.transformPayment(payment);
    }

    async update(id: string, updateDto: UpdatePaymentDto, orgId: string, userId: string, role: string, updatedBy: string) {
        const payment = await this.em.findOne(Payment, { id, orgId, deletedAt: null });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        const { patientId, ...updateData } = updateDto;

        // Update basic fields
        this.em.assign(payment, {
            ...updateData,
            ...(updateDto.date && { date: new Date(updateDto.date) }),
            updatedBy,
            updatedAt: new Date(),
        });

        // Update patient if provided
        if (patientId) {
            payment.patient = this.em.getReference('Patient', patientId) as any;
        }

        await this.em.flush();
        return this.findOne(id, orgId, userId, role);
    }

    async remove(id: string, orgId: string, userId: string, role: string, deletedBy: string) {
        const payment = await this.em.findOne(Payment, { id, orgId, deletedAt: null });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        // Soft delete
        payment.deletedAt = new Date();
        payment.deletedBy = deletedBy;

        await this.em.flush();
        return { message: 'Payment deleted successfully' };
    }

    async getPatientPaymentStats(patientId: string, orgId: string) {
        const payments = await this.em.find(Payment, {
            patient: { id: patientId },
            orgId,
            deletedAt: null,
        });

        const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        const paymentCount = payments.length;

        return {
            totalPaid,
            paymentCount,
            lastPaymentDate: payments.length > 0
                ? payments.sort((a, b) => b.date.getTime() - a.date.getTime())[0].date.toISOString()
                : null,
        };
    }

    private transformPayment(payment: Payment) {
        return {
            id: payment.id,
            patientId: payment.patient.id,
            patient: {
                id: payment.patient.id,
                firstName: payment.patient.firstName,
                lastName: payment.patient.lastName,
            },
            amount: Number(payment.amount),
            date: payment.date.toISOString(),
            paymentMethod: payment.paymentMethod,
            notes: payment.notes,
            createdAt: payment.createdAt.toISOString(),
            updatedAt: payment.updatedAt.toISOString(),
        };
    }

    /**
     * Manually send payment receipt
     */
    async sendPaymentReceipt(paymentId: string, orgId: string) {
        const payment = await this.em.findOneOrFail(
            Payment,
            { id: paymentId, orgId, deletedAt: null },
            { populate: ['patient'] },
        );

        const remainingBalance = await this.calculateRemainingBalance(
            payment.patient.id,
            orgId,
        );

        await this.reminderService.sendPaymentReceipt(
            payment.patient.id,
            paymentId,
            Number(payment.amount),
            remainingBalance,
            orgId,
        );

        return { message: 'Payment receipt sent successfully' };
    }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Appointment, AppointmentStatus } from '../../common/entities';
import { UserRole } from '../../common/decorators/roles.decorator';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class AppointmentsService {
    constructor(private em: EntityManager) { }

    /**
     * Parse date string to UTC date to avoid timezone issues
     */
    private parseDate(dateString: string): Date {
        const dateParts = dateString.split('-');
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; // months are 0-indexed
        const day = parseInt(dateParts[2], 10);
        return new Date(Date.UTC(year, month, day));
    }

    async create(createDto: CreateAppointmentDto, orgId: string, createdBy: string) {
        const appointmentDate = this.parseDate(createDto.date);

        const appointment = this.em.create(Appointment, {
            date: appointmentDate,
            time: createDto.time,
            status: AppointmentStatus.PENDING, // Always set to PENDING on creation
            ...(createDto.notes && { notes: createDto.notes }),
            orgId,
            createdBy,
            patient: this.em.getReference('Patient', createDto.patientId) as any,
            treatmentType: createDto.treatmentTypeId ? (this.em.getReference('TreatmentType', createDto.treatmentTypeId) as any) : undefined,
            doctor: this.em.getReference('User', createDto.doctorId) as any,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await this.em.persistAndFlush(appointment);
        return this.findOne(appointment.id, orgId, createdBy, UserRole.ADMIN);
    }

    async findAll(
        orgId: string,
        userId: string,
        role: string,
        pagination: PaginationDto,
        date?: string,
        startDate?: string,
        endDate?: string,
        patientId?: string,
    ) {
        const { page = 1, limit = 10 } = pagination;
        const offset = (page - 1) * limit;

        const where: any = { orgId, deletedAt: null };

        // Dentists can only see their own appointments
        if (role === UserRole.DENTIST) {
            where.doctor = { id: userId };
        }

        // Filter by patient
        if (patientId) {
            where.patient = { id: patientId };
        }

        // Filter by date if provided (exact date takes precedence)
        if (date) {
            where.date = this.parseDate(date);
        } else if (startDate && endDate) {
            where.date = {
                $gte: this.parseDate(startDate),
                $lte: this.parseDate(endDate),
            };
        }

        const [appointments, total] = await this.em.findAndCount(
            Appointment,
            where,
            {
                populate: ['patient', 'treatmentType', 'doctor'],
                limit,
                offset,
                orderBy: { date: 'DESC', time: 'DESC' },
            },
        );

        return {
            data: appointments,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async findByDate(date: string, orgId: string, userId: string, role: string) {
        const where: any = { orgId, date: this.parseDate(date), deletedAt: null };

        if (role === UserRole.DENTIST) {
            where.doctor = { id: userId };
        }

        return this.em.find(Appointment, where, {
            populate: ['patient', 'treatmentType', 'doctor'],
            orderBy: { time: 'ASC' },
        });
    }

    async getTodayStats(orgId: string, userId: string, role: string) {
        const todayStr = new Date().toISOString().split('T')[0];
        const where: any = { orgId, date: this.parseDate(todayStr), deletedAt: null };

        if (role === UserRole.DENTIST) {
            where.doctor = { id: userId };
        }

        const count = await this.em.count(Appointment, where);
        return { count };
    }

    async findOne(id: string, orgId: string, userId: string, role: string) {
        const where: any = { id, orgId, deletedAt: null };

        if (role === UserRole.DENTIST) {
            where.doctor = { id: userId };
        }

        const appointment = await this.em.findOne(Appointment, where, {
            populate: ['patient', 'treatmentType', 'doctor'],
        });

        if (!appointment) {
            throw new NotFoundException('Appointment not found');
        }

        return appointment;
    }

    async update(id: string, updateDto: UpdateAppointmentDto, orgId: string, userId: string, role: string, updatedBy: string) {
        const appointment = await this.findOne(id, orgId, userId, role);

        const { patientId, treatmentTypeId, doctorId, ...updateData } = updateDto;

        this.em.assign(appointment, {
            ...updateData,
            date: updateDto.date ? this.parseDate(updateDto.date) : appointment.date,
            updatedBy,
        });

        // Update relations if provided
        if (patientId) {
            appointment.patient = this.em.getReference('Patient', patientId) as any;
        }
        if (treatmentTypeId) {
            appointment.treatmentType = this.em.getReference('TreatmentType', treatmentTypeId) as any;
        }
        if (doctorId) {
            appointment.doctor = this.em.getReference('User', doctorId) as any;
        }

        await this.em.flush();
        return appointment;
    }

    async remove(id: string, orgId: string, userId: string, role: string, deletedBy: string) {
        const appointment = await this.findOne(id, orgId, userId, role);

        // Soft delete
        appointment.deletedAt = new Date();
        appointment.deletedBy = deletedBy;

        await this.em.flush();
        return { message: 'Appointment deleted successfully' };
    }
}

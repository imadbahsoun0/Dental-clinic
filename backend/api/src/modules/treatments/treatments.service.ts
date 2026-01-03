import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Treatment, TreatmentStatus, Tooth, UserOrganization } from '../../common/entities';
import { UserRole } from '../../common/decorators/roles.decorator';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';
import { TreatmentQueryDto } from './dto/treatment-query.dto';

@Injectable()
export class TreatmentsService {
    constructor(private em: EntityManager) { }

    async create(createDto: CreateTreatmentDto, orgId: string, createdBy: string) {
        // Validate that appointment is provided for non-planned treatments
        if (createDto.status && createDto.status !== TreatmentStatus.PLANNED && !createDto.appointmentId) {
            throw new BadRequestException('Appointment is required for non-planned treatments');
        }

        // Create treatment
        const treatment = this.em.create(Treatment, {
            totalPrice: createDto.totalPrice,
            discount: createDto.discount || 0,
            status: createDto.status || TreatmentStatus.PLANNED,
            ...(createDto.notes && { notes: createDto.notes }),
            orgId,
            createdBy,
            patient: this.em.getReference('Patient', createDto.patientId) as any,
            treatmentType: this.em.getReference('TreatmentType', createDto.treatmentTypeId) as any,
            ...(createDto.appointmentId && {
                appointment: this.em.getReference('Appointment', createDto.appointmentId) as any
            }),
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Add teeth
        for (const toothNumber of createDto.toothNumbers) {
            const tooth = await this.em.findOne(Tooth, { number: toothNumber });
            if (tooth) {
                treatment.teeth.add(tooth);
            }
        }

        await this.em.persistAndFlush(treatment);
        return this.findOne(treatment.id, orgId, createdBy, UserRole.ADMIN);
    }

    async findAll(
        orgId: string,
        userId: string,
        role: string,
        query: TreatmentQueryDto,
    ) {
        const { page = 1, limit = 10, patientId, status, treatmentTypeId } = query;
        const offset = (page - 1) * limit;

        const where: any = { orgId, deletedAt: null };

        // Dentists can only see treatments from their appointments
        if (role === UserRole.DENTIST) {
            where.appointment = { doctor: { id: userId } };
        }

        // Apply filters
        if (patientId) {
            where.patient = { id: patientId };
        }
        if (status) {
            where.status = status;
        }
        if (treatmentTypeId) {
            where.treatmentType = { id: treatmentTypeId };
        }

        const [treatments, total] = await this.em.findAndCount(
            Treatment,
            where,
            {
                populate: ['patient', 'treatmentType', 'appointment', 'appointment.doctor', 'teeth'],
                limit,
                offset,
                orderBy: { createdAt: 'DESC' },
            },
        );

        // Transform to include tooth numbers array
        const transformedTreatments = treatments.map(t => this.transformTreatment(t));

        return {
            data: transformedTreatments,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async findOne(id: string, orgId: string, userId: string, role: string) {
        const where: any = { id, orgId, deletedAt: null };

        // Dentists can only see treatments from their appointments
        if (role === UserRole.DENTIST) {
            where.appointment = { doctor: { id: userId } };
        }

        const treatment = await this.em.findOne(Treatment, where, {
            populate: ['patient', 'treatmentType', 'appointment', 'appointment.doctor', 'teeth'],
        });

        if (!treatment) {
            throw new NotFoundException('Treatment not found');
        }

        return this.transformTreatment(treatment);
    }

    async update(id: string, updateDto: UpdateTreatmentDto, orgId: string, userId: string, role: string, updatedBy: string) {
        const treatment = await this.em.findOne(Treatment, { id, orgId, deletedAt: null }, {
            populate: ['teeth', 'appointment', 'appointment.doctor'],
        });

        if (!treatment) {
            throw new NotFoundException('Treatment not found');
        }

        // Store current status before any narrowing checks
        const currentStatus = treatment.status as TreatmentStatus;

        // Prevent editing completed treatments
        if (treatment.status === TreatmentStatus.COMPLETED) {
            throw new BadRequestException('Completed treatments cannot be edited');
        }

        // Dentists can only update their own treatments
        if (role === UserRole.DENTIST && treatment.appointment?.doctor?.id !== userId) {
            throw new BadRequestException('You can only update your own treatments');
        }

        // Validate appointment requirement for non-planned status
        if (updateDto.status && updateDto.status !== TreatmentStatus.PLANNED) {
            if (!updateDto.appointmentId && !treatment.appointment) {
                throw new BadRequestException('Appointment is required for non-planned treatments');
            }
        }

        // Check if status is changing to COMPLETED
        const isBeingCompleted = updateDto.status === TreatmentStatus.COMPLETED && currentStatus !== TreatmentStatus.COMPLETED;

        const { patientId, treatmentTypeId, appointmentId, toothNumbers, ...updateData } = updateDto;

        // Update basic fields
        this.em.assign(treatment, {
            ...updateData,
            updatedBy,
            updatedAt: new Date(),
        });

        // Update relations if provided
        if (patientId) {
            treatment.patient = this.em.getReference('Patient', patientId) as any;
        }
        if (treatmentTypeId) {
            treatment.treatmentType = this.em.getReference('TreatmentType', treatmentTypeId) as any;
        }
        if (appointmentId) {
            treatment.appointment = this.em.getReference('Appointment', appointmentId) as any;
        }

        // Update teeth if provided
        if (toothNumbers) {
            treatment.teeth.removeAll();
            for (const toothNumber of toothNumbers) {
                const tooth = await this.em.findOne(Tooth, { number: toothNumber });
                if (tooth) {
                    treatment.teeth.add(tooth);
                }
            }
        }

        await this.em.flush();

        // If treatment is being completed, update doctor's wallet
        if (isBeingCompleted) {
            await this.updateDoctorWallet(treatment, orgId);
        }

        return this.findOne(id, orgId, userId, role);
    }

    async remove(id: string, orgId: string, userId: string, role: string, deletedBy: string) {
        const treatment = await this.em.findOne(Treatment, { id, orgId, deletedAt: null }, {
            populate: ['appointment', 'appointment.doctor'],
        });

        if (!treatment) {
            throw new NotFoundException('Treatment not found');
        }

        // Prevent deleting completed treatments
        if (treatment.status === TreatmentStatus.COMPLETED) {
            throw new BadRequestException('Completed treatments cannot be deleted');
        }

        // Dentists can only delete their own treatments
        if (role === UserRole.DENTIST && treatment.appointment?.doctor?.id !== userId) {
            throw new BadRequestException('You can only delete your own treatments');
        }

        // Soft delete
        treatment.deletedAt = new Date();
        treatment.deletedBy = deletedBy;

        await this.em.flush();
        return { message: 'Treatment deleted successfully' };
    }

    async getPatientTreatmentStats(patientId: string, orgId: string) {
        const treatments = await this.em.find(Treatment, {
            patient: { id: patientId },
            orgId,
            deletedAt: null,
        });

        // Exclude cancelled and planned treatments from price calculations
        const activeAndCompletedTreatments = treatments.filter(
            t => t.status !== TreatmentStatus.CANCELLED && t.status !== TreatmentStatus.PLANNED
        );

        const totalPrice = activeAndCompletedTreatments.reduce((sum, t) => sum + Number(t.totalPrice), 0);
        const totalDiscount = activeAndCompletedTreatments.reduce((sum, t) => sum + Number(t.discount), 0);
        const netTotal = totalPrice - totalDiscount;

        return {
            totalTreatments: treatments.length,
            totalPrice,
            totalDiscount,
            netTotal,
            byStatus: {
                planned: treatments.filter(t => t.status === TreatmentStatus.PLANNED).length,
                inProgress: treatments.filter(t => t.status === TreatmentStatus.IN_PROGRESS).length,
                completed: treatments.filter(t => t.status === TreatmentStatus.COMPLETED).length,
                cancelled: treatments.filter(t => t.status === TreatmentStatus.CANCELLED).length,
            },
        };
    }

    private transformTreatment(treatment: Treatment) {
        return {
            id: treatment.id,
            patientId: treatment.patient.id,
            patient: {
                id: treatment.patient.id,
                firstName: treatment.patient.firstName,
                lastName: treatment.patient.lastName,
            },
            treatmentTypeId: treatment.treatmentType.id,
            treatmentType: {
                id: treatment.treatmentType.id,
                name: treatment.treatmentType.name,
                color: treatment.treatmentType.color,
            },
            toothNumbers: treatment.teeth.getItems().map(t => t.number).sort((a, b) => a - b),
            totalPrice: Number(treatment.totalPrice),
            discount: Number(treatment.discount),
            status: treatment.status,
            ...(treatment.appointment && {
                appointmentId: treatment.appointment.id,
                appointment: {
                    id: treatment.appointment.id,
                    date: treatment.appointment.date.toISOString(),
                    time: treatment.appointment.time,
                    ...(treatment.appointment.doctor && {
                        doctor: {
                            id: treatment.appointment.doctor.id,
                            name: treatment.appointment.doctor.name,
                        },
                    }),
                },
            }),
            notes: treatment.notes,
            createdAt: treatment.createdAt.toISOString(),
            updatedAt: treatment.updatedAt.toISOString(),
        };
    }

    /**
     * Update doctor's wallet when treatment is completed
     * Adds commission based on doctor's percentage in the organization
     */
    private async updateDoctorWallet(treatment: Treatment, orgId: string) {
        // Get the doctor from the appointment
        if (!treatment.appointment?.doctor) {
            // No doctor assigned, skip wallet update
            return;
        }

        const doctorId = treatment.appointment.doctor.id;

        // Get the doctor's user-organization record to access wallet and commission percentage
        const userOrg = await this.em.findOne(UserOrganization, {
            user: { id: doctorId },
            orgId,
            role: UserRole.DENTIST,
        });

        if (!userOrg) {
            // Doctor not found in organization or not a dentist role
            return;
        }

        // Calculate commission if percentage is set
        if (userOrg.percentage && userOrg.percentage > 0) {
            const netPrice = Number(treatment.totalPrice) - Number(treatment.discount);
            const commission = (netPrice * userOrg.percentage) / 100;

            // Update wallet balance
            userOrg.wallet = (userOrg.wallet || 0) + commission;
            
            await this.em.flush();
        }
    }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Patient, Attachment } from '../../common/entities';
import { MedicalHistoryQuestion } from '../../common/entities/medical-history-question.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { SubmitMedicalHistoryDto } from './dto/submit-medical-history.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { FilterDto } from '../../common/dto/filter.dto';
import { FilesService } from '../files/files.service';

@Injectable()
export class PatientsService {
    constructor(
        private em: EntityManager,
        private filesService: FilesService,
    ) { }

    async create(createPatientDto: CreatePatientDto, orgId: string, createdBy: string) {
        const { documentIds, ...patientData } = createPatientDto;
        // Cast to any to avoid RequiredEntityData strictness on createdAt/updatedAt
        const patient = this.em.create(Patient, {
            ...patientData,
            orgId,
            createdBy,
            dateOfBirth: patientData.dateOfBirth ? new Date(patientData.dateOfBirth) : undefined,
        } as any);

        if (documentIds?.length) {
            const attachments = await this.em.find(Attachment, { id: { $in: documentIds } });
            patient.documents.set(attachments);
        }

        await this.em.persistAndFlush(patient);
        return this.mapToResponse(patient);
    }

    async findAll(orgId: string, pagination: PaginationDto, filter?: FilterDto) {
        const { page = 1, limit = 10 } = pagination;
        const offset = (page - 1) * limit;

        const where: any = { orgId, deletedAt: null };

        // Search filter
        if (filter?.search) {
            where.$or = [
                { firstName: { $ilike: `%${filter.search}%` } },
                { lastName: { $ilike: `%${filter.search}%` } },
                { mobileNumber: { $ilike: `%${filter.search}%` } },
                { email: { $ilike: `%${filter.search}%` } },
            ];
        }

        // Date range filter
        if (filter?.startDate && filter?.endDate) {
            where.createdAt = {
                $gte: new Date(filter.startDate),
                $lte: new Date(filter.endDate),
            };
        }

        // Sorting
        const sortBy = filter?.sortBy || 'createdAt';
        const sortOrder = filter?.sortOrder || 'DESC';
        const orderBy = { [sortBy]: sortOrder };

        const [patients, total] = await this.em.findAndCount(Patient, where, {
            limit,
            offset,
            orderBy,
            populate: ['documents'],
        });

        const data = await Promise.all(patients.map(p => this.mapToResponse(p)));

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string, orgId: string) {
        const patient = await this.em.findOne(Patient, { id, orgId, deletedAt: null }, { populate: ['documents'] });

        if (!patient) {
            throw new NotFoundException('Patient not found');
        }

        return this.mapToResponse(patient);
    }

    async update(id: string, updatePatientDto: UpdatePatientDto, orgId: string, updatedBy: string) {
        const patient = await this.em.findOne(Patient, { id, orgId, deletedAt: null }, { populate: ['documents'] });

        if (!patient) {
            throw new NotFoundException('Patient not found');
        }

        const { documentIds, ...updateData } = updatePatientDto;

        this.em.assign(patient, {
            ...updateData,
            updatedBy,
            dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : patient.dateOfBirth,
        });

        if (documentIds) {
            const attachments = await this.em.find(Attachment, { id: { $in: documentIds } });
            patient.documents.set(attachments);
        }

        await this.em.flush();
        return this.mapToResponse(patient);
    }

    async remove(id: string, orgId: string, deletedBy: string) {
        const patient = await this.em.findOne(Patient, { id, orgId, deletedAt: null });

        if (!patient) {
            throw new NotFoundException('Patient not found');
        }

        // Soft delete
        patient.deletedAt = new Date();
        patient.deletedBy = deletedBy;

        await this.em.flush();
        return { message: 'Patient deleted successfully' };
    }

    async search(query: string, orgId: string) {
        const patients = await this.em.find(Patient, {
            orgId,
            deletedAt: null,
            $or: [
                { firstName: { $ilike: `%${query}%` } },
                { lastName: { $ilike: `%${query}%` } },
                { mobileNumber: { $ilike: `%${query}%` } },
            ],
        }, { limit: 10 });

        return Promise.all(patients.map(p => this.mapToResponse(p)));
    }

    private async mapToResponse(patient: Patient) {
        const documents = patient.documents.isInitialized() ? patient.documents.getItems() : [];

        // Generate URLs for documents
        const docsWithUrls = await Promise.all(documents.map(async (doc) => {
            try {
                const url = await this.filesService.getSignedUrl(doc);
                return { ...doc, url };
            } catch (e) {
                return doc;
            }
        }));

        return {
            id: patient.id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            mobileNumber: patient.mobileNumber,
            email: patient.email,
            dateOfBirth: patient.dateOfBirth,
            address: patient.address,
            medicalHistory: patient.medicalHistory,
            enablePaymentReminders: patient.enablePaymentReminders,
            documents: docsWithUrls,
            createdAt: patient.createdAt,
            updatedAt: patient.updatedAt,
        };
    }

    async submitMedicalHistory(patientId: string, submitDto: SubmitMedicalHistoryDto) {
        const patient = await this.em.findOne(Patient, { id: patientId });
        
        if (!patient) {
            throw new NotFoundException('Patient not found');
        }

        // Fetch all question details to store question text
        const questionIds = submitDto.responses.map(r => r.questionId);
        const questions = await this.em.find(MedicalHistoryQuestion, {
            id: { $in: questionIds }
        });

        // Create a map for quick lookup
        const questionMap = new Map(questions.map(q => [q.id, q]));

        // Enhance responses with question text
        const enhancedResponses = submitDto.responses.map(response => {
            const question = questionMap.get(response.questionId);
            return {
                questionId: response.questionId,
                questionText: question?.question || 'Question not found',
                questionType: question?.type || 'TEXT',
                answer: response.answer,
                answerText: response.answerText,
            };
        });

        // Update patient's date of birth if not set
        if (!patient.dateOfBirth && submitDto.dateOfBirth) {
            patient.dateOfBirth = new Date(submitDto.dateOfBirth);
        }

        // Update emergency contact if provided
        if (submitDto.emergencyContact) {
            patient.emergencyContact = submitDto.emergencyContact;
        }

        // Update email if provided
        if (submitDto.email) {
            patient.email = submitDto.email;
        }

        // Update blood type if provided
        if (submitDto.bloodType) {
            patient.bloodType = submitDto.bloodType;
        }

        // Update address if provided
        if (submitDto.address) {
            patient.address = submitDto.address;
        }

        // Store medical history in JSONB field with enhanced responses
        const medicalHistory = {
            dateOfBirth: submitDto.dateOfBirth,
            emergencyContact: submitDto.emergencyContact,
            email: submitDto.email,
            bloodType: submitDto.bloodType,
            address: submitDto.address,
            responses: enhancedResponses,
            signature: submitDto.signature,
            submittedAt: new Date().toISOString(),
        };

        patient.medicalHistory = medicalHistory;
        await this.em.flush();

        return medicalHistory;
    }

    async getMedicalHistory(patientId: string) {
        const patient = await this.em.findOne(Patient, { id: patientId });
        
        if (!patient) {
            throw new NotFoundException('Patient not found');
        }

        if (!patient.medicalHistory) {
            throw new NotFoundException('Medical history not found for this patient');
        }

        return patient.medicalHistory;
    }

    // Utility method to update existing medical history with question text
    async updateMedicalHistoryWithQuestionText(orgId: string) {
        const patients = await this.em.find(Patient, {
            orgId,
            medicalHistory: { $ne: null },
        });

        let updatedCount = 0;

        for (const patient of patients) {
            if (patient.medicalHistory && patient.medicalHistory.responses) {
                const responses = patient.medicalHistory.responses as any[];
                
                // Check if responses already have questionText
                const needsUpdate = responses.some(r => !r.questionText);
                
                if (needsUpdate) {
                    const questionIds = responses.map((r: any) => r.questionId);
                    const questions = await this.em.find(MedicalHistoryQuestion, {
                        id: { $in: questionIds }
                    });

                    const questionMap = new Map(questions.map(q => [q.id, q]));

                    // Enhance responses with question text
                    const enhancedResponses = responses.map((response: any) => {
                        if (response.questionText) {
                            return response; // Already has questionText
                        }
                        
                        const question = questionMap.get(response.questionId);
                        return {
                            ...response,
                            questionText: question?.question || 'Question not found',
                            questionType: question?.type || 'TEXT',
                        };
                    });

                    patient.medicalHistory = {
                        ...patient.medicalHistory,
                        responses: enhancedResponses,
                    };

                    updatedCount++;
                }
            }
        }

        if (updatedCount > 0) {
            await this.em.flush();
        }

        return {
            message: `Updated ${updatedCount} patient medical histories with question text`,
            updatedCount,
        };
    }
}

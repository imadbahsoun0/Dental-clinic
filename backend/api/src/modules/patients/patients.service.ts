import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import {
  Patient,
  Attachment,
  Treatment,
  Payment,
  User,
} from '../../common/entities';
import { MedicalHistoryQuestion } from '../../common/entities/medical-history-question.entity';
import { MedicalHistoryAudit } from '../../common/entities/medical-history-audit.entity';
import { TreatmentStatus } from '../../common/entities/treatment.entity';
import { FollowUpStatus } from '../../common/entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { SubmitMedicalHistoryDto } from './dto/submit-medical-history.dto';
import { UpdatePatientMedicalHistoryDto } from './dto/update-patient-medical-history.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { FilterDto } from '../../common/dto/filter.dto';
import { FilesService } from '../files/files.service';
import { ReminderService } from '../reminders/reminder.service';

@Injectable()
export class PatientsService {
  constructor(
    private em: EntityManager,
    private filesService: FilesService,
    private reminderService: ReminderService,
  ) {}

  async create(
    createPatientDto: CreatePatientDto,
    orgId: string,
    createdBy: string,
  ) {
    const { documentIds, ...patientData } = createPatientDto;
    // Cast to any to avoid RequiredEntityData strictness on createdAt/updatedAt
    const patient = this.em.create(Patient, {
      ...patientData,
      orgId,
      createdBy,
      dateOfBirth: patientData.dateOfBirth
        ? new Date(patientData.dateOfBirth)
        : undefined,
    } as any);

    if (documentIds?.length) {
      const attachments = await this.em.find(Attachment, {
        id: { $in: documentIds },
      });
      patient.documents.set(attachments);
    }

    await this.em.persistAndFlush(patient);

    // Send medical history link via WhatsApp
    try {
      await this.reminderService.sendMedicalHistoryLink(patient.id, orgId);
    } catch (error) {
      // Log error but don't fail patient creation
      console.error('Failed to send medical history link:', error);
    }

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
    if (
      filter?.startDate &&
      filter?.endDate &&
      filter.startDate.trim() !== '' &&
      filter.endDate.trim() !== ''
    ) {
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

    const data = await Promise.all(patients.map((p) => this.mapToResponse(p)));

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
    const patient = await this.em.findOne(
      Patient,
      { id, orgId, deletedAt: null },
      { populate: ['documents'] },
    );

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return this.mapToResponse(patient);
  }

  async update(
    id: string,
    updatePatientDto: UpdatePatientDto,
    orgId: string,
    updatedBy: string,
  ) {
    const patient = await this.em.findOne(
      Patient,
      { id, orgId, deletedAt: null },
      { populate: ['documents'] },
    );

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const { documentIds, ...updateData } = updatePatientDto;

    this.em.assign(patient, {
      ...updateData,
      updatedBy,
      dateOfBirth: updateData.dateOfBirth
        ? new Date(updateData.dateOfBirth)
        : patient.dateOfBirth,
    });

    if (documentIds) {
      const attachments = await this.em.find(Attachment, {
        id: { $in: documentIds },
      });
      patient.documents.set(attachments);
    }

    await this.em.flush();
    return this.mapToResponse(patient);
  }

  async remove(id: string, orgId: string, deletedBy: string) {
    const patient = await this.em.findOne(Patient, {
      id,
      orgId,
      deletedAt: null,
    });

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
    const patients = await this.em.find(
      Patient,
      {
        orgId,
        deletedAt: null,
        $or: [
          { firstName: { $ilike: `%${query}%` } },
          { lastName: { $ilike: `%${query}%` } },
          { mobileNumber: { $ilike: `%${query}%` } },
        ],
      },
      { limit: 10 },
    );

    return Promise.all(patients.map((p) => this.mapToResponse(p)));
  }

  private async mapToResponse(patient: Patient) {
    const documents = patient.documents.isInitialized()
      ? patient.documents.getItems()
      : [];

    // Generate URLs for documents
    const docsWithUrls = await Promise.all(
      documents.map(async (doc) => {
        try {
          const url = await this.filesService.getSignedUrl(doc);
          return { ...doc, url };
        } catch (e) {
          return doc;
        }
      }),
    );

    return {
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      mobileNumber: patient.mobileNumber,
      email: patient.email,
      dateOfBirth: patient.dateOfBirth,
      address: patient.address,
      medicalHistory: patient.medicalHistory,
      followUpDate: patient.followUpDate,
      followUpReason: patient.followUpReason,
      followUpStatus: patient.followUpStatus,
      documents: docsWithUrls,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    };
  }

  async submitMedicalHistory(
    patientId: string,
    submitDto: SubmitMedicalHistoryDto,
  ) {
    const patient = await this.em.findOne(Patient, { id: patientId });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Fetch all question details to store question text
    const questionIds = submitDto.responses.map((r) => r.questionId);
    const questions = await this.em.find(MedicalHistoryQuestion, {
      id: { $in: questionIds },
    });

    // Create a map for quick lookup
    const questionMap = new Map(questions.map((q) => [q.id, q]));

    // Enhance responses with question text
    const enhancedResponses = submitDto.responses.map((response) => {
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
        const needsUpdate = responses.some((r) => !r.questionText);

        if (needsUpdate) {
          const questionIds = responses.map((r: any) => r.questionId);
          const questions = await this.em.find(MedicalHistoryQuestion, {
            id: { $in: questionIds },
          });

          const questionMap = new Map(questions.map((q) => [q.id, q]));

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

  /**
   * Manually trigger medical history reminder
   */
  async sendMedicalHistoryReminder(patientId: string, orgId: string) {
    await this.reminderService.sendMedicalHistoryLink(patientId, orgId);
    return { message: 'Medical history reminder sent successfully' };
  }

  async sendFollowUpReminder(patientId: string, orgId: string) {
    await this.reminderService.sendFollowUpReminder(patientId, orgId);
    return { message: 'Follow-up reminder sent successfully' };
  }

  async sendPaymentOverdueReminder(patientId: string, orgId: string) {
    // Get patient with completed treatments to calculate amount due
    const patient = await this.findOne(patientId, orgId);

    // Calculate remaining balance
    const completedTreatments = await this.em.find(Treatment, {
      patient: patientId,
      status: TreatmentStatus.COMPLETED,
      deletedAt: null,
    });

    const totalTreatmentCost = completedTreatments.reduce((sum, t) => {
      return sum + (Number(t.totalPrice) - Number(t.discount));
    }, 0);

    const payments = await this.em.find(Payment, {
      patient: patientId,
      deletedAt: null,
    });

    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const amountDue = totalTreatmentCost - totalPaid;

    if (amountDue <= 0) {
      return { message: 'No outstanding balance for this patient' };
    }

    await this.reminderService.sendPaymentOverdueReminder(
      patientId,
      amountDue,
      orgId,
    );
    return { message: 'Payment overdue reminder sent successfully' };
  }

  /**
   * Get patients with pending follow-ups
   */
  async getPatientsWithFollowUps(
    orgId: string,
    pagination: PaginationDto,
    filter?: FilterDto,
  ) {
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    const where: any = {
      orgId,
      deletedAt: null,
      followUpDate: { $ne: null },
    };

    // Filter by followUpStatus if provided
    if (filter?.followUpStatus) {
      where.followUpStatus = filter.followUpStatus;
    } else {
      // Default to pending if no status specified
      where.followUpStatus = FollowUpStatus.PENDING;
    }

    // Search filter
    if (filter?.search) {
      where.$or = [
        { firstName: { $ilike: `%${filter.search}%` } },
        { lastName: { $ilike: `%${filter.search}%` } },
        { mobileNumber: { $ilike: `%${filter.search}%` } },
      ];
    }

    // Date range filter
    if (
      filter?.startDate &&
      filter?.endDate &&
      filter.startDate.trim() !== '' &&
      filter.endDate.trim() !== ''
    ) {
      where.followUpDate = {
        $gte: new Date(filter.startDate),
        $lte: new Date(filter.endDate),
      };
    }

    const [patients, total] = await this.em.findAndCount(Patient, where, {
      limit,
      offset,
      orderBy: { followUpDate: 'ASC' },
      populate: ['documents'],
    });

    const data = await Promise.all(patients.map((p) => this.mapToResponse(p)));

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

  /**
   * Get patients with unpaid balances (completed treatments but outstanding payments)
   */
  async getUnpaidPatients(orgId: string, pagination: PaginationDto) {
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    // Get all patients
    const patients = await this.em.find(
      Patient,
      {
        orgId,
        deletedAt: null,
      },
      {
        limit,
        offset,
      },
    );

    // For each patient, calculate if they have unpaid balance
    const unpaidPatientsData: any[] = [];

    for (const patient of patients) {
      // Get all completed treatments
      const completedTreatments = await this.em.find(Treatment, {
        patient: patient.id,
        status: TreatmentStatus.COMPLETED,
        deletedAt: null,
      });

      if (completedTreatments.length === 0) continue;

      // Calculate total treatment cost
      const totalTreatmentCost = completedTreatments.reduce((sum, t) => {
        return sum + (Number(t.totalPrice) - Number(t.discount));
      }, 0);

      // Get total payments
      const payments = await this.em.find(Payment, {
        patient: patient.id,
        deletedAt: null,
      });

      const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);

      const remainingBalance = totalTreatmentCost - totalPaid;

      // Only include if there's an outstanding balance
      if (remainingBalance > 0) {
        unpaidPatientsData.push({
          ...patient,
          totalTreatmentCost,
          totalPaid,
          remainingBalance,
        });
      }
    }

    // Get total count of unpaid patients (simplified - may need optimization)
    const totalUnpaid = unpaidPatientsData.length;

    return {
      data: unpaidPatientsData,
      meta: {
        total: totalUnpaid,
        page,
        limit,
        totalPages: Math.ceil(totalUnpaid / limit),
      },
    };
  }

  /**
   * Update patient medical history with audit trail
   * Only admin and secretary can edit
   */
  async updateMedicalHistory(
    patientId: string,
    updateDto: UpdatePatientMedicalHistoryDto,
    orgId: string,
    userId: string,
  ) {
    type StoredMedicalHistoryResponse = {
      questionId: string;
      questionText: string;
      questionType: string;
      answer: unknown;
      answerText?: string;
    };

    type StoredMedicalHistory = {
      dateOfBirth?: string;
      emergencyContact?: string;
      email?: string;
      bloodType?: string;
      address?: string;
      responses?: StoredMedicalHistoryResponse[];
      lastUpdatedAt?: string;
      lastUpdatedBy?: {
        id: string;
        name: string;
        email: string;
      };
    };

    const patient = await this.em.findOne(Patient, { id: patientId, orgId });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get the previous medical history data
    const previousData = (patient.medicalHistory ?? {}) as StoredMedicalHistory;

    // Prepare the new medical history data
    const newMedicalHistory = {
      dateOfBirth: updateDto.dateOfBirth || previousData.dateOfBirth,
      emergencyContact:
        updateDto.emergencyContact || previousData.emergencyContact,
      email: updateDto.email || previousData.email,
      bloodType: updateDto.bloodType || previousData.bloodType,
      address: updateDto.address || previousData.address,
      responses: updateDto.responses,
      lastUpdatedAt: new Date().toISOString(),
      lastUpdatedBy: {
        id: userId,
        name: user.name,
        email: user.email,
      },
    };

    // Calculate changes for audit trail
    const changes: Record<string, { old: unknown; new: unknown }> = {};

    // Compare responses
    const oldResponses: StoredMedicalHistoryResponse[] =
      previousData.responses ?? [];
    const newResponses = updateDto.responses;

    for (const newResponse of newResponses) {
      const oldResponse = oldResponses.find(
        (r) => r.questionId === newResponse.questionId,
      );
      if (oldResponse) {
        // Check if answer changed
        if (
          JSON.stringify(oldResponse.answer) !==
            JSON.stringify(newResponse.answer) ||
          oldResponse.answerText !== newResponse.answerText
        ) {
          changes[newResponse.questionId] = {
            old: {
              answer: oldResponse.answer,
              answerText: oldResponse.answerText,
              questionText: oldResponse.questionText,
            },
            new: {
              answer: newResponse.answer,
              answerText: newResponse.answerText,
              questionText: newResponse.questionText,
            },
          };
        }
      } else {
        // New question added
        changes[newResponse.questionId] = {
          old: null,
          new: {
            answer: newResponse.answer,
            answerText: newResponse.answerText,
            questionText: newResponse.questionText,
          },
        };
      }
    }

    // Check for basic info changes
    if (previousData.dateOfBirth !== updateDto.dateOfBirth) {
      changes['dateOfBirth'] = {
        old: previousData.dateOfBirth,
        new: updateDto.dateOfBirth,
      };
    }
    if (previousData.emergencyContact !== updateDto.emergencyContact) {
      changes['emergencyContact'] = {
        old: previousData.emergencyContact,
        new: updateDto.emergencyContact,
      };
    }
    if (previousData.email !== updateDto.email) {
      changes['email'] = {
        old: previousData.email,
        new: updateDto.email,
      };
    }
    if (previousData.bloodType !== updateDto.bloodType) {
      changes['bloodType'] = {
        old: previousData.bloodType,
        new: updateDto.bloodType,
      };
    }
    if (previousData.address !== updateDto.address) {
      changes['address'] = {
        old: previousData.address,
        new: updateDto.address,
      };
    }

    // Only create audit record if there are changes
    if (Object.keys(changes).length > 0) {
      const audit = this.em.create(MedicalHistoryAudit, {
        patient,
        editedBy: user,
        previousData: previousData as Record<string, unknown>,
        newData: newMedicalHistory as Record<string, unknown>,
        changes,
        notes: updateDto.notes,
        orgId,
      } as any);

      await this.em.persistAndFlush(audit);
    }

    // Update patient fields if provided
    if (
      updateDto.dateOfBirth &&
      updateDto.dateOfBirth !== previousData.dateOfBirth
    ) {
      patient.dateOfBirth = new Date(updateDto.dateOfBirth);
    }
    if (updateDto.emergencyContact) {
      patient.emergencyContact = updateDto.emergencyContact;
    }
    if (updateDto.email) {
      patient.email = updateDto.email;
    }
    if (updateDto.bloodType) {
      patient.bloodType = updateDto.bloodType;
    }
    if (updateDto.address) {
      patient.address = updateDto.address;
    }

    // Update medical history
    patient.medicalHistory = newMedicalHistory;
    await this.em.flush();

    return newMedicalHistory;
  }

  /**
   * Get medical history audit trail for a patient
   */
  async getMedicalHistoryAudit(patientId: string, orgId: string) {
    const patient = await this.em.findOne(Patient, { id: patientId, orgId });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const audits = await this.em.find(
      MedicalHistoryAudit,
      { patient: patientId, orgId },
      {
        populate: ['editedBy'],
        orderBy: { createdAt: 'DESC' },
      },
    );

    return audits.map((audit) => ({
      id: audit.id,
      patientId: audit.patient.id,
      editedBy: {
        id: audit.editedBy.id,
        name: audit.editedBy.name,
        email: audit.editedBy.email,
      },
      changes: audit.changes,
      notes: audit.notes,
      createdAt: audit.createdAt,
      updatedAt: audit.updatedAt,
    }));
  }
}

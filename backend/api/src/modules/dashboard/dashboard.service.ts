import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import {
  Appointment,
  AppointmentStatus,
  Patient,
  Treatment,
  TreatmentStatus,
  Payment,
  Expense,
} from '../../common/entities';
import { UserRole } from '../../common/decorators/roles.decorator';

@Injectable()
export class DashboardService {
  constructor(private em: EntityManager) {}

  async getDashboardStats(orgId: string, role: UserRole) {
    // Get today's date in UTC (start and end of day)
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setUTCHours(23, 59, 59, 999);

    // 1. Today's appointments count (not cancelled or deleted)
    const todayAppointmentsCount = await this.em.count(Appointment, {
      orgId,
      date: {
        $gte: todayStart,
        $lte: todayEnd,
      },
      status: { $ne: AppointmentStatus.CANCELLED },
      deletedAt: null,
    });

    // 2. Total active patients count
    const totalPatientsCount = await this.em.count(Patient, {
      orgId,
      deletedAt: null,
    });

    // Secretaries should not have access to revenue-like data on dashboard.
    // Return zeros for these fields to keep the DTO shape stable.
    if (role === UserRole.SECRETARY) {
      return {
        todayAppointments: todayAppointmentsCount,
        totalPatients: totalPatientsCount,
        pendingPayments: 0,
        dailyNetIncome: 0,
      };
    }

    // 3. Pending payments - sum of all patient balances
    // Get all treatments and payments for the organization
    const allTreatments = await this.em.find(Treatment, {
      orgId,
      status: { $nin: [TreatmentStatus.CANCELLED, TreatmentStatus.PLANNED] },
      deletedAt: null,
    });

    const allPayments = await this.em.find(Payment, {
      orgId,
      deletedAt: null,
    });

    // Group by patient
    const patientBalances = new Map<string, number>();

    // Calculate treatment costs per patient
    allTreatments.forEach((treatment) => {
      const patientId =
        typeof treatment.patient === 'object'
          ? (treatment.patient as { id: string }).id
          : treatment.patient;
      const cost = Number(treatment.totalPrice) - Number(treatment.discount);
      patientBalances.set(
        patientId,
        (patientBalances.get(patientId) || 0) + cost,
      );
    });

    // Subtract payments per patient
    allPayments.forEach((payment) => {
      const patientId =
        typeof payment.patient === 'object'
          ? (payment.patient as { id: string }).id
          : payment.patient;
      const amount = Number(payment.amount);
      patientBalances.set(
        patientId,
        (patientBalances.get(patientId) || 0) - amount,
      );
    });

    // Sum up positive balances (pending payments)
    let pendingPaymentsTotal = 0;
    patientBalances.forEach((balance) => {
      if (balance > 0) {
        pendingPaymentsTotal += balance;
      }
    });

    // 4. Daily net income (today's payments - today's expenses)
    const todayPayments = await this.em.find(Payment, {
      orgId,
      date: {
        $gte: todayStart,
        $lte: todayEnd,
      },
      deletedAt: null,
    });

    const todayExpenses = await this.em.find(Expense, {
      orgId,
      date: {
        $gte: todayStart,
        $lte: todayEnd,
      },
      deletedAt: null,
    });

    const todayPaymentsTotal = todayPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );
    const todayExpensesTotal = todayExpenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0,
    );
    const dailyNetIncome = todayPaymentsTotal - todayExpensesTotal;

    return {
      todayAppointments: todayAppointmentsCount,
      totalPatients: totalPatientsCount,
      pendingPayments: Math.round(pendingPaymentsTotal * 100) / 100,
      dailyNetIncome: Math.round(dailyNetIncome * 100) / 100,
    };
  }

  async getPendingTreatments(orgId: string) {
    const pendingTreatments = await this.em.find(
      Treatment,
      {
        orgId,
        status: TreatmentStatus.PLANNED,
        deletedAt: null,
      },
      {
        populate: ['patient', 'treatmentType'],
        orderBy: { createdAt: 'DESC' },
      },
    );

    return pendingTreatments.map((treatment) => ({
      id: treatment.id,
      patientId: treatment.patient.id,
      patientFirstName: treatment.patient.firstName,
      patientLastName: treatment.patient.lastName,
      treatmentTypeId: treatment.treatmentType.id,
      treatmentTypeName: treatment.treatmentType.name,
      totalPrice: Number(treatment.totalPrice),
      discount: Number(treatment.discount),
      notes: treatment.notes,
      createdAt: treatment.createdAt.toISOString(),
    }));
  }
}

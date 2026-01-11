import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Expense, Payment, Treatment, TreatmentStatus } from '../../common/entities';
import type { IncomeGroupBy } from './dto/income-report-query.dto';
import {
  IncomeReportDto,
  IncomeReportPointDto,
  IncomeReportTotalsDto,
} from './dto/income-report.dto';
import {
  TreatmentReportDto,
  TreatmentStatusSummaryDto,
  TreatmentTypeReportRowDto,
  TreatmentValueSummaryDto,
  DoctorTreatmentReportRowDto,
} from './dto/treatment-report.dto';

type UtcRange = { start: Date; end: Date };

const round2 = (value: number) => Math.round(value * 100) / 100;

const toUtcDayStart = (date: Date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const toUtcDayEnd = (date: Date) => {
  const d = new Date(date);
  d.setUTCHours(23, 59, 59, 999);
  return d;
};

const buildUtcRange = (startDate?: string, endDate?: string): UtcRange => {
  const today = new Date();

  const end = endDate ? new Date(endDate) : today;
  const start = startDate
    ? new Date(startDate)
    : new Date(end.getTime() - 29 * 24 * 60 * 60 * 1000);

  return {
    start: toUtcDayStart(start),
    end: toUtcDayEnd(end),
  };
};

const periodKey = (date: Date, groupBy: IncomeGroupBy): string => {
  const iso = date.toISOString();
  return groupBy === 'month' ? iso.slice(0, 7) : iso.slice(0, 10);
};

@Injectable()
export class ReportsService {
  constructor(private em: EntityManager) {}

  async getIncomeReport(
    orgId: string,
    query: {
      startDate?: string;
      endDate?: string;
      groupBy?: IncomeGroupBy;
    },
  ): Promise<IncomeReportDto> {
    const groupBy = query.groupBy ?? 'day';
    const { start, end } = buildUtcRange(query.startDate, query.endDate);

    const payments = await this.em.find(Payment, {
      orgId,
      deletedAt: null,
      date: { $gte: start, $lte: end },
    });

    const expenses = await this.em.find(Expense, {
      orgId,
      deletedAt: null,
      date: { $gte: start, $lte: end },
    });

    const byPeriod = new Map<
      string,
      {
        paymentsTotal: number;
        expensesTotal: number;
        paymentsCount: number;
        expensesCount: number;
      }
    >();

    for (const p of payments) {
      const key = periodKey(p.date, groupBy);
      const bucket = byPeriod.get(key) ?? {
        paymentsTotal: 0,
        expensesTotal: 0,
        paymentsCount: 0,
        expensesCount: 0,
      };
      bucket.paymentsTotal += Number(p.amount);
      bucket.paymentsCount += 1;
      byPeriod.set(key, bucket);
    }

    for (const e of expenses) {
      const key = periodKey(e.date, groupBy);
      const bucket = byPeriod.get(key) ?? {
        paymentsTotal: 0,
        expensesTotal: 0,
        paymentsCount: 0,
        expensesCount: 0,
      };
      bucket.expensesTotal += Number(e.amount);
      bucket.expensesCount += 1;
      byPeriod.set(key, bucket);
    }

    const series: IncomeReportPointDto[] = Array.from(byPeriod.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, b]) => ({
        period,
        paymentsTotal: round2(b.paymentsTotal),
        expensesTotal: round2(b.expensesTotal),
        netIncome: round2(b.paymentsTotal - b.expensesTotal),
        paymentsCount: b.paymentsCount,
        expensesCount: b.expensesCount,
      }));

    const totals: IncomeReportTotalsDto = {
      paymentsTotal: round2(
        payments.reduce((sum, p) => sum + Number(p.amount), 0),
      ),
      expensesTotal: round2(
        expenses.reduce((sum, e) => sum + Number(e.amount), 0),
      ),
      netIncome: 0,
      paymentsCount: payments.length,
      expensesCount: expenses.length,
    };

    totals.netIncome = round2(totals.paymentsTotal - totals.expensesTotal);

    return {
      groupBy,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      formula: 'netIncome = sum(payments.amount) - sum(expenses.amount) for the selected period (UTC)',
      totals,
      series,
    };
  }

  async getTreatmentReport(
    orgId: string,
    query: { startDate?: string; endDate?: string },
  ): Promise<TreatmentReportDto> {
    const { start, end } = buildUtcRange(query.startDate, query.endDate);

    const treatments = await this.em.find(
      Treatment,
      {
        orgId,
        deletedAt: null,
        createdAt: { $gte: start, $lte: end },
      },
      {
        populate: ['treatmentType', 'appointment', 'appointment.doctor'],
      },
    );

    const statusSummary: TreatmentStatusSummaryDto = {
      planned: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
    };

    for (const t of treatments) {
      if (t.status === TreatmentStatus.PLANNED) statusSummary.planned += 1;
      else if (t.status === TreatmentStatus.IN_PROGRESS) statusSummary.inProgress += 1;
      else if (t.status === TreatmentStatus.COMPLETED) statusSummary.completed += 1;
      else if (t.status === TreatmentStatus.CANCELLED) statusSummary.cancelled += 1;
    }

    const valueEligible = treatments.filter(
      (t) => t.status !== TreatmentStatus.PLANNED && t.status !== TreatmentStatus.CANCELLED,
    );

    const valueSummary: TreatmentValueSummaryDto = {
      grossTotal: round2(valueEligible.reduce((sum, t) => sum + Number(t.totalPrice), 0)),
      discountTotal: round2(valueEligible.reduce((sum, t) => sum + Number(t.discount), 0)),
      netTotal: 0,
    };
    valueSummary.netTotal = round2(valueSummary.grossTotal - valueSummary.discountTotal);

    const byType = new Map<
      string,
      { name: string; count: number; gross: number; discount: number }
    >();

    for (const t of valueEligible) {
      const typeId = t.treatmentType.id;
      const name = t.treatmentType.name;
      const bucket = byType.get(typeId) ?? {
        name,
        count: 0,
        gross: 0,
        discount: 0,
      };
      bucket.count += 1;
      bucket.gross += Number(t.totalPrice);
      bucket.discount += Number(t.discount);
      byType.set(typeId, bucket);
    }

    const byTreatmentType: TreatmentTypeReportRowDto[] = Array.from(byType.entries())
      .map(([treatmentTypeId, b]) => ({
        treatmentTypeId,
        treatmentTypeName: b.name,
        count: b.count,
        value: {
          grossTotal: round2(b.gross),
          discountTotal: round2(b.discount),
          netTotal: round2(b.gross - b.discount),
        },
      }))
      .sort((a, b) => b.value.netTotal - a.value.netTotal);

    const byDoctorMap = new Map<
      string,
      { name: string; count: number; gross: number; discount: number }
    >();

    for (const t of valueEligible) {
      const doctor = t.appointment?.doctor;
      if (!doctor) continue;

      const doctorId = doctor.id;
      const doctorName = doctor.name;
      const bucket = byDoctorMap.get(doctorId) ?? {
        name: doctorName,
        count: 0,
        gross: 0,
        discount: 0,
      };
      bucket.count += 1;
      bucket.gross += Number(t.totalPrice);
      bucket.discount += Number(t.discount);
      byDoctorMap.set(doctorId, bucket);
    }

    const byDoctor: DoctorTreatmentReportRowDto[] = Array.from(
      byDoctorMap.entries(),
    )
      .map(([doctorId, b]) => ({
        doctorId,
        doctorName: b.name,
        count: b.count,
        value: {
          grossTotal: round2(b.gross),
          discountTotal: round2(b.discount),
          netTotal: round2(b.gross - b.discount),
        },
      }))
      .sort((a, b) => b.value.netTotal - a.value.netTotal);

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      valueRules:
        'Value totals include treatments created in the selected period (UTC) excluding planned and cancelled. Value = sum(totalPrice) - sum(discount).',
      statusSummary,
      valueSummary,
      byTreatmentType,
      byDoctor,
    };
  }
}

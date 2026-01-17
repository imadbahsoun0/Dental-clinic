'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import toast from 'react-hot-toast';
import { api, IncomeReportDto, StandardResponse } from '@/lib/api';
import { formatLocalDate } from '@/utils/dateUtils';
import { asNumber, BarDatum, currency, IncomeGroupBy } from './reportFormat';
import { SimpleBarChart } from './SimpleBarChart';
import { IncomePeriodDetailsModal } from './IncomePeriodDetailsModal';
import styles from './reports.module.css';

const addDays = (date: Date, days: number): Date => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

const defaultDateRange = () => {
    const end = new Date();
    const start = addDays(end, -29);
    return {
        startDate: formatLocalDate(start),
        endDate: formatLocalDate(end),
    };
};

export const IncomeReportTab: React.FC = () => {
    const initialRange = useMemo(() => defaultDateRange(), []);

    const [incomeStartDate, setIncomeStartDate] = useState(initialRange.startDate);
    const [incomeEndDate, setIncomeEndDate] = useState(initialRange.endDate);
    const [incomeGroupBy, setIncomeGroupBy] = useState<IncomeGroupBy>('day');
    const [incomeLoading, setIncomeLoading] = useState(false);
    const [incomeReport, setIncomeReport] = useState<IncomeReportDto | null>(null);

    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);

    useEffect(() => {
        const fetchIncome = async () => {
            try {
                setIncomeLoading(true);
                const response = await api.api.reportsControllerGetIncomeReport({
                    startDate: incomeStartDate,
                    endDate: incomeEndDate,
                    groupBy: incomeGroupBy,
                });

                const standard = response as unknown as StandardResponse;
                const data = standard.data as unknown as IncomeReportDto;
                setIncomeReport(data);
            } catch (error) {
                console.error('Failed to fetch income report:', error);
                toast.error('Failed to load income report');
            } finally {
                setIncomeLoading(false);
            }
        };

        fetchIncome();
    }, [incomeStartDate, incomeEndDate, incomeGroupBy]);

    const incomeBars: BarDatum[] = useMemo(() => {
        if (!incomeReport?.series) return [];
        return incomeReport.series.map((p) => ({
            label: p.period,
            value: asNumber(p.netIncome),
        }));
    }, [incomeReport]);

    const totals = incomeReport?.totals;

    const openDetails = (period: string) => {
        setSelectedPeriod(period);
        setDetailsOpen(true);
    };

    return (
        <div className={styles.container}>
            <IncomePeriodDetailsModal
                isOpen={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                period={selectedPeriod}
                groupBy={incomeGroupBy}
            />

            <Card title="Filters">
                <div className={styles.filtersRow}>
                    <Input label="Start date" type="date" value={incomeStartDate} onChange={setIncomeStartDate} />
                    <Input label="End date" type="date" value={incomeEndDate} onChange={setIncomeEndDate} />
                    <Select
                        label="Group by"
                        value={incomeGroupBy}
                        onChange={(v) => setIncomeGroupBy(v as IncomeGroupBy)}
                        options={[
                            { value: 'day', label: 'Daily' },
                            { value: 'month', label: 'Monthly' },
                        ]}
                    />
                </div>
                <div className={styles.smallText}>Net income is computed at org level: payments minus expenses.</div>
            </Card>

            <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}>
                    <div className={styles.summaryLabel}>Payments total</div>
                    <div className={styles.summaryValue}>
                        {incomeLoading ? '...' : currency(asNumber(totals?.paymentsTotal))}
                    </div>
                </div>
                <div className={styles.summaryCard}>
                    <div className={styles.summaryLabel}>Expenses total</div>
                    <div className={styles.summaryValue}>
                        {incomeLoading ? '...' : currency(asNumber(totals?.expensesTotal))}
                    </div>
                </div>
                <div className={styles.summaryCard}>
                    <div className={styles.summaryLabel}>Net income</div>
                    <div className={styles.summaryValue}>
                        {incomeLoading ? '...' : currency(asNumber(totals?.netIncome))}
                    </div>
                </div>
            </div>

            <div className={styles.chartCard}>
                <div className={styles.chartTitle}>Net income trend</div>
                {incomeLoading ? (
                    <div className={styles.smallText}>Loading chart...</div>
                ) : incomeBars.length === 0 ? (
                    <div className={styles.smallText}>No data for selected range.</div>
                ) : (
                    <SimpleBarChart data={incomeBars} />
                )}
            </div>

            <Card title="How it’s calculated">
                <div className={styles.smallText}>
                    <div>
                        <strong>Formula:</strong> {incomeReport?.formula ?? '—'}
                    </div>
                    <div>
                        <strong>Counts:</strong> payments={asNumber(totals?.paymentsCount)} / expenses={asNumber(totals?.expensesCount)}
                    </div>
                </div>
            </Card>

            <Card title="Breakdown">
                <div style={{ overflowX: 'auto' }}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Period</th>
                                <th>Payments</th>
                                <th>Expenses</th>
                                <th>Net</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(incomeReport?.series ?? []).map((p) => (
                                <tr
                                    key={p.period}
                                    className={styles.clickableRow}
                                    onClick={() => openDetails(p.period)}
                                >
                                    <td>{p.period}</td>
                                    <td>{currency(asNumber(p.paymentsTotal))}</td>
                                    <td>{currency(asNumber(p.expensesTotal))}</td>
                                    <td>{currency(asNumber(p.netIncome))}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className={styles.smallText}>Click a row to see payments and expenses details for that period.</div>
            </Card>
        </div>
    );
};

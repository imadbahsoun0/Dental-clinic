'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, Tab } from '@/components/common/Tabs';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Card } from '@/components/common/Card';
import { api, IncomeReportDto, StandardResponse, TreatmentReportDto } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { formatLocalDate } from '@/utils/dateUtils';
import toast from 'react-hot-toast';
import styles from './reports.module.css';

type ReportTabId = 'income' | 'treatments';

type IncomeGroupBy = 'day' | 'month';

type BarDatum = {
    label: string;
    value: number;
};

const asNumber = (value: unknown): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const n = Number(value);
        return Number.isFinite(n) ? n : 0;
    }
    return 0;
};

const currency = (value: number): string => {
    const rounded = Math.round(value * 100) / 100;
    return `$${rounded.toFixed(2)}`;
};

const addDays = (date: Date, days: number): Date => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

const defaultDateRange = () => {
    const end = new Date();
    const start = addDays(end, -29);
    return {
        startDate: formatLocalDate(start),
        endDate: formatLocalDate(end),
    };
};

const SimpleBarChart: React.FC<{ data: BarDatum[]; height?: number }> = ({ data, height = 220 }) => {
    const width = 900;
    const padding = 24;

    const values = data.map((d) => d.value);
    const maxAbs = Math.max(1, ...values.map((v) => Math.abs(v)));

    const chartHeight = height - padding * 2;
    const chartWidth = width - padding * 2;

    const barGap = 4;
    const barWidth = data.length > 0 ? (chartWidth - barGap * (data.length - 1)) / data.length : chartWidth;

    const yForValue = (v: number) => {
        // baseline in the middle if there are negatives, otherwise bottom
        const hasNeg = values.some((x) => x < 0);
        const baseline = hasNeg ? padding + chartHeight / 2 : padding + chartHeight;
        const scale = hasNeg ? chartHeight / 2 / maxAbs : chartHeight / maxAbs;
        return {
            baseline,
            barHeight: Math.abs(v) * scale,
            isPositive: v >= 0,
        };
    };

    return (
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} aria-label="Bar chart">
            {/* axis line */}
            <line
                x1={padding}
                y1={padding + chartHeight}
                x2={padding + chartWidth}
                y2={padding + chartHeight}
                stroke="var(--border)"
                strokeWidth={1}
            />

            {data.map((d, i) => {
                const x = padding + i * (barWidth + barGap);
                const { baseline, barHeight, isPositive } = yForValue(d.value);
                const y = isPositive ? baseline - barHeight : baseline;

                return (
                    <g key={`${d.label}-${i}`}>
                        <rect
                            x={x}
                            y={y}
                            width={Math.max(1, barWidth)}
                            height={Math.max(1, barHeight)}
                            rx={6}
                            fill={isPositive ? 'var(--success)' : 'var(--danger)'}
                            opacity={0.9}
                        />
                    </g>
                );
            })}
        </svg>
    );
};

export default function ReportsPage() {
    const currentOrg = useAuthStore((state) => state.currentOrg);
    const role = currentOrg?.role;

    const [activeTab, setActiveTab] = useState<ReportTabId>('income');

    const initialRange = useMemo(() => defaultDateRange(), []);

    // Income report state
    const [incomeStartDate, setIncomeStartDate] = useState(initialRange.startDate);
    const [incomeEndDate, setIncomeEndDate] = useState(initialRange.endDate);
    const [incomeGroupBy, setIncomeGroupBy] = useState<IncomeGroupBy>('day');
    const [incomeLoading, setIncomeLoading] = useState(false);
    const [incomeReport, setIncomeReport] = useState<IncomeReportDto | null>(null);

    // Treatment report state
    const [treatStartDate, setTreatStartDate] = useState(initialRange.startDate);
    const [treatEndDate, setTreatEndDate] = useState(initialRange.endDate);
    const [treatLoading, setTreatLoading] = useState(false);
    const [treatmentReport, setTreatmentReport] = useState<TreatmentReportDto | null>(null);

    const tabs: Tab[] = useMemo(
        () => [
            { id: 'income', label: 'Income', icon: '💵' },
            { id: 'treatments', label: 'Treatments', icon: '🦷' },
        ],
        [],
    );

    useEffect(() => {
        if (role !== 'admin') return;

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
    }, [incomeStartDate, incomeEndDate, incomeGroupBy, role]);

    useEffect(() => {
        if (role !== 'admin') return;

        const fetchTreatments = async () => {
            try {
                setTreatLoading(true);
                const response = await api.api.reportsControllerGetTreatmentReport({
                    startDate: treatStartDate,
                    endDate: treatEndDate,
                });

                const standard = response as unknown as StandardResponse;
                const data = standard.data as unknown as TreatmentReportDto;
                setTreatmentReport(data);
            } catch (error) {
                console.error('Failed to fetch treatment report:', error);
                toast.error('Failed to load treatment report');
            } finally {
                setTreatLoading(false);
            }
        };

        fetchTreatments();
    }, [treatStartDate, treatEndDate, role]);

    const incomeBars: BarDatum[] = useMemo(() => {
        if (!incomeReport?.series) return [];
        return incomeReport.series.map((p) => ({
            label: p.period,
            value: asNumber(p.netIncome),
        }));
    }, [incomeReport]);

    const topTreatmentTypeBars: BarDatum[] = useMemo(() => {
        const rows = treatmentReport?.byTreatmentType ?? [];
        return rows
            .slice(0, 10)
            .map((r) => ({ label: r.treatmentTypeName, value: asNumber(r.value?.netTotal) }));
    }, [treatmentReport]);

    const renderIncomeTab = () => {
        const totals = incomeReport?.totals;

        return (
            <div className={styles.container}>
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
                    <div className={styles.smallText}>
                        Net income is computed at org level: payments minus expenses.
                    </div>
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
                        <div><strong>Formula:</strong> {incomeReport?.formula ?? '—'}</div>
                        <div>
                            <strong>Counts:</strong>{' '}
                            payments={asNumber(totals?.paymentsCount)} / expenses={asNumber(totals?.expensesCount)}
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
                                    <tr key={p.period}>
                                        <td>{p.period}</td>
                                        <td>{currency(asNumber(p.paymentsTotal))}</td>
                                        <td>{currency(asNumber(p.expensesTotal))}</td>
                                        <td>{currency(asNumber(p.netIncome))}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        );
    };

    const renderTreatmentsTab = () => {
        const status = treatmentReport?.statusSummary;
        const value = treatmentReport?.valueSummary;

        return (
            <div className={styles.container}>
                <Card title="Filters">
                    <div className={styles.filtersRowTwo}>
                        <Input label="Start date" type="date" value={treatStartDate} onChange={setTreatStartDate} />
                        <Input label="End date" type="date" value={treatEndDate} onChange={setTreatEndDate} />
                    </div>
                    <div className={styles.smallText}>
                        Shows treatment volume and value summaries for the organization.
                    </div>
                </Card>

                <div className={styles.summaryGrid}>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryLabel}>Completed</div>
                        <div className={styles.summaryValue}>{treatLoading ? '...' : asNumber(status?.completed)}</div>
                    </div>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryLabel}>In progress</div>
                        <div className={styles.summaryValue}>{treatLoading ? '...' : asNumber(status?.inProgress)}</div>
                    </div>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryLabel}>Planned</div>
                        <div className={styles.summaryValue}>{treatLoading ? '...' : asNumber(status?.planned)}</div>
                    </div>
                </div>

                <div className={styles.summaryGrid}>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryLabel}>Gross total</div>
                        <div className={styles.summaryValue}>{treatLoading ? '...' : currency(asNumber(value?.grossTotal))}</div>
                    </div>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryLabel}>Discount total</div>
                        <div className={styles.summaryValue}>{treatLoading ? '...' : currency(asNumber(value?.discountTotal))}</div>
                    </div>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryLabel}>Net total</div>
                        <div className={styles.summaryValue}>{treatLoading ? '...' : currency(asNumber(value?.netTotal))}</div>
                    </div>
                </div>

                <div className={styles.chartCard}>
                    <div className={styles.chartTitle}>Top treatment types (by net value)</div>
                    {treatLoading ? (
                        <div className={styles.smallText}>Loading chart...</div>
                    ) : topTreatmentTypeBars.length === 0 ? (
                        <div className={styles.smallText}>No data for selected range.</div>
                    ) : (
                        <SimpleBarChart data={topTreatmentTypeBars} />
                    )}
                </div>

                <Card title="Value rules">
                    <div className={styles.smallText}>{treatmentReport?.valueRules ?? '—'}</div>
                </Card>

                <Card title="By treatment type">
                    <div style={{ overflowX: 'auto' }}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Treatment type</th>
                                    <th>Count</th>
                                    <th>Gross</th>
                                    <th>Discount</th>
                                    <th>Net</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(treatmentReport?.byTreatmentType ?? []).map((r) => (
                                    <tr key={r.treatmentTypeId}>
                                        <td>{r.treatmentTypeName}</td>
                                        <td>{asNumber(r.count)}</td>
                                        <td>{currency(asNumber(r.value?.grossTotal))}</td>
                                        <td>{currency(asNumber(r.value?.discountTotal))}</td>
                                        <td>{currency(asNumber(r.value?.netTotal))}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <Card title="By doctor">
                    <div style={{ overflowX: 'auto' }}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Doctor</th>
                                    <th>Count</th>
                                    <th>Gross</th>
                                    <th>Discount</th>
                                    <th>Net</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(treatmentReport?.byDoctor ?? []).map((r) => (
                                    <tr key={r.doctorId}>
                                        <td>{r.doctorName}</td>
                                        <td>{asNumber(r.count)}</td>
                                        <td>{currency(asNumber(r.value?.grossTotal))}</td>
                                        <td>{currency(asNumber(r.value?.discountTotal))}</td>
                                        <td>{currency(asNumber(r.value?.netTotal))}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        );
    };

    if (role !== 'admin') {
        return (
            <MainLayout title="Reports">
                <div className={styles.unauthorized}>
                    <h3>Access denied</h3>
                    <p className={styles.smallText}>This section is available to admins only.</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout title="Reports">
            <Tabs tabs={tabs} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as ReportTabId)} />
            {activeTab === 'income' ? renderIncomeTab() : renderTreatmentsTab()}
        </MainLayout>
    );
}

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import toast from 'react-hot-toast';
import { api, StandardResponse, TreatmentReportDto } from '@/lib/api';
import { formatLocalDate } from '@/utils/dateUtils';
import { asNumber, BarDatum, currency } from './reportFormat';
import { SimpleBarChart } from './SimpleBarChart';
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

export const TreatmentsReportTab: React.FC = () => {
    const initialRange = useMemo(() => defaultDateRange(), []);

    const [treatStartDate, setTreatStartDate] = useState(initialRange.startDate);
    const [treatEndDate, setTreatEndDate] = useState(initialRange.endDate);
    const [treatLoading, setTreatLoading] = useState(false);
    const [treatmentReport, setTreatmentReport] = useState<TreatmentReportDto | null>(null);

    useEffect(() => {
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
    }, [treatStartDate, treatEndDate]);

    const topTreatmentTypeBars: BarDatum[] = useMemo(() => {
        const rows = treatmentReport?.byTreatmentType ?? [];
        return rows.slice(0, 10).map((r) => ({ label: r.treatmentTypeName, value: asNumber(r.value?.netTotal) }));
    }, [treatmentReport]);

    const status = treatmentReport?.statusSummary;
    const value = treatmentReport?.valueSummary;

    return (
        <div className={styles.container}>
            <Card title="Filters">
                <div className={styles.filtersRowTwo}>
                    <Input label="Start date" type="date" value={treatStartDate} onChange={setTreatStartDate} />
                    <Input label="End date" type="date" value={treatEndDate} onChange={setTreatEndDate} />
                </div>
                <div className={styles.smallText}>Shows treatment volume and value summaries for the organization.</div>
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

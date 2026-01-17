'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Card } from '@/components/common/Card';
import toast from 'react-hot-toast';
import {
    api,
    IncomePeriodDetailsDto,
    IncomePeriodExpenseDto,
    IncomePeriodPaymentDto,
    StandardResponse,
} from '@/lib/api';
import { asNumber, currency, IncomeGroupBy } from './reportFormat';
import styles from './reports.module.css';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    period: string | null;
    groupBy: IncomeGroupBy;
};

const patientName = (p: IncomePeriodPaymentDto): string => {
    const patient = p.patient;
    if (!patient) return '—';
    const firstName = typeof patient.firstName === 'string' ? patient.firstName : '';
    const lastName = typeof patient.lastName === 'string' ? patient.lastName : '';
    const full = `${firstName} ${lastName}`.trim();
    return full.length > 0 ? full : '—';
};

const doctorName = (e: IncomePeriodExpenseDto): string => {
    const doctor = e.doctor;
    if (!doctor) return '—';
    return typeof doctor.name === 'string' && doctor.name.length > 0 ? doctor.name : '—';
};

export const IncomePeriodDetailsModal: React.FC<Props> = ({ isOpen, onClose, period, groupBy }) => {
    const [loading, setLoading] = useState(false);
    const [details, setDetails] = useState<IncomePeriodDetailsDto | null>(null);

    const title = useMemo(() => {
        if (!period) return 'Details';
        return groupBy === 'month' ? `Details for ${period}` : `Details for ${period}`;
    }, [period, groupBy]);

    useEffect(() => {
        if (!isOpen || !period) return;

        const fetchDetails = async () => {
            try {
                setLoading(true);
                const response = await api.api.reportsControllerGetIncomePeriodDetails({
                    period,
                    groupBy,
                });

                const standard = response as unknown as StandardResponse;
                const data = standard.data as unknown as IncomePeriodDetailsDto;
                setDetails(data);
            } catch (error) {
                console.error('Failed to fetch income period details:', error);
                toast.error('Failed to load period details');
                setDetails(null);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [groupBy, isOpen, period]);

    const totals = details?.totals;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            {loading ? (
                <div className={styles.smallText}>Loading details...</div>
            ) : !details ? (
                <div className={styles.smallText}>No details available.</div>
            ) : (
                <div className={styles.container}>
                    <div className={styles.summaryGrid}>
                        <div className={styles.summaryCard}>
                            <div className={styles.summaryLabel}>Payments total</div>
                            <div className={styles.summaryValue}>{currency(asNumber(totals?.paymentsTotal))}</div>
                        </div>
                        <div className={styles.summaryCard}>
                            <div className={styles.summaryLabel}>Expenses total</div>
                            <div className={styles.summaryValue}>{currency(asNumber(totals?.expensesTotal))}</div>
                        </div>
                        <div className={styles.summaryCard}>
                            <div className={styles.summaryLabel}>Net income</div>
                            <div className={styles.summaryValue}>{currency(asNumber(totals?.netIncome))}</div>
                        </div>
                    </div>

                    <Card title={`Payments (${asNumber(totals?.paymentsCount)})`}>
                        <div style={{ overflowX: 'auto' }}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Patient</th>
                                        <th>Method</th>
                                        <th>Amount</th>
                                        <th>Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(details.payments ?? []).map((p) => (
                                        <tr key={p.id}>
                                            <td>{patientName(p)}</td>
                                            <td>{p.paymentMethod}</td>
                                            <td>{currency(asNumber(p.amount))}</td>
                                            <td>{p.notes ?? '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <Card title={`Expenses (${asNumber(totals?.expensesCount)})`}>
                        <div style={{ overflowX: 'auto' }}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Type</th>
                                        <th>Doctor</th>
                                        <th>Amount</th>
                                        <th>Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(details.expenses ?? []).map((e) => (
                                        <tr key={e.id}>
                                            <td>{e.name}</td>
                                            <td>{e.expenseType}</td>
                                            <td>{doctorName(e)}</td>
                                            <td>{currency(asNumber(e.amount))}</td>
                                            <td>{e.notes ?? '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <div className={styles.smallText}>
                        Period is computed in UTC to match backend reporting.
                    </div>
                </div>
            )}
        </Modal>
    );
};

'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useExpenseStore } from '@/store/expenseStore';
import { DoctorPaymentModal } from '@/components/doctors/DoctorPaymentModal';
import { api, StandardResponse } from '@/lib/api';
import { toast } from 'react-hot-toast';
import styles from './doctors-payments.module.css';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

interface Dentist {
    id: string;
    name: string;
    email: string;
    wallet: number;
    percentage: number;
}

const isDentist = (value: unknown): value is Dentist => {
    if (!value || typeof value !== 'object') return false;
    const record = value as Record<string, unknown>;
    return (
        typeof record.id === 'string' &&
        typeof record.name === 'string' &&
        typeof record.email === 'string' &&
        typeof record.wallet === 'number' &&
        typeof record.percentage === 'number'
    );
};

export default function DoctorPaymentsPage() {
    const router = useRouter();
    const currentOrg = useAuthStore((state) => state.currentOrg);
    const role = currentOrg?.role;

    const processDoctorPayment = useExpenseStore((state) => state.processDoctorPayment);
    const [dentists, setDentists] = useState<Dentist[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Dentist | null>(null);

    useEffect(() => {
        // Backend enforces admin-only access; mirror it in UI to avoid a broken page.
        if (role && role !== 'admin') {
            toast.error('Access denied');
            router.replace('/dashboard');
            return;
        }

        if (role === 'admin') {
            fetchDentists();
        }
    }, [role, router]);

    const fetchDentists = async () => {
        setLoading(true);
        try {
            const response = await api.api.usersControllerGetDentists();
            const data = (response as StandardResponse & { data?: unknown }).data;
            const list = Array.isArray(data) ? data.filter(isDentist) : [];
            setDentists(list);
        } catch (error: unknown) {
            console.error('Failed to fetch dentists:', error);
            const message = error instanceof Error ? error.message : 'Failed to fetch dentists';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const totalPendingPayments = dentists.reduce((sum, doc) => sum + (doc.wallet || 0), 0);

    const handlePayDoctor = (doctor: Dentist) => {
        setSelectedDoctor(doctor);
        setIsModalOpen(true);
    };

    const handleProcessPayment = async (paymentData: { amount: number; date: string; notes?: string }) => {
        if (!selectedDoctor) return;

        try {
            const result = await processDoctorPayment(
                selectedDoctor.id,
                paymentData.amount,
                paymentData.notes || `Commission payment to ${selectedDoctor.name}`
            );

            // Update local state with new wallet balance
            setDentists(prevDentists =>
                prevDentists.map(d =>
                    d.id === selectedDoctor.id
                        ? { ...d, wallet: result.newWalletBalance }
                        : d
                )
            );

            setIsModalOpen(false);
            setSelectedDoctor(null);
        } catch (error) {
            // Error already handled in store with toast
        }
    };

    return (
        <MainLayout title="Doctor Payments">
            <div className={styles.header}>
                <div className={styles.headerInfo}>
                    <h1 className={styles.title}>Doctor Payments</h1>
                    <p className={styles.subtitle}>
                        Manage commission payments to dentists
                    </p>
                </div>
            </div>

            {/* Summary Card */}
            <div className={styles.summaryCard}>
                <div className={styles.summaryItem}>
                    <div className={styles.summaryLabel}>Total Pending Payments</div>
                    <div className={styles.summaryValue}>${totalPendingPayments.toFixed(2)}</div>
                </div>
                <div className={styles.summaryItem}>
                    <div className={styles.summaryLabel}>Number of Dentists</div>
                    <div className={styles.summaryValue}>{dentists.length}</div>
                </div>
            </div>

            {/* Dentists Table */}
            <Card>
                {loading ? (
                    <div className={styles.emptyState}>
                        <p>Loading dentists...</p>
                    </div>
                ) : dentists.length > 0 ? (
                    <>
                        {/* Desktop Table View */}
                        <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Doctor Name</th>
                                    <th>Email</th>
                                    <th>Commission %</th>
                                    <th>Wallet Balance</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dentists.map((doctor) => (
                                    <tr key={doctor.id}>
                                        <td>
                                            <div className={styles.doctorName}>
                                                <span className={styles.doctorIcon}>👨‍⚕️</span>
                                                {doctor.name}
                                            </div>
                                        </td>
                                        <td>{doctor.email}</td>
                                        <td>{doctor.percentage || 0}%</td>
                                        <td>
                                            <span
                                                className={`${styles.wallet} ${(doctor.wallet || 0) > 0 ? styles.walletPositive : ''
                                                    }`}
                                            >
                                                ${(doctor.wallet || 0).toFixed(2)}
                                            </span>
                                        </td>
                                        <td>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => handlePayDoctor(doctor)}
                                                disabled={!doctor.wallet || doctor.wallet <= 0}
                                            >
                                                Pay Doctor
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className={styles.mobileCardView}>
                            {dentists.map((doctor) => (
                                <div key={doctor.id} className={styles.doctorCard}>
                                    <div className={styles.doctorCardHeader}>
                                        <div className={styles.doctorCardTitle}>
                                            <span className={styles.doctorIcon}>👨‍⚕️</span>
                                            {doctor.name}
                                        </div>
                                        <div className={`${styles.doctorCardWallet} ${(doctor.wallet || 0) > 0 ? styles.positive : ''}`}>
                                            ${(doctor.wallet || 0).toFixed(2)}
                                        </div>
                                    </div>

                                    <div className={styles.doctorCardBody}>
                                        <div className={styles.doctorCardRow}>
                                            <span className={styles.doctorCardLabel}>Email</span>
                                            <span className={styles.doctorCardValue}>{doctor.email}</span>
                                        </div>

                                        <div className={styles.doctorCardRow}>
                                            <span className={styles.doctorCardLabel}>Commission</span>
                                            <span className={styles.doctorCardValue}>{doctor.percentage || 0}%</span>
                                        </div>
                                    </div>

                                    <div className={styles.doctorCardFooter}>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handlePayDoctor(doctor)}
                                            disabled={!doctor.wallet || doctor.wallet <= 0}
                                        >
                                            Pay Doctor
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>👨‍⚕️</div>
                        <h3 className={styles.emptyTitle}>No dentists found</h3>
                        <p className={styles.emptyText}>
                            Add dentists in the Settings page to manage their payments
                        </p>
                    </div>
                )}
            </Card>

            {selectedDoctor && (
                <DoctorPaymentModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedDoctor(null);
                    }}
                    onSave={handleProcessPayment}
                    doctor={selectedDoctor}
                />
            )}
        </MainLayout>
    );
}

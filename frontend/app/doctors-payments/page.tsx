'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useSettingsStore } from '@/store/settingsStore';
import { useExpenseStore } from '@/store/expenseStore';
import { User } from '@/types';
import { DoctorPaymentModal } from '@/components/doctors/DoctorPaymentModal';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import styles from './doctors-payments.module.css';

interface Dentist {
    id: string;
    name: string;
    email: string;
    wallet: number;
    percentage: number;
}

export default function DoctorPaymentsPage() {
    const processDoctorPayment = useExpenseStore((state) => state.processDoctorPayment);
    const [dentists, setDentists] = useState<Dentist[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Dentist | null>(null);

    useEffect(() => {
        fetchDentists();
    }, []);

    const fetchDentists = async () => {
        setLoading(true);
        try {
            const response: any = await api.api.usersControllerGetDentists();
            if (response.success && response.data) {
                setDentists(response.data);
            }
        } catch (error: any) {
            console.error('Failed to fetch dentists:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch dentists');
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
                    doctor={selectedDoctor as any}
                />
            )}
        </MainLayout>
    );
}

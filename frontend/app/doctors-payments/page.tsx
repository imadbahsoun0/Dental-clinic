'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useSettingsStore } from '@/store/settingsStore';
import { useExpenseStore } from '@/store/expenseStore';
import { User } from '@/types';
import { DoctorPaymentModal } from '@/components/doctors/DoctorPaymentModal';
import styles from './doctors-payments.module.css';

export default function DoctorPaymentsPage() {
    const getDentists = useSettingsStore((state) => state.getDentists);
    const updateUser = useSettingsStore((state) => state.updateUser);
    const addExpense = useExpenseStore((state) => state.addExpense);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<User | null>(null);

    const dentists = getDentists();
    const totalPendingPayments = dentists.reduce((sum, doc) => sum + (doc.wallet || 0), 0);

    const handlePayDoctor = (doctor: User) => {
        setSelectedDoctor(doctor);
        setIsModalOpen(true);
    };

    const handleProcessPayment = (paymentData: { amount: number; date: string; notes?: string }) => {
        if (!selectedDoctor) return;

        // Reduce doctor's wallet
        const newWallet = (selectedDoctor.wallet || 0) - paymentData.amount;
        updateUser(selectedDoctor.id, { wallet: newWallet });

        // Create expense entry
        addExpense({
            name: 'Doctor Payment',
            amount: paymentData.amount,
            date: paymentData.date,
            doctorId: selectedDoctor.id,
            expenseType: 'Doctor Payment',
            notes: paymentData.notes || `Commission payment to ${selectedDoctor.name}`,
        });

        setIsModalOpen(false);
        setSelectedDoctor(null);
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
                {dentists.length > 0 ? (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Doctor Name</th>
                                <th>Wallet Balance</th>
                                <th>Status</th>
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
                                    <td>
                                        <span
                                            className={`${styles.wallet} ${(doctor.wallet || 0) > 0 ? styles.walletPositive : ''
                                                }`}
                                        >
                                            ${(doctor.wallet || 0).toFixed(2)}
                                        </span>
                                    </td>
                                    <td>
                                        <span
                                            className={`${styles.statusBadge} ${doctor.status === 'active' ? styles.statusActive : styles.statusInactive
                                                }`}
                                        >
                                            {doctor.status.charAt(0).toUpperCase() + doctor.status.slice(1)}
                                        </span>
                                    </td>
                                    <td>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handlePayDoctor(doctor)}
                                            disabled={!doctor.wallet || doctor.wallet <= 0 || doctor.status !== 'active'}
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
                    doctor={selectedDoctor}
                />
            )}
        </MainLayout>
    );
}

'use client';

import React, { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { usePatientStore } from '@/store/patientStore';
import { useTreatmentStore } from '@/store/treatmentStore';
import { useAppointmentStore } from '@/store/appointmentStore';
import { CollapsibleSection } from '@/components/treatments/CollapsibleSection';
import { PatientProfile } from '@/components/treatments/PatientProfile';
import { TreatmentsTable } from '@/components/treatments/TreatmentsTable';
import { TreatmentModal } from '@/components/treatments/TreatmentModal';
import { BulkDiscountModal } from '@/components/treatments/BulkDiscountModal';
import { MedicalHistoryDisplay } from '@/components/treatments/MedicalHistoryDisplay';
import { PaymentsTable } from '@/components/payments/PaymentsTable';
import { PaymentModal } from '@/components/payments/PaymentModal';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { useSettingsStore } from '@/store/settingsStore';
import { usePaymentStore } from '@/store/paymentStore';
import { Treatment, Payment } from '@/types';
import styles from './treatments.module.css';

export default function TreatmentsPage({ params }: { params: Promise<{ patientId: string }> }) {
    const { patientId } = React.use(params);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
    const [selectedTreatmentIds, setSelectedTreatmentIds] = useState<string[]>([]);
    const [isBulkDiscountModalOpen, setIsBulkDiscountModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'treatments' | 'payments'>('treatments');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [treatmentToDelete, setTreatmentToDelete] = useState<string | null>(null);

    const patients = usePatientStore((state) => state.patients);
    const medicalHistoryQuestions = useSettingsStore((state) => state.medicalHistoryQuestions);
    const allTreatments = useTreatmentStore((state) => state.treatments);
    const treatmentsLoading = useTreatmentStore((state) => state.loading);
    const fetchTreatments = useTreatmentStore((state) => state.fetchTreatments);
    const addTreatment = useTreatmentStore((state) => state.addTreatment);
    const updateTreatment = useTreatmentStore((state) => state.updateTreatment);
    const deleteTreatment = useTreatmentStore((state) => state.deleteTreatment);

    const fetchAppointments = useAppointmentStore((state) => state.fetchAppointments);

    const allPayments = usePaymentStore((state) => state.payments);
    const paymentsLoading = usePaymentStore((state) => state.loading);
    const fetchPayments = usePaymentStore((state) => state.fetchPayments);
    const addPayment = usePaymentStore((state) => state.addPayment);
    const updatePayment = usePaymentStore((state) => state.updatePayment);
    const deletePayment = usePaymentStore((state) => state.deletePayment);

    const patient = patients.find((p) => p.id === patientId);
    const treatments = useMemo(() => {
        return allTreatments.filter((t) => t.patientId === patientId);
    }, [allTreatments, patientId]);

    const payments = useMemo(() => {
        return allPayments.filter((p) => p.patientId === patientId);
    }, [allPayments, patientId]);

    const fetchTreatmentCategories = useSettingsStore((state) => state.fetchTreatmentCategories);
    const fetchTreatmentTypes = useSettingsStore((state) => state.fetchTreatmentTypes);
    const fetchUsers = useSettingsStore((state) => state.fetchUsers);

    // Fetch treatments, payments, appointments, and configuration on mount
    React.useEffect(() => {
        fetchTreatments(patientId);
        fetchPayments(patientId);
        fetchTreatmentCategories();
        fetchTreatmentTypes();
        fetchUsers(); // Fetch users to get doctor commission percentages
        // Fetch specific patient's appointments for linking
        fetchAppointments(1, 1000, undefined, undefined, undefined, patientId);
    }, [patientId, fetchTreatments, fetchPayments, fetchTreatmentCategories, fetchTreatmentTypes, fetchUsers, fetchAppointments]);

    // Calculate totals
    const totalPrice = treatments.reduce((sum, t) => sum + (t.totalPrice - t.discount), 0);
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = totalPrice - totalPaid;

    const handleAddTreatment = () => {
        setSelectedTreatment(null);
        setIsModalOpen(true);
    };

    const handleEditTreatment = (treatment: Treatment) => {
        setSelectedTreatment(treatment);
        setIsModalOpen(true);
    };

    const handleDeleteTreatment = (treatmentId: string) => {
        setTreatmentToDelete(treatmentId);
    };

    const confirmDeleteTreatment = () => {
        if (treatmentToDelete) {
            deleteTreatment(treatmentToDelete);
            setTreatmentToDelete(null);
        }
    };

    const handleStatusChange = (treatmentId: string, newStatus: Treatment['status']) => {
        updateTreatment(treatmentId, { status: newStatus });
    };

    const handleSaveTreatment = (treatmentData: Partial<Treatment>) => {
        if (selectedTreatment) {
            // Update existing treatment
            updateTreatment(selectedTreatment.id, treatmentData);
        } else {
            // Add new treatment
            addTreatment({
                ...treatmentData as Omit<Treatment, 'id' | 'createdAt' | 'updatedAt'>,
                patientId,
            });
        }
    };

    const handleBulkDiscount = (discountPercent: number) => {
        selectedTreatmentIds.forEach(treatmentId => {
            const treatment = treatments.find(t => t.id === treatmentId);
            if (treatment) {
                const discountAmount = (treatment.totalPrice * discountPercent) / 100;
                updateTreatment(treatmentId, { discount: discountAmount });
            }
        });
        setSelectedTreatmentIds([]);
    };

    const handleAddPayment = () => {
        setSelectedPayment(null);
        setIsPaymentModalOpen(true);
    };

    const handleEditPayment = (payment: Payment) => {
        setSelectedPayment(payment);
        setIsPaymentModalOpen(true);
    };

    const handleDeletePayment = (paymentId: string) => {
        if (confirm('Are you sure you want to delete this payment?')) {
            deletePayment(paymentId);
        }
    };

    const handleSavePayment = (paymentData: Partial<Payment>) => {
        if (selectedPayment) {
            updatePayment(selectedPayment.id, paymentData);
        } else {
            addPayment({
                ...paymentData as Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>,
                patientId,
            });
        }
    };

    if (!patient) {
        return (
            <MainLayout title="Treatments">
                <div className={styles.errorState}>
                    <p>Patient not found</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout title="Treatments">
            <div className={styles.pageContainer}>
                {/* Collapsible Patient Profile */}
                <CollapsibleSection title="Patient Information" defaultCollapsed={true}>
                    <PatientProfile patient={patient} />
                </CollapsibleSection>

                {/* Collapsible Medical History */}
                <CollapsibleSection title="Medical History" defaultCollapsed={true}>
                    <MedicalHistoryDisplay
                        medicalHistory={patient.medicalHistory}
                        questions={medicalHistoryQuestions}
                    />
                </CollapsibleSection>

                {/* Summary Cards */}
                <div className={styles.summaryCards}>
                    <Card className={styles.summaryCard}>
                        <div className={styles.summaryLabel}>Total Price</div>
                        <div className={styles.summaryValue}>${totalPrice.toFixed(2)}</div>
                    </Card>
                    <Card className={styles.summaryCard}>
                        <div className={styles.summaryLabel}>Total Paid</div>
                        <div className={styles.summaryValue}>${totalPaid.toFixed(2)}</div>
                    </Card>
                    <Card className={`${styles.summaryCard} ${styles.balanceCard}`}>
                        <div className={styles.summaryLabel}>Balance</div>
                        <div className={`${styles.summaryValue} ${balance > 0 ? styles.balancePositive : styles.balanceZero}`}>
                            ${balance.toFixed(2)}
                        </div>
                    </Card>
                </div>

                {/* Tab Navigation */}
                <div className={styles.tabNavigation}>
                    <button
                        className={`${styles.tab} ${activeTab === 'treatments' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('treatments')}
                    >
                        Treatments
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'payments' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('payments')}
                    >
                        Payments
                    </button>
                </div>

                {/* Treatments Tab Content */}
                {activeTab === 'treatments' && (
                    <>
                        {/* Add Treatment Button */}
                        <div className={styles.actions}>
                            <Button onClick={handleAddTreatment}>+ Add Treatment</Button>
                            {selectedTreatmentIds.length > 0 && (
                                <Button
                                    variant="secondary"
                                    onClick={() => setIsBulkDiscountModalOpen(true)}
                                >
                                    Apply Discount ({selectedTreatmentIds.length})
                                </Button>
                            )}
                        </div>

                        {/* Treatments Table */}
                        <TreatmentsTable
                            treatments={treatments}
                            selectedTreatments={selectedTreatmentIds}
                            onSelectionChange={setSelectedTreatmentIds}
                            onEdit={handleEditTreatment}
                            onDelete={handleDeleteTreatment}
                            onStatusChange={handleStatusChange}
                        />
                    </>
                )}

                {/* Payments Tab Content */}
                {activeTab === 'payments' && (
                    <>
                        <div className={styles.actions}>
                            <Button onClick={handleAddPayment}>+ Add Payment</Button>
                        </div>

                        <PaymentsTable
                            payments={payments}
                            onEdit={handleEditPayment}
                            onDelete={handleDeletePayment}
                        />
                    </>
                )}

                {/* Treatment Modal */}
                <TreatmentModal
                    isOpen={isModalOpen}
                    treatment={selectedTreatment}
                    patientId={patientId}
                    onSave={handleSaveTreatment}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedTreatment(null);
                    }}
                />

                {/* Bulk Discount Modal */}
                <BulkDiscountModal
                    isOpen={isBulkDiscountModalOpen}
                    treatments={treatments.filter(t => selectedTreatmentIds.includes(t.id))}
                    onApply={handleBulkDiscount}
                    onClose={() => setIsBulkDiscountModalOpen(false)}
                />

                {/* Payment Modal */}
                <PaymentModal
                    isOpen={isPaymentModalOpen}
                    payment={selectedPayment}
                    onSave={handleSavePayment}
                    onClose={() => {
                        setIsPaymentModalOpen(false);
                        setSelectedPayment(null);
                    }}
                />

                {/* Delete Treatment Confirmation */}
                <ConfirmationModal
                    isOpen={treatmentToDelete !== null}
                    onClose={() => setTreatmentToDelete(null)}
                    onConfirm={confirmDeleteTreatment}
                    title="Delete Treatment"
                    message="Are you sure you want to delete this treatment? This action cannot be undone."
                    confirmLabel="Delete"
                    variant="danger"
                />
            </div>
        </MainLayout>
    );
}

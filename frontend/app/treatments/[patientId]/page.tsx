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
import { Treatment, Payment, Message } from '@/types';
import styles from './treatments.module.css';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function TreatmentsPage({ params }: { params: Promise<{ patientId: string }> }) {
    const { patientId } = React.use(params);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
    const [selectedTreatmentIds, setSelectedTreatmentIds] = useState<string[]>([]);
    const [isBulkDiscountModalOpen, setIsBulkDiscountModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'treatments' | 'payments' | 'reminders'>('treatments');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [treatmentToDelete, setTreatmentToDelete] = useState<string | null>(null);
    const [reminders, setReminders] = useState<Message[]>([]);
    const [remindersLoading, setRemindersLoading] = useState(false);

    const selectedPatient = usePatientStore((state) => state.selectedPatient);
    const fetchPatient = usePatientStore((state) => state.fetchPatient);
    const setSelectedPatient = usePatientStore((state) => state.setSelectedPatient);
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

    const patient = selectedPatient;
    const treatments = useMemo(() => {
        return allTreatments.filter((t) => t.patientId === patientId);
    }, [allTreatments, patientId]);

    const payments = useMemo(() => {
        return allPayments.filter((p) => p.patientId === patientId);
    }, [allPayments, patientId]);

    const fetchTreatmentCategories = useSettingsStore((state) => state.fetchTreatmentCategories);
    const fetchTreatmentTypes = useSettingsStore((state) => state.fetchTreatmentTypes);
    const fetchUsers = useSettingsStore((state) => state.fetchUsers);

    // Fetch patient data on mount
    React.useEffect(() => {
        const loadPatient = async () => {
            const patient = await fetchPatient(patientId);
            if (patient) {
                setSelectedPatient(patient);
            }
        };
        loadPatient();
    }, [patientId, fetchPatient, setSelectedPatient]);

    // Fetch reminders
    const fetchReminders = async () => {
        setRemindersLoading(true);
        try {
            const response = await api.api.messagesControllerFindAll({ 
                patientId,
                page: 1,
                limit: 1000
            });
            
            if (response.success && response.data) {
                // Handle both array and object with data property formats
                const data = response.data as any;
                if (Array.isArray(data)) {
                    setReminders(data);
                } else if (data.data && Array.isArray(data.data)) {
                    setReminders(data.data);
                } else {
                    setReminders([]);
                }
            } else {
                setReminders([]);
            }
        } catch (error) {
            console.error('Error fetching reminders:', error);
            toast.error('Failed to load reminders');
            setReminders([]);
        } finally {
            setRemindersLoading(false);
        }
    };

    // Fetch treatments, payments, appointments, and configuration on mount
    React.useEffect(() => {
        fetchTreatments(patientId);
        fetchPayments(patientId);
        fetchTreatmentCategories();
        fetchTreatmentTypes();
        fetchUsers(); // Fetch users to get doctor commission percentages
        // Fetch specific patient's appointments for linking
        fetchAppointments(1, 1000, undefined, undefined, undefined, patientId);
        fetchReminders();
    }, [patientId, fetchTreatments, fetchPayments, fetchTreatmentCategories, fetchTreatmentTypes, fetchUsers, fetchAppointments]);

    // Calculate totals (excluding planned and cancelled treatments from balance)
    const totalPrice = treatments.reduce((sum, t) => sum + (t.totalPrice - t.discount), 0);
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    // Filter out planned and cancelled treatments when calculating balance
    const balanceTotalPrice = treatments
        .filter(t => t.status !== 'planned' && t.status !== 'cancelled')
        .reduce((sum, t) => sum + (t.totalPrice - t.discount), 0);
    const balance = balanceTotalPrice - totalPaid;

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

    const handleBulkDiscount = (totalDiscountAmount: number) => {
        // Get selected treatments
        const selectedTreatments = treatments.filter(t => selectedTreatmentIds.includes(t.id));
        
        // Calculate total price of selected treatments
        const totalPrice = selectedTreatments.reduce((sum, t) => sum + t.totalPrice, 0);
        
        if (totalPrice === 0) {
            setSelectedTreatmentIds([]);
            return;
        }
        
        // Distribute discount proportionally based on each treatment's price
        let remainingDiscount = totalDiscountAmount;
        
        selectedTreatments.forEach((treatment, index) => {
            // Calculate proportional discount for this treatment
            const proportion = treatment.totalPrice / totalPrice;
            let treatmentDiscount: number;
            
            // For the last treatment, use remaining discount to avoid rounding errors
            if (index === selectedTreatments.length - 1) {
                treatmentDiscount = remainingDiscount;
            } else {
                treatmentDiscount = parseFloat((totalDiscountAmount * proportion).toFixed(2));
                remainingDiscount -= treatmentDiscount;
            }
            
            // Update treatment with its proportional discount
            updateTreatment(treatment.id, { discount: treatmentDiscount });
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
                    <button
                        className={`${styles.tab} ${activeTab === 'reminders' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('reminders')}
                    >
                        Reminders
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

                {/* Reminders Tab Content */}
                {activeTab === 'reminders' && (
                    <Card>
                        {remindersLoading ? (
                            <div style={{ textAlign: 'center', padding: '48px' }}>
                                <p>Loading reminders...</p>
                            </div>
                        ) : reminders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '48px' }}>
                                <p>No reminders sent yet</p>
                            </div>
                        ) : (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Content</th>
                                        <th>Status</th>
                                        <th>Sent At</th>
                                        <th>Error</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reminders.map((reminder) => (
                                        <tr key={reminder.id}>
                                            <td>
                                                {reminder.type.split('_').map(word => 
                                                    word.charAt(0).toUpperCase() + word.slice(1)
                                                ).join(' ')}
                                            </td>
                                            <td style={{ maxWidth: '400px', wordWrap: 'break-word' }}>
                                                {reminder.content}
                                            </td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${styles[`status${reminder.status.charAt(0).toUpperCase() + reminder.status.slice(1)}`]}`}>
                                                    {reminder.status.charAt(0).toUpperCase() + reminder.status.slice(1)}
                                                </span>
                                            </td>
                                            <td>
                                                {reminder.sentAt 
                                                    ? new Date(reminder.sentAt).toLocaleString()
                                                    : 'Not sent'
                                                }
                                            </td>
                                            <td style={{ color: 'var(--danger)', fontSize: '13px' }}>
                                                {reminder.error || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </Card>
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

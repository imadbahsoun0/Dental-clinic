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
import { MedicalHistoryEditModal } from '@/components/treatments/MedicalHistoryEditModal';
import { PaymentsTable } from '@/components/payments/PaymentsTable';
import { PaymentModal } from '@/components/payments/PaymentModal';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { PatientModal } from '@/components/patients/PatientModal';
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
    const [isPatientEditModalOpen, setIsPatientEditModalOpen] = useState(false);
    const [isMedicalHistoryEditModalOpen, setIsMedicalHistoryEditModalOpen] = useState(false);

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
    const fetchMedicalHistoryQuestions = useSettingsStore((state) => state.fetchMedicalHistoryQuestions);

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

            const isRecord = (value: unknown): value is Record<string, unknown> =>
                typeof value === 'object' && value !== null;

            const isMessage = (value: unknown): value is Message => {
                if (!isRecord(value)) return false;
                return (
                    typeof value.id === 'string' &&
                    typeof value.patientId === 'string' &&
                    typeof value.type === 'string' &&
                    typeof value.content === 'string' &&
                    typeof value.status === 'string' &&
                    typeof value.createdAt === 'string' &&
                    typeof value.updatedAt === 'string'
                );
            };
            
            if (response.success) {
                const raw = response.data;
                const parsed = Array.isArray(raw) ? raw.filter(isMessage) : [];
                setReminders(parsed);
            } else setReminders([]);
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
        fetchMedicalHistoryQuestions(); // Fetch medical history questions for the edit modal
        // Fetch specific patient's appointments for linking
        fetchAppointments(1, 1000, undefined, undefined, undefined, patientId);
        fetchReminders();
    }, [patientId, fetchTreatments, fetchPayments, fetchTreatmentCategories, fetchTreatmentTypes, fetchUsers, fetchMedicalHistoryQuestions, fetchAppointments]);

    // Calculate totals (excluding planned and cancelled treatments from balance)
    const totalPrice = treatments.filter( t => t.status !== 'planned' && t.status !== 'cancelled').reduce((sum, t) => sum + (t.totalPrice - t.discount), 0);
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

    const handleStatusChange = (treatmentId: string, newStatus: NonNullable<Treatment['status']>, appointmentId?: string) => {
        updateTreatment(treatmentId, {
            status: newStatus,
            ...(appointmentId ? { appointmentId } : {}),
        });
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

    const handleEditPatientProfile = () => {
        setIsPatientEditModalOpen(true);
    };

    const handleEditMedicalHistory = () => {
        setIsMedicalHistoryEditModalOpen(true);
    };

    const handleSaveMedicalHistory = async (data: {
        dateOfBirth?: string;
        emergencyContact?: string;
        email?: string;
        bloodType?: string;
        address?: string;
        responses: Array<{
            questionId: string;
            answer: string | string[];
            answerText?: string;
        }>;
    }) => {
        if (!patient) return;
        
        // Use existing signature from current medical history
        const payload = {
            dateOfBirth: data.dateOfBirth || '',
            emergencyContact: data.emergencyContact || '',
            email: data.email,
            bloodType: data.bloodType || '',
            address: data.address || '',
            responses: data.responses,
            signature: patient.medicalHistory?.signature || ''
        };
        await api.api.patientsControllerSubmitMedicalHistory(patientId, payload);
        const updatedPatient = await fetchPatient(patientId);
        if (updatedPatient) {
            setSelectedPatient(updatedPatient);
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
                    <PatientProfile patient={patient} onEdit={handleEditPatientProfile} />
                </CollapsibleSection>

                {/* Collapsible Medical History */}
                <CollapsibleSection title="Medical History" defaultCollapsed={true}>
                    <MedicalHistoryDisplay
                        medicalHistory={patient.medicalHistory}
                        questions={medicalHistoryQuestions}
                        onEdit={patient.medicalHistory ? handleEditMedicalHistory : undefined}
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
                            <>
                                {/* Desktop Table View */}
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

                                {/* Mobile Card View */}
                                <div className={styles.reminderCards}>
                                    {reminders.map((reminder) => (
                                        <div key={reminder.id} className={styles.reminderCard}>
                                            <div className={styles.reminderCardHeader}>
                                                <div className={styles.reminderType}>
                                                    {reminder.type.split('_').map(word => 
                                                        word.charAt(0).toUpperCase() + word.slice(1)
                                                    ).join(' ')}
                                                </div>
                                                <span className={`${styles.statusBadge} ${styles[`status${reminder.status.charAt(0).toUpperCase() + reminder.status.slice(1)}`]}`}>
                                                    {reminder.status.charAt(0).toUpperCase() + reminder.status.slice(1)}
                                                </span>
                                            </div>
                                            <div className={styles.reminderCardBody}>
                                                <div className={styles.reminderContent}>
                                                    {reminder.content}
                                                </div>
                                                <div className={styles.reminderMeta}>
                                                    <div className={styles.reminderMetaRow}>
                                                        <span>Sent:</span>
                                                        <span>
                                                            {reminder.sentAt 
                                                                ? new Date(reminder.sentAt).toLocaleString()
                                                                : 'Not sent'
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                                {reminder.error && (
                                                    <div className={styles.reminderError}>
                                                        {reminder.error}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
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

                {/* Patient Profile Edit Modal */}
                <PatientModal
                    isOpen={isPatientEditModalOpen}
                    onClose={() => setIsPatientEditModalOpen(false)}
                    patientId={patientId}
                />

                {/* Medical History Edit Modal */}
                {patient.medicalHistory && (
                    <MedicalHistoryEditModal
                        isOpen={isMedicalHistoryEditModalOpen}
                        onClose={() => setIsMedicalHistoryEditModalOpen(false)}
                        medicalHistory={patient.medicalHistory}
                        questions={medicalHistoryQuestions}
                        onSave={handleSaveMedicalHistory}
                    />
                )}
            </div>
        </MainLayout>
    );
}

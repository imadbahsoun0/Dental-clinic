'use client';

import React, { useState } from 'react';
import { Treatment } from '@/types';
import { useSettingsStore } from '@/store/settingsStore';
import { useAppointmentStore } from '@/store/appointmentStore';
import { formatToothNumbers } from '@/constants/teeth';
import { TreatmentCompletionModal } from './TreatmentCompletionModal';
import styles from './TreatmentsTable.module.css';

interface TreatmentsTableProps {
    treatments: Treatment[];
    selectedTreatments?: string[]; // Array of selected treatment IDs
    onSelectionChange?: (selectedIds: string[]) => void;
    onEdit: (treatment: Treatment) => void;
    onDelete: (treatmentId: string) => void;
    onStatusChange: (treatmentId: string, newStatus: Treatment['status']) => void;
}

export const TreatmentsTable: React.FC<TreatmentsTableProps> = ({
    treatments,
    selectedTreatments = [],
    onSelectionChange,
    onEdit,
    onDelete,
    onStatusChange,
}) => {
    const treatmentTypes = useSettingsStore((state) => state.treatmentTypes);
    const appointments = useAppointmentStore((state) => state.appointments);
    const users = useSettingsStore((state) => state.users);
    const [completionModalState, setCompletionModalState] = useState<{
        isOpen: boolean;
        treatment: Treatment | null;
    }>({ isOpen: false, treatment: null });
    const [isProcessing, setIsProcessing] = useState(false);

    const getTreatmentTypeName = (treatmentTypeId: string) => {
        const type = treatmentTypes.find((t) => t.id === treatmentTypeId);
        return type?.name || 'Unknown';
    };

    // Helper to get date and doctor from linked appointment
    const getAppointmentDetails = (treatment: Treatment) => {
        // 1. Check for populated appointment object (from backend)
        if (treatment.appointment) {
            return {
                date: new Date(treatment.appointment.date).toLocaleDateString(),
                doctor: treatment.appointment.doctor?.name || treatment.appointment.drName || '-'
            };
        }

        // 2. Fallback to store lookup using ID
        if (treatment.appointmentId) {
            const appointment = appointments.find(apt => apt.id === treatment.appointmentId);
            if (appointment) {
                return {
                    date: new Date(appointment.date).toLocaleDateString(),
                    doctor: appointment.doctor?.name || appointment.drName || '-'
                };
            }
        }

        // 3. Fallback to treatment's own legacy data
        return {
            date: new Date(treatment.date).toLocaleDateString(),
            doctor: treatment.drName || '-'
        };
    };

    const getStatusBadgeClass = (status?: string) => {
        switch (status) {
            case 'completed':
                return styles.statusCompleted;
            case 'in-progress':
                return styles.statusInProgress;
            case 'cancelled':
                return styles.statusCancelled;
            default:
                return styles.statusPlanned;
        }
    };

    const handleSelectAll = () => {
        if (!onSelectionChange) return;
        if (selectedTreatments.length === treatments.length) {
            onSelectionChange([]);
        } else {
            onSelectionChange(treatments.map(t => t.id));
        }
    };

    const handleSelectTreatment = (treatmentId: string) => {
        if (!onSelectionChange) return;
        if (selectedTreatments.includes(treatmentId)) {
            onSelectionChange(selectedTreatments.filter(id => id !== treatmentId));
        } else {
            onSelectionChange([...selectedTreatments, treatmentId]);
        }
    };

    const handleStatusChange = (treatment: Treatment, newStatus: Treatment['status']) => {
        // If changing to completed, show confirmation modal
        if (newStatus === 'completed' && treatment.status !== 'completed') {
            setCompletionModalState({ isOpen: true, treatment });
        } else {
            // For other status changes, proceed directly
            onStatusChange(treatment.id, newStatus);
        }
    };

    const handleConfirmCompletion = async () => {
        if (!completionModalState.treatment) return;

        setIsProcessing(true);
        try {
            await onStatusChange(completionModalState.treatment.id, 'completed');
            setCompletionModalState({ isOpen: false, treatment: null });
        } catch (error) {
            console.error('Failed to complete treatment:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCloseModal = () => {
        if (!isProcessing) {
            setCompletionModalState({ isOpen: false, treatment: null });
        }
    };

    // Helper to get doctor info for completion modal
    const getDoctorInfo = (treatment: Treatment) => {
        if (treatment.appointment?.doctor) {
            return {
                name: treatment.appointment.doctor.name,
                id: treatment.appointment.doctor.id,
            };
        }
        if (treatment.appointmentId) {
            const appointment = appointments.find(apt => apt.id === treatment.appointmentId);
            if (appointment?.doctor) {
                return {
                    name: appointment.doctor.name,
                    id: appointment.doctor.id,
                };
            }
        }
        return null;
    };

    // Get doctor commission percentage from users store
    const getDoctorCommissionPercent = (doctorId?: string): number | undefined => {
        if (!doctorId) return undefined;
        const doctor = users.find(u => u.id === doctorId);
        return doctor?.percentage;
    };

    if (treatments.length === 0) {
        return (
            <div className={styles.emptyState}>
                <p>No treatments yet. Click "Add Treatment" to get started.</p>
            </div>
        );
    }

    const isAllSelected = selectedTreatments.length === treatments.length && treatments.length > 0;

    return (
        <>
            {completionModalState.treatment && (
                <TreatmentCompletionModal
                    isOpen={completionModalState.isOpen}
                    onClose={handleCloseModal}
                    onConfirm={handleConfirmCompletion}
                    treatmentName={getTreatmentTypeName(completionModalState.treatment.treatmentTypeId)}
                    totalPrice={completionModalState.treatment.totalPrice}
                    discount={completionModalState.treatment.discount}
                    doctorName={getDoctorInfo(completionModalState.treatment)?.name}
                    doctorCommissionPercent={getDoctorCommissionPercent(getDoctorInfo(completionModalState.treatment)?.id)}
                    isLoading={isProcessing}
                />
            )}
            
            {/* Desktop Table View */}
            <div className={styles.tableContainer}>
                <table className={styles.treatmentsTable}>
                    <thead>
                        <tr>
                            {onSelectionChange && (
                                <th style={{ width: '40px' }}>
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                        title="Select all"
                                    />
                                </th>
                            )}
                            <th>Treatment</th>
                            <th>Tooth</th>
                            <th>Suggested Price</th>
                            <th>Discount</th>
                            <th>Total Price</th>
                            <th>Date</th>
                            <th>Doctor</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {treatments.map((treatment) => {
                            const totalPrice = treatment.totalPrice - treatment.discount;
                            const isSelected = selectedTreatments.includes(treatment.id);
                            const appointmentDetails = getAppointmentDetails(treatment);
                            const isCompleted = treatment.status === 'completed';

                            return (
                                <tr key={treatment.id} className={isSelected ? styles.selectedRow : ''}>
                                    {onSelectionChange && (
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleSelectTreatment(treatment.id)}
                                            />
                                        </td>
                                    )}
                                    <td>{getTreatmentTypeName(treatment.treatmentTypeId)}</td>
                                    <td>
                                        {treatment.toothName ||
                                            (treatment.toothNumbers?.length
                                                ? formatToothNumbers(treatment.toothNumbers)
                                                : `#${treatment.toothNumber}`)}
                                    </td>
                                    <td className={styles.currency}>${treatment.totalPrice.toFixed(2)}</td>
                                    <td className={styles.currency}>${treatment.discount.toFixed(2)}</td>
                                    <td className={`${styles.currency} ${styles.totalPrice}`}>
                                        ${totalPrice.toFixed(2)}
                                    </td>
                                    <td>{appointmentDetails.date}</td>
                                    <td>{appointmentDetails.doctor}</td>
                                    <td>
                                        <select
                                            className={`${styles.statusSelect} ${getStatusBadgeClass(treatment.status)}`}
                                            value={treatment.status || 'planned'}
                                            onChange={(e) => handleStatusChange(treatment, e.target.value as Treatment['status'])}
                                            title={isCompleted ? "Completed treatments cannot be changed" : "Click to change status"}
                                            disabled={isCompleted}
                                        >
                                            <option value="planned">Planned</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button
                                                className={styles.editBtn}
                                                onClick={() => onEdit(treatment)}
                                                title={isCompleted ? "Completed treatments cannot be edited" : "Edit treatment"}
                                                disabled={isCompleted}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => onDelete(treatment.id)}
                                                title={isCompleted ? "Completed treatments cannot be deleted" : "Delete treatment"}
                                                disabled={isCompleted}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className={styles.mobileCardView}>
                {treatments.map((treatment) => {
                    const totalPrice = treatment.totalPrice - treatment.discount;
                    const isSelected = selectedTreatments.includes(treatment.id);
                    const appointmentDetails = getAppointmentDetails(treatment);
                    const isCompleted = treatment.status === 'completed';

                    return (
                        <div 
                            key={treatment.id} 
                            className={`${styles.treatmentCard} ${isSelected ? styles.selected : ''}`}
                        >
                            <div className={styles.cardHeader}>
                                <div className={styles.cardHeaderLeft}>
                                    <div className={styles.cardTreatmentName}>
                                        {getTreatmentTypeName(treatment.treatmentTypeId)}
                                    </div>
                                    <div className={styles.cardTeethInfo}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/>
                                        </svg>
                                        {treatment.toothName ||
                                            (treatment.toothNumbers?.length
                                                ? formatToothNumbers(treatment.toothNumbers)
                                                : `#${treatment.toothNumber}`)}
                                    </div>
                                </div>
                                {onSelectionChange && (
                                    <input
                                        type="checkbox"
                                        className={styles.cardCheckbox}
                                        checked={isSelected}
                                        onChange={() => handleSelectTreatment(treatment.id)}
                                    />
                                )}
                            </div>
                            
                            <div className={styles.cardBody}>
                                <div className={styles.cardRow}>
                                    <span className={styles.cardLabel}>Total to Pay</span>
                                    <span className={`${styles.cardValue} ${styles.currency}`}>
                                        ${treatment.totalPrice.toFixed(2)}
                                    </span>
                                </div>
                                <div className={styles.cardRow}>
                                    <span className={styles.cardLabel}>Discount</span>
                                    <span className={`${styles.cardValue} ${styles.currency}`}>
                                        ${treatment.discount.toFixed(2)}
                                    </span>
                                </div>
                                <div className={styles.cardRow}>
                                    <span className={styles.cardLabel}>Total Price</span>
                                    <span className={`${styles.cardValue} ${styles.currency}`} style={{ color: 'var(--primary)' }}>
                                        ${totalPrice.toFixed(2)}
                                    </span>
                                </div>
                                <div className={styles.cardRow}>
                                    <span className={styles.cardLabel}>Date</span>
                                    <span className={styles.cardValue}>{appointmentDetails.date}</span>
                                </div>
                                <div className={styles.cardRow}>
                                    <span className={styles.cardLabel}>Doctor</span>
                                    <span className={styles.cardValue}>{appointmentDetails.doctor}</span>
                                </div>
                            </div>
                            
                            <div className={styles.cardFooter}>
                                <select
                                    className={`${styles.cardStatusSelect} ${getStatusBadgeClass(treatment.status)}`}
                                    value={treatment.status || 'planned'}
                                    onChange={(e) => handleStatusChange(treatment, e.target.value as Treatment['status'])}
                                    disabled={isCompleted}
                                >
                                    <option value="planned">Planned</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <div className={styles.cardActions}>
                                    <button
                                        className={styles.cardActionBtn}
                                        onClick={() => onEdit(treatment)}
                                        disabled={isCompleted}
                                        title={isCompleted ? "Completed treatments cannot be edited" : "Edit"}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                    </button>
                                    <button
                                        className={styles.cardActionBtn}
                                        onClick={() => onDelete(treatment.id)}
                                        disabled={isCompleted}
                                        title={isCompleted ? "Completed treatments cannot be deleted" : "Delete"}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
};

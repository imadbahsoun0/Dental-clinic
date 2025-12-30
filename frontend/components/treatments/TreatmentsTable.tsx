'use client';

import React from 'react';
import { Treatment } from '@/types';
import { useSettingsStore } from '@/store/settingsStore';
import { useAppointmentStore } from '@/store/appointmentStore';
import { formatToothNumbers } from '@/constants/teeth';
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

    if (treatments.length === 0) {
        return (
            <div className={styles.emptyState}>
                <p>No treatments yet. Click "Add Treatment" to get started.</p>
            </div>
        );
    }

    const isAllSelected = selectedTreatments.length === treatments.length && treatments.length > 0;

    return (
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
                        <th>Total to Pay</th>
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
                                        onChange={(e) => onStatusChange(treatment.id, e.target.value as Treatment['status'])}
                                        title="Click to change status"
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
                                            title="Edit treatment"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={() => onDelete(treatment.id)}
                                            title="Delete treatment"
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
    );
};

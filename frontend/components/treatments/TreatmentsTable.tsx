'use client';

import React from 'react';
import { Treatment } from '@/types';
import { useSettingsStore } from '@/store/settingsStore';
import { useAppointmentStore } from '@/store/appointmentStore';
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
    const appointmentTypes = useSettingsStore((state) => state.appointmentTypes);
    const appointments = useAppointmentStore((state) => state.appointments);

    const getAppointmentTypeName = (appointmentTypeId: string) => {
        const type = appointmentTypes.find((t) => t.id === appointmentTypeId);
        return type?.name || 'Unknown';
    };

    // Helper to get date and doctor from linked appointment
    const getAppointmentDetails = (treatment: Treatment) => {
        if (treatment.appointmentId) {
            const appointment = appointments.find(apt => apt.id === treatment.appointmentId);
            if (appointment) {
                return {
                    date: new Date(appointment.date).toLocaleDateString(),
                    doctor: appointment.drName || '-'
                };
            }
        }
        // Fallback to treatment's own data
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

    const formatStatus = (status?: string) => {
        switch (status) {
            case 'in-progress':
                return 'In Progress';
            case 'completed':
                return 'Completed';
            case 'cancelled':
                return 'Cancelled';
            default:
                return 'Planned';
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
                                <td>{getAppointmentTypeName(treatment.appointmentTypeId)}</td>
                                <td>
                                    {treatment.toothName || `#${treatment.toothNumber}`}
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

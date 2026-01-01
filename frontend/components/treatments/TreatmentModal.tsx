'use client';

import React, { useState, useEffect } from 'react';
import { Treatment, Appointment } from '@/types';
import { useSettingsStore } from '@/store/settingsStore';
import { useAppointmentStore } from '@/store/appointmentStore';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { ToothSelector } from '@/components/common/ToothSelector';
import { Button } from '@/components/common/Button';
import { formatToothNumbers } from '@/constants/teeth';
import toast from 'react-hot-toast';
import { formatLocalDate } from '@/utils/dateUtils';
import styles from './TreatmentModal.module.css';

interface TreatmentModalProps {
    isOpen: boolean;
    treatment?: Treatment | null;
    patientId: string;
    onSave: (treatmentData: Partial<Treatment>) => void;
    onClose: () => void;
}

export const TreatmentModal: React.FC<TreatmentModalProps> = ({
    isOpen,
    treatment,
    patientId,
    onSave,
    onClose,
}) => {
    const treatmentTypes = useSettingsStore((state) => state.treatmentTypes);
    const treatmentCategories = useSettingsStore((state) => state.treatmentCategories);
    const appointments = useAppointmentStore((state) => state.appointments);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');

    const [formData, setFormData] = useState({
        treatmentTypeId: '',
        selectedTeeth: [] as number[],
        discountPercent: '0',
        appointmentId: '',
        status: 'planned' as 'planned' | 'in-progress' | 'completed' | 'cancelled',
    });

    const [totalToPay, setTotalToPay] = useState(0);

    // Get patient's appointments for linking
    // Handle both flat patientId and nested patient object structures
    const patientAppointments = appointments.filter(apt =>
        (apt.patientId === patientId) || (apt.patient?.id === patientId)
    );

    // Helper function to find matching price variant for a tooth number
    const findPriceForTooth = (treatmentTypeId: string, toothNum: number): number => {
        const treatmentType = treatmentTypes.find(t => t.id === treatmentTypeId);
        if (!treatmentType) return 0;

        // Find variant that includes this tooth number
        const matchingVariant = treatmentType.priceVariants.find(variant =>
            variant.toothNumbers?.includes(toothNum)
        );

        if (matchingVariant) return matchingVariant.price;

        // If no specific match, look for default variant
        const defaultVariant = treatmentType.priceVariants.find(v => v.isDefault);
        if (defaultVariant) return defaultVariant.price;

        // Final fallback to first variant
        return treatmentType.priceVariants[0]?.price || 0;
    };

    // Reset form when modal opens/closes or treatment changes
    useEffect(() => {
        if (isOpen && treatment) {
            // Editing existing treatment
            const discountPercent = treatment.totalPrice > 0
                ? ((treatment.discount / treatment.totalPrice) * 100).toFixed(2)
                : '0';

            // Support both old (single tooth) and new (multiple teeth) format
            const teeth = treatment.toothNumbers || [treatment.toothNumber];

            setFormData({
                treatmentTypeId: treatment.treatmentTypeId,
                selectedTeeth: teeth,
                discountPercent: discountPercent,
                appointmentId: treatment.appointmentId || '',
                status: treatment.status || 'planned',
            });

            const selectedType = treatmentTypes.find(t => t.id === treatment.treatmentTypeId);
            if (selectedType?.categoryId) {
                setSelectedCategoryId(selectedType.categoryId);
            }
            setTotalToPay(treatment.totalPrice);
        } else if (isOpen) {
            // Adding new treatment
            setFormData({
                treatmentTypeId: '',
                selectedTeeth: [],
                discountPercent: '0',
                appointmentId: '',
                status: 'planned',
            });
            setSelectedCategoryId('');
            setTotalToPay(0);
        }
    }, [isOpen, treatment, treatmentTypes]);

    // Auto-select today's appointment for new treatments
    useEffect(() => {
        if (isOpen && !treatment && !formData.appointmentId && patientAppointments.length > 0) {
            const today = formatLocalDate(new Date());
            // Match exactly or startsWith (to handle potential time components if ISO)
            const todayAppointment = patientAppointments.find(apt =>
                apt.date === today || apt.date.startsWith(today)
            );

            if (todayAppointment) {
                setFormData(prev => ({ ...prev, appointmentId: todayAppointment.id }));
            }
        }
    }, [isOpen, treatment, patientAppointments, formData.appointmentId]);

    // Auto-calculate total when treatment type, teeth, or discount changes
    useEffect(() => {
        if (formData.treatmentTypeId && formData.selectedTeeth.length > 0) {
            // Calculate total price for all selected teeth
            let totalPrice = 0;

            for (const toothNum of formData.selectedTeeth) {
                const price = findPriceForTooth(formData.treatmentTypeId, toothNum);
                totalPrice += price;
            }

            // Calculate discount amount from percentage
            const discountAmount = (totalPrice * (parseFloat(formData.discountPercent) || 0)) / 100;
            // Set total to be paid as price minus discount
            setTotalToPay(totalPrice - discountAmount);
        }
    }, [formData.treatmentTypeId, formData.selectedTeeth, formData.discountPercent, treatmentTypes]);

    const handleSubmit = () => {
        if (formData.selectedTeeth.length === 0) {
            alert('Please select at least one tooth');
            return;
        }

        // Warn if status is not planned and no appointment is selected
        if (formData.status !== 'planned' && !formData.appointmentId) {
            toast('Warning: Treatment is not planned but no appointment is linked', {
                icon: '⚠️',
                duration: 4000,
            });
        }

        // Calculate total price for all teeth
        let totalPrice = 0;
        for (const toothNum of formData.selectedTeeth) {
            const price = findPriceForTooth(formData.treatmentTypeId, toothNum);
            totalPrice += price;
        }

        // Calculate actual discount amount from percentage
        const discountAmount = (totalPrice * (parseFloat(formData.discountPercent) || 0)) / 100;

        // Get date and doctor from appointment if linked
        let date = formatLocalDate(new Date());
        let drName = undefined;

        if (formData.appointmentId) {
            const linkedAppointment = appointments.find(apt => apt.id === formData.appointmentId);
            if (linkedAppointment) {
                date = linkedAppointment.date;
                drName = linkedAppointment.drName;
            }
        }

        const treatmentData: Partial<Treatment> = {
            treatmentTypeId: formData.treatmentTypeId,
            toothNumber: formData.selectedTeeth[0], // Legacy: use first tooth
            toothNumbers: formData.selectedTeeth, // New: all selected teeth
            appointmentId: formData.appointmentId || undefined,
            totalPrice: totalPrice,
            amountPaid: 0,
            discount: discountAmount,
            date: date,
            drName: drName,
            status: formData.status,
        };

        onSave(treatmentData);
        onClose();
    };

    const isValid = formData.treatmentTypeId && formData.selectedTeeth.length > 0;

    // Calculate total base price
    let totalBasePrice = 0;
    for (const toothNum of formData.selectedTeeth) {
        totalBasePrice += findPriceForTooth(formData.treatmentTypeId, toothNum);
    }

    const discountAmount = (totalBasePrice * (parseFloat(formData.discountPercent) || 0)) / 100;

    // Get price range for display in dropdown
    const getPriceRangeDisplay = (treatmentType: any) => {
        if (!treatmentType.priceVariants || treatmentType.priceVariants.length === 0) return '';
        if (treatmentType.priceVariants.length === 1) {
            return `$${treatmentType.priceVariants[0].price}`;
        }
        const prices = treatmentType.priceVariants.map((v: any) => v.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        return minPrice === maxPrice ? `$${minPrice}` : `$${minPrice}-$${maxPrice}`;
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={treatment ? 'Edit Treatment' : 'Add Treatment'}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!isValid}>
                        {treatment ? 'Update' : 'Add'} Treatment
                    </Button>
                </>
            }
        >
            <div className={styles.form}>
                {/* Treatment Category Dropdown */}
                <div>
                    <label htmlFor="treatmentCategory" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                        Treatment Category *
                    </label>
                    <select
                        id="treatmentCategory"
                        value={selectedCategoryId}
                        onChange={(e) => {
                            setSelectedCategoryId(e.target.value);
                            setFormData({ ...formData, treatmentTypeId: '' });
                        }}
                        style={{
                            width: '100%',
                            padding: '10px 14px',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '14px',
                            backgroundColor: 'var(--bg-white)',
                            cursor: 'pointer',
                        }}
                    >
                        <option value="">Select a category...</option>
                        {treatmentCategories
                            .sort((a, b) => a.order - b.order)
                            .map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.icon} {category.name}
                                </option>
                            ))}
                    </select>
                </div>

                {/* Treatment Name Dropdown */}
                {selectedCategoryId && (
                    <div>
                        <label htmlFor="treatmentType" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                            Treatment Name *
                        </label>
                        <select
                            id="treatmentType"
                            value={formData.treatmentTypeId}
                            onChange={(e) => setFormData({ ...formData, treatmentTypeId: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '14px',
                                backgroundColor: 'var(--bg-white)',
                                cursor: 'pointer',
                            }}
                        >
                            <option value="">Select a treatment...</option>
                            {treatmentTypes
                                .filter((t) => t.categoryId === selectedCategoryId)
                                .map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name} - {getPriceRangeDisplay(t)}
                                    </option>
                                ))}
                        </select>
                    </div>
                )}

                {/* Visual Tooth Selector */}
                <div className={styles.selectorWrapper}>
                    <ToothSelector
                        selectedTeeth={formData.selectedTeeth}
                        onChange={(teeth) => setFormData({ ...formData, selectedTeeth: teeth })}
                        label="Select Teeth *"
                    />
                </div>

                {/* Status Selection */}
                <Select
                    label="Status *"
                    options={[
                        { value: 'planned', label: 'Planned' },
                        { value: 'in-progress', label: 'In Progress' },
                        { value: 'completed', label: 'Completed' },
                        { value: 'cancelled', label: 'Cancelled' },
                    ]}
                    value={formData.status}
                    onChange={(value) => setFormData({ ...formData, status: value as any })}
                />

                {/* Appointment Selection - optional for non-planned treatments */}
                {formData.status !== 'planned' && (
                    <Select
                        label="Link to Appointment (Optional)"
                        options={[
                            { value: '', label: 'Select an appointment...' },
                            ...patientAppointments.map(apt => ({
                                value: apt.id,
                                label: `${apt.date} at ${apt.time} - ${apt.treatmentType?.name || 'Appointment'}`
                            }))
                        ]}
                        value={formData.appointmentId}
                        onChange={(value) => setFormData({ ...formData, appointmentId: value })}
                        placeholder="Select an appointment..."
                    />
                )}

                {/* Price Info */}
                <div className={styles.priceInfo}>
                    {formData.selectedTeeth.length > 0 && (
                        <>
                            <div className={styles.priceRow}>
                                <span>Selected Teeth:</span>
                                <strong>{formatToothNumbers(formData.selectedTeeth)} ({formData.selectedTeeth.length} {formData.selectedTeeth.length === 1 ? 'tooth' : 'teeth'})</strong>
                            </div>
                            <div className={styles.priceRow}>
                                <span>Total Treatment Price:</span>
                                <strong>${totalBasePrice.toFixed(2)}</strong>
                            </div>
                        </>
                    )}
                    {parseFloat(formData.discountPercent) > 0 && (
                        <div className={styles.priceRow}>
                            <span>Discount ({formData.discountPercent}%):</span>
                            <strong style={{ color: '#10b981' }}>-${discountAmount.toFixed(2)}</strong>
                        </div>
                    )}
                    <div className={`${styles.priceRow} ${styles.totalRow}`}>
                        <span>Total to be Paid:</span>
                        <strong>${totalToPay.toFixed(2)}</strong>
                    </div>
                </div>

                <Input
                    type="number"
                    label="Discount (%)"
                    value={formData.discountPercent}
                    onChange={(value) => setFormData({ ...formData, discountPercent: value })}
                    placeholder="0-100"
                />
            </div>
        </Modal>
    );
};

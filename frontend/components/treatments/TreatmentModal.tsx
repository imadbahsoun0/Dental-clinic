'use client';

import React, { useState, useEffect } from 'react';
import { Treatment, Appointment } from '@/types';
import { useSettingsStore } from '@/store/settingsStore';
import { useAppointmentStore } from '@/store/appointmentStore';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { MultiSelect } from '@/components/common/MultiSelect';
import { Button } from '@/components/common/Button';
import { ALL_TEETH, formatToothNumbers } from '@/constants/teeth';
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
    const appointmentTypes = useSettingsStore((state) => state.appointmentTypes);
    const treatmentCategories = useSettingsStore((state) => state.treatmentCategories);
    const appointments = useAppointmentStore((state) => state.appointments);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');

    const [formData, setFormData] = useState({
        appointmentTypeId: '',
        selectedTeeth: [] as number[],
        discountPercent: '0',
        appointmentId: '',
        status: 'planned' as 'planned' | 'in-progress' | 'completed' | 'cancelled',
    });

    const [totalToPay, setTotalToPay] = useState(0);

    // Get patient's appointments for linking
    const patientAppointments = appointments.filter(apt => apt.patientId === patientId);

    // Helper function to find matching price variant for a tooth number
    const findPriceForTooth = (appointmentTypeId: string, toothNum: number): number => {
        const appointmentType = appointmentTypes.find(t => t.id === appointmentTypeId);
        if (!appointmentType) return 0;

        // Find variant that includes this tooth number
        const matchingVariant = appointmentType.priceVariants.find(variant =>
            variant.toothNumbers?.includes(toothNum)
        );

        if (matchingVariant) return matchingVariant.price;

        // If no specific match, look for default variant
        const defaultVariant = appointmentType.priceVariants.find(v => v.isDefault);
        if (defaultVariant) return defaultVariant.price;

        // Final fallback to first variant
        return appointmentType.priceVariants[0]?.price || 0;
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
                appointmentTypeId: treatment.appointmentTypeId,
                selectedTeeth: teeth,
                discountPercent: discountPercent,
                appointmentId: treatment.appointmentId || '',
                status: treatment.status || 'planned',
            });

            const selectedType = appointmentTypes.find(t => t.id === treatment.appointmentTypeId);
            if (selectedType?.categoryId) {
                setSelectedCategoryId(selectedType.categoryId);
            }
            setTotalToPay(treatment.totalPrice);
        } else if (isOpen) {
            // Adding new treatment
            setFormData({
                appointmentTypeId: '',
                selectedTeeth: [],
                discountPercent: '0',
                appointmentId: '',
                status: 'planned',
            });
            setSelectedCategoryId('');
            setTotalToPay(0);
        }
    }, [isOpen, treatment, appointmentTypes]);

    // Auto-calculate total when appointment type, teeth, or discount changes
    useEffect(() => {
        if (formData.appointmentTypeId && formData.selectedTeeth.length > 0) {
            // Calculate total price for all selected teeth
            let totalPrice = 0;

            for (const toothNum of formData.selectedTeeth) {
                const price = findPriceForTooth(formData.appointmentTypeId, toothNum);
                totalPrice += price;
            }

            // Calculate discount amount from percentage
            const discountAmount = (totalPrice * (parseFloat(formData.discountPercent) || 0)) / 100;
            // Set total to be paid as price minus discount
            setTotalToPay(totalPrice - discountAmount);
        }
    }, [formData.appointmentTypeId, formData.selectedTeeth, formData.discountPercent, appointmentTypes]);

    const handleSubmit = () => {
        if (formData.selectedTeeth.length === 0) {
            alert('Please select at least one tooth');
            return;
        }

        // If status is not planned, appointment is required
        if (formData.status !== 'planned' && !formData.appointmentId) {
            alert('Please select an appointment for non-planned treatments');
            return;
        }

        // Calculate total price for all teeth
        let totalPrice = 0;
        for (const toothNum of formData.selectedTeeth) {
            const price = findPriceForTooth(formData.appointmentTypeId, toothNum);
            totalPrice += price;
        }

        // Calculate actual discount amount from percentage
        const discountAmount = (totalPrice * (parseFloat(formData.discountPercent) || 0)) / 100;

        // Get date and doctor from appointment if linked
        let date = new Date().toISOString();
        let drName = undefined;

        if (formData.appointmentId) {
            const linkedAppointment = appointments.find(apt => apt.id === formData.appointmentId);
            if (linkedAppointment) {
                date = linkedAppointment.date;
                drName = linkedAppointment.drName;
            }
        }

        const treatmentData: Partial<Treatment> = {
            appointmentTypeId: formData.appointmentTypeId,
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

    const isValid = formData.appointmentTypeId && formData.selectedTeeth.length > 0;

    // Calculate total base price
    let totalBasePrice = 0;
    for (const toothNum of formData.selectedTeeth) {
        totalBasePrice += findPriceForTooth(formData.appointmentTypeId, toothNum);
    }

    const discountAmount = (totalBasePrice * (parseFloat(formData.discountPercent) || 0)) / 100;

    // Get price range for display in dropdown
    const getPriceRangeDisplay = (appointmentType: any) => {
        if (!appointmentType.priceVariants || appointmentType.priceVariants.length === 0) return '';
        if (appointmentType.priceVariants.length === 1) {
            return `$${appointmentType.priceVariants[0].price}`;
        }
        const prices = appointmentType.priceVariants.map((v: any) => v.price);
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
                            setFormData({ ...formData, appointmentTypeId: '' });
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
                            value={formData.appointmentTypeId}
                            onChange={(e) => setFormData({ ...formData, appointmentTypeId: e.target.value })}
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
                            {appointmentTypes
                                .filter((t) => t.categoryId === selectedCategoryId)
                                .map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name} - {getPriceRangeDisplay(t)}
                                    </option>
                                ))}
                        </select>
                    </div>
                )}

                {/* Multi-Select Teeth */}
                <MultiSelect
                    label="Select Teeth *"
                    options={ALL_TEETH.map(tooth => ({
                        value: tooth.value,
                        label: tooth.label,
                    }))}
                    value={formData.selectedTeeth}
                    onChange={(value) => setFormData({ ...formData, selectedTeeth: value as number[] })}
                    placeholder="Select one or more teeth..."
                />

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

                {/* Appointment Selection - only show if status is not planned */}
                {formData.status !== 'planned' && (
                    <Select
                        label="Link to Appointment *"
                        options={patientAppointments.map(apt => ({
                            value: apt.id,
                            label: `${apt.date} at ${apt.time} - ${apt.appointmentType?.name || 'Appointment'}`
                        }))}
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

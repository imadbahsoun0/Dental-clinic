'use client';

import React, { useState, useEffect } from 'react';
import { Treatment } from '@/types';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useSettingsStore } from '@/store/settingsStore';
import { formatToothNumbers } from '@/constants/teeth';
import styles from './BulkDiscountModal.module.css';

interface BulkDiscountModalProps {
    isOpen: boolean;
    treatments: Treatment[];
    onApply: (discountPercent: number) => void;
    onClose: () => void;
}

export const BulkDiscountModal: React.FC<BulkDiscountModalProps> = ({
    isOpen,
    treatments,
    onApply,
    onClose,
}) => {
    const treatmentTypes = useSettingsStore((state) => state.treatmentTypes);
    const [discountPercent, setDiscountPercent] = useState('0');

    // Reset discount when modal opens
    useEffect(() => {
        if (isOpen) {
            setDiscountPercent('0');
        }
    }, [isOpen]);

    // Calculate totals
    const totalOriginalPrice = treatments.reduce((sum, t) => sum + t.totalPrice, 0);
    const totalDiscountAmount = (totalOriginalPrice * (parseFloat(discountPercent) || 0)) / 100;
    const totalAfterDiscount = totalOriginalPrice - totalDiscountAmount;

    const handleApply = () => {
        onApply(parseFloat(discountPercent) || 0);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Apply Discount to ${treatments.length} Treatment${treatments.length > 1 ? 's' : ''}`}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleApply}>
                        Apply Discount
                    </Button>
                </>
            }
        >
            <div className={styles.container}>
                {/* Selected Treatments List */}
                <div className={styles.treatmentsList}>
                    <h4 className={styles.sectionTitle}>Selected Treatments:</h4>
                    {treatments.map((treatment) => {
                        const type = treatmentTypes.find(t => t.id === treatment.treatmentTypeId);
                        const teethDisplay = treatment.toothNumbers && treatment.toothNumbers.length > 0
                            ? formatToothNumbers(treatment.toothNumbers)
                            : `#${treatment.toothNumber}`;

                        return (
                            <div key={treatment.id} className={styles.treatmentItem}>
                                <div className={styles.treatmentInfo}>
                                    <span className={styles.treatmentName}>
                                        {type?.name || 'Unknown'} - Tooth {teethDisplay}
                                    </span>
                                    <span className={styles.treatmentPrice}>
                                        ${treatment.totalPrice.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Discount Input */}
                <div className={styles.discountSection}>
                    <Input
                        type="number"
                        label="Discount Percentage"
                        value={discountPercent}
                        onChange={(value) => setDiscountPercent(value)}
                        placeholder="0-100"
                    />
                </div>

                {/* Price Summary */}
                <div className={styles.priceInfo}>
                    <div className={styles.priceRow}>
                        <span>Total Original Price:</span>
                        <strong>${totalOriginalPrice.toFixed(2)}</strong>
                    </div>
                    {parseFloat(discountPercent) > 0 && (
                        <div className={styles.priceRow}>
                            <span>Discount ({discountPercent}%):</span>
                            <strong style={{ color: '#10b981' }}>-${totalDiscountAmount.toFixed(2)}</strong>
                        </div>
                    )}
                    <div className={`${styles.priceRow} ${styles.totalRow}`}>
                        <span>Total After Discount:</span>
                        <strong>${totalAfterDiscount.toFixed(2)}</strong>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

'use client';

import React, { useState, useEffect, useRef } from 'react';
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
    onApply: (discountAmount: number) => void;
    onClose: () => void;
}

export const BulkDiscountModal: React.FC<BulkDiscountModalProps> = ({
    isOpen,
    treatments,
    onApply,
    onClose,
}) => {
    const treatmentTypes = useSettingsStore((state) => state.treatmentTypes);
    const [discountAmount, setDiscountAmount] = useState('0');
    const [totalToPayInput, setTotalToPayInput] = useState('');
    const updateSourceRef = useRef<'discount' | 'total' | null>(null);

    // Reset discount when modal opens
    useEffect(() => {
        if (isOpen) {
            setDiscountAmount('0');
            setTotalToPayInput('');
        }
    }, [isOpen]);

    // Calculate totals
    const totalOriginalPrice = treatments.reduce((sum, t) => sum + t.totalPrice, 0);
    const totalDiscountAmount = parseFloat(discountAmount) || 0;
    const totalAfterDiscount = totalOriginalPrice - totalDiscountAmount;

    // Update total to pay input when discount amount changes (only if not editing total)
    useEffect(() => {
        if (totalOriginalPrice > 0 && updateSourceRef.current !== 'total') {
            setTotalToPayInput(totalAfterDiscount.toFixed(2));
        }
        // Reset source after update
        updateSourceRef.current = null;
    }, [discountAmount, totalOriginalPrice, totalAfterDiscount]);

    const handleApply = () => {
        onApply(parseFloat(discountAmount) || 0);
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Input
                            type="number"
                            label="Discount ($)"
                            value={discountAmount}
                            step="0.01"
                            onChange={(value) => {
                                updateSourceRef.current = 'discount';
                                setDiscountAmount(value);
                            }}
                            placeholder="0.00"
                        />
                        <Input
                            type="number"
                            label="Total to be Paid ($)"
                            value={totalToPayInput}
                            step="1"
                            onChange={(value) => {
                                updateSourceRef.current = 'total';
                                setTotalToPayInput(value);
                                const inputTotal = parseFloat(value) || 0;
                                
                                // Calculate discount amount directly
                                if (totalOriginalPrice > 0 && inputTotal <= totalOriginalPrice) {
                                    const discount = totalOriginalPrice - inputTotal;
                                    setDiscountAmount(discount.toFixed(2));
                                } else if (inputTotal > totalOriginalPrice) {
                                    setDiscountAmount('0');
                                }
                            }}
                            placeholder="Enter total amount"
                        />
                    </div>
                </div>

                {/* Price Summary */}
                <div className={styles.priceInfo}>
                    <div className={styles.priceRow}>
                        <span>Total Original Price:</span>
                        <strong>${totalOriginalPrice.toFixed(2)}</strong>
                    </div>
                    {parseFloat(discountAmount) > 0 && (
                        <div className={styles.priceRow}>
                            <span>Discount:</span>
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

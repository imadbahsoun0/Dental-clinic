'use client';

import React from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import styles from './TreatmentCompletionModal.module.css';

interface TreatmentCompletionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    treatmentName: string;
    totalPrice: number;
    discount: number;
    doctorName?: string;
    doctorCommissionPercent?: number;
    isLoading?: boolean;
}

export const TreatmentCompletionModal: React.FC<TreatmentCompletionModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    treatmentName,
    totalPrice,
    discount,
    doctorName,
    doctorCommissionPercent,
    isLoading = false,
}) => {
    const netPrice = totalPrice - discount;
    const commissionAmount = doctorCommissionPercent 
        ? (netPrice * doctorCommissionPercent) / 100 
        : 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Complete Treatment"
        >
            <div className={styles.content}>
                <div className={styles.warningSection}>
                    <div className={styles.warningIcon}>⚠️</div>
                    <p className={styles.warningText}>
                        Once completed, this treatment cannot be edited or modified.
                    </p>
                </div>

                <div className={styles.detailsSection}>
                    <h4 className={styles.sectionTitle}>Treatment Details</h4>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Treatment:</span>
                        <span className={styles.value}>{treatmentName}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Total Price:</span>
                        <span className={styles.value}>${totalPrice.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Discount:</span>
                            <span className={styles.value}>-${discount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Net Price:</span>
                        <span className={`${styles.value} ${styles.highlight}`}>
                            ${netPrice.toFixed(2)}
                        </span>
                    </div>
                </div>

                {doctorName && doctorCommissionPercent && doctorCommissionPercent > 0 && (
                    <div className={styles.commissionSection}>
                        <h4 className={styles.sectionTitle}>Doctor Commission</h4>
                        <div className={styles.commissionCard}>
                            <div className={styles.detailRow}>
                                <span className={styles.label}>Doctor:</span>
                                <span className={styles.value}>{doctorName}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.label}>Commission Rate:</span>
                                <span className={styles.value}>{doctorCommissionPercent}%</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.label}>Amount to Transfer:</span>
                                <span className={`${styles.value} ${styles.commissionAmount}`}>
                                    ${commissionAmount.toFixed(2)}
                                </span>
                            </div>
                        </div>
                        <p className={styles.commissionNote}>
                            💰 This amount will be automatically added to the doctor's wallet.
                        </p>
                    </div>
                )}

                <div className={styles.footer}>
                    <Button 
                        variant="secondary" 
                        onClick={onClose} 
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={onConfirm} 
                        disabled={isLoading}
                    >
                        {isLoading ? 'Completing...' : 'Complete Treatment'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

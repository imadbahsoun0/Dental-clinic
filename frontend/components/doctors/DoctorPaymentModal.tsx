'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { User } from '@/types';
import styles from './DoctorPaymentModal.module.css';

interface DoctorPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (paymentData: { amount: number; date: string; notes?: string }) => void;
    doctor: User;
}

export const DoctorPaymentModal: React.FC<DoctorPaymentModalProps> = ({
    isOpen,
    onClose,
    onSave,
    doctor,
}) => {
    const [formData, setFormData] = useState({
        amount: '',
        date: '',
        notes: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            setFormData({
                amount: (doctor.wallet || 0).toFixed(2),
                date: new Date().toISOString().split('T')[0],
                notes: '',
            });
            setErrors({});
        }
    }, [isOpen, doctor]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        const amount = parseFloat(formData.amount);
        const maxAmount = doctor.wallet || 0;

        if (!formData.amount || amount <= 0) {
            newErrors.amount = 'Amount must be greater than 0';
        } else if (amount > maxAmount) {
            newErrors.amount = `Amount cannot exceed wallet balance ($${maxAmount.toFixed(2)})`;
        }

        if (!formData.date) {
            newErrors.date = 'Date is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        onSave({
            amount: parseFloat(formData.amount),
            date: formData.date,
            notes: formData.notes || undefined,
        });
    };

    const footer = (
        <div className={styles.modalFooter}>
            <Button variant="secondary" onClick={onClose}>
                Cancel
            </Button>
            <Button variant="primary" onClick={() => handleSubmit({} as React.FormEvent)}>
                Process Payment
            </Button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Pay ${doctor.name}`}
            footer={footer}
        >
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.doctorInfo}>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Doctor:</span>
                        <span className={styles.infoValue}>{doctor.name}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Current Wallet:</span>
                        <span className={styles.walletValue}>
                            ${(doctor.wallet || 0).toFixed(2)}
                        </span>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        Payment Amount <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        className={`${styles.input} ${errors.amount ? styles.error : ''}`}
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="0.00"
                    />
                    {errors.amount && <span className={styles.errorText}>{errors.amount}</span>}
                    <span className={styles.helpText}>
                        Maximum: ${(doctor.wallet || 0).toFixed(2)}
                    </span>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        Payment Date <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="date"
                        className={`${styles.input} ${errors.date ? styles.error : ''}`}
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                    {errors.date && <span className={styles.errorText}>{errors.date}</span>}
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Notes (Optional)</label>
                    <textarea
                        className={styles.textarea}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Add any additional notes..."
                        rows={3}
                    />
                </div>
            </form>
        </Modal>
    );
};

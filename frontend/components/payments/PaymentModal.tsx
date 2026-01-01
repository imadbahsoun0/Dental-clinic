'use client';

import React, { useState, useEffect } from 'react';
import { Payment } from '@/types';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { formatLocalDate, normalizeDate } from '@/utils/dateUtils';
import { Button } from '@/components/common/Button';

interface PaymentModalProps {
    isOpen: boolean;
    payment?: Payment | null;
    onSave: (paymentData: Partial<Payment>) => void;
    onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    payment,
    onSave,
    onClose,
}) => {
    const [formData, setFormData] = useState({
        amount: '',
        date: '',
        paymentMethod: 'cash' as Payment['paymentMethod'],
        notes: '',
    });

    // Reset form when modal opens/closes or payment changes
    useEffect(() => {
        if (isOpen && payment) {
            setFormData({
                amount: payment.amount.toString(),
                date: normalizeDate(payment.date),
                paymentMethod: payment.paymentMethod,
                notes: payment.notes || '',
            });
        } else if (isOpen) {
            setFormData({
                amount: '',
                date: formatLocalDate(new Date()),
                paymentMethod: 'cash',
                notes: '',
            });
        }
    }, [isOpen, payment]);

    const handleSubmit = () => {
        const paymentData: Partial<Payment> = {
            amount: parseFloat(formData.amount) || 0,
            date: formData.date, // Already in YYYY-MM-DD format
            paymentMethod: formData.paymentMethod,
            notes: formData.notes || undefined,
        };

        onSave(paymentData);
        onClose();
    };

    const isValid = formData.amount && formData.date && parseFloat(formData.amount) > 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={payment ? 'Edit Payment' : 'Add Payment'}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!isValid}>
                        {payment ? 'Update' : 'Add'} Payment
                    </Button>
                </>
            }
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Input
                    type="number"
                    label="Amount *"
                    value={formData.amount}
                    onChange={(value) => setFormData({ ...formData, amount: value })}
                    placeholder="0.00"
                />

                <Input
                    type="date"
                    label="Payment Date *"
                    value={formData.date}
                    onChange={(value) => setFormData({ ...formData, date: value })}
                />

                <Select
                    label="Payment Method"
                    options={[
                        { value: 'cash', label: 'Cash' },
                        { value: 'card', label: 'Card' },
                        { value: 'transfer', label: 'Bank Transfer' },
                        { value: 'check', label: 'Check' },
                        { value: 'other', label: 'Other' },
                    ]}
                    value={formData.paymentMethod}
                    onChange={(value) => setFormData({ ...formData, paymentMethod: value as Payment['paymentMethod'] })}
                />

                <Input
                    type="text"
                    label="Notes"
                    value={formData.notes}
                    onChange={(value) => setFormData({ ...formData, notes: value })}
                    placeholder="Optional notes..."
                />
            </div>
        </Modal>
    );
};

'use client';

import React from 'react';
import { Payment } from '@/types';
import { PaymentReceiptStatus } from './PaymentReceiptStatus';
import styles from './PaymentsTable.module.css';

interface PaymentsTableProps {
    payments: Payment[];
    onEdit: (payment: Payment) => void;
    onDelete: (paymentId: string) => void;
}

export const PaymentsTable: React.FC<PaymentsTableProps> = ({
    payments,
    onEdit,
    onDelete,
}) => {
    const getPaymentMethodLabel = (method: Payment['paymentMethod']) => {
        const labels = {
            cash: 'Cash',
            card: 'Card',
            transfer: 'Bank Transfer',
            check: 'Check',
            other: 'Other',
        };
        return labels[method];
    };

    if (payments.length === 0) {
        return (
            <div className={styles.emptyState}>
                <p>No payments recorded yet. Click "Add Payment" to get started.</p>
            </div>
        );
    }

    return (
        <div className={styles.tableContainer}>
            <table className={styles.paymentsTable}>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Payment Method</th>
                        <th>Notes</th>
                        <th>Receipt Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map((payment) => (
                        <tr key={payment.id}>
                            <td>{new Date(payment.date).toLocaleDateString()}</td>
                            <td className={styles.currency}>${payment.amount.toFixed(2)}</td>
                            <td>
                                <span className={styles.methodBadge}>
                                    {getPaymentMethodLabel(payment.paymentMethod)}
                                </span>
                            </td>
                            <td>{payment.notes || '-'}</td>
                            <td>
                                <PaymentReceiptStatus paymentId={payment.id} />
                            </td>
                            <td>
                                <div className={styles.actions}>
                                    <button
                                        className={styles.editBtn}
                                        onClick={() => onEdit(payment)}
                                        title="Edit payment"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={() => onDelete(payment.id)}
                                        title="Delete payment"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

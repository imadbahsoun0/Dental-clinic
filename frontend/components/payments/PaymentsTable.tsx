'use client';

import React, { useEffect, useState } from 'react';
import { Payment, Message } from '@/types';
import { PaymentReceiptStatus } from './PaymentReceiptStatus';
import { api } from '@/lib/api';
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
    const [messages, setMessages] = useState<Message[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);

    // Fetch all payment receipt messages once
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                setLoadingMessages(true);
                const response = await api.api.messagesControllerFindAll({
                    type: 'payment_receipt',
                });
                
                if (response.data) {
                    const messagesData = (response.data as { data?: Message[] }).data || [];
                    setMessages(messagesData);
                }
            } catch (error) {
                console.error('Failed to fetch payment receipt messages:', error);
            } finally {
                setLoadingMessages(false);
            }
        };

        if (payments.length > 0) {
            fetchMessages();
        }
    }, [payments.length > 0]);

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

    // Helper to get message for a payment
    const getMessageForPayment = (paymentId: string) => {
        return messages.find(msg => msg.metadata?.paymentId === paymentId);
    };

    const refreshMessages = async () => {
        try {
            const response = await api.api.messagesControllerFindAll({
                type: 'payment_receipt',
            });
            
            if (response.data) {
                const messagesData = (response.data as { data?: Message[] }).data || [];
                setMessages(messagesData);
            }
        } catch (error) {
            console.error('Failed to refresh payment receipt messages:', error);
        }
    };

    if (payments.length === 0) {
        return (
            <div className={styles.emptyState}>
                <p>No payments recorded yet. Click "Add Payment" to get started.</p>
            </div>
        );
    }

    return (
        <>
            {/* Desktop Table View */}
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
                                    <PaymentReceiptStatus 
                                        paymentId={payment.id}
                                        message={getMessageForPayment(payment.id)}
                                        onRefresh={refreshMessages}
                                        loading={loadingMessages}
                                    />
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

            {/* Mobile Card View */}
            <div className={styles.mobileCardView}>
                {payments.map((payment) => (
                    <div key={payment.id} className={styles.paymentCard}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardDate}>
                                {new Date(payment.date).toLocaleDateString()}
                            </div>
                            <div className={styles.cardAmount}>
                                ${payment.amount.toFixed(2)}
                            </div>
                        </div>
                        
                        <div className={styles.cardBody}>
                            <div className={styles.cardRow}>
                                <span className={styles.cardLabel}>Payment Method</span>
                                <span className={styles.methodBadge}>
                                    {getPaymentMethodLabel(payment.paymentMethod)}
                                </span>
                            </div>
                            <div className={styles.cardRow}>
                                <span className={styles.cardLabel}>Notes</span>
                                <span className={styles.cardValue}>{payment.notes || '-'}</span>
                            </div>
                            <div className={styles.cardRow}>
                                <span className={styles.cardLabel}>Receipt Status</span>
                                <span className={styles.cardValue}>
                                    <PaymentReceiptStatus 
                                        paymentId={payment.id}
                                        message={getMessageForPayment(payment.id)}
                                        onRefresh={refreshMessages}
                                        loading={loadingMessages}
                                    />
                                </span>
                            </div>
                        </div>
                        
                        <div className={styles.cardFooter}>
                            <button
                                className={styles.cardActionBtn}
                                onClick={() => onEdit(payment)}
                                title="Edit payment"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                            </button>
                            <button
                                className={styles.cardActionBtn}
                                onClick={() => onDelete(payment.id)}
                                title="Delete payment"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

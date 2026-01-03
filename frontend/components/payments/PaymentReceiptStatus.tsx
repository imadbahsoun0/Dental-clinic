'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Badge } from '@/components/common/Badge';
import { Message } from '@/types';
import toast from 'react-hot-toast';
import styles from './PaymentReceiptStatus.module.css';

interface PaymentReceiptStatusProps {
    paymentId: string;
}

export const PaymentReceiptStatus: React.FC<PaymentReceiptStatusProps> = ({ paymentId }) => {
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [messageStatus, setMessageStatus] = useState<'sent' | 'failed' | 'not-sent'>('not-sent');
    const [messageId, setMessageId] = useState<string | null>(null);

    useEffect(() => {
        fetchMessageStatus();
    }, [paymentId]);

    const fetchMessageStatus = async () => {
        try {
            setLoading(true);
            const response = await api.api.messagesControllerFindAll({
                type: 'payment_receipt',
            });
            
            // Filter by paymentId in metadata
            if (response.data && response.data.length > 0) {
                const messages = response.data as unknown as Message[];
                const paymentMessage = messages.find(
                    (msg) => msg.metadata?.paymentId === paymentId
                );
                
                if (paymentMessage) {
                    setMessageId(paymentMessage.id);
                    setMessageStatus(paymentMessage.status === 'sent' ? 'sent' : 'failed');
                } else {
                    setMessageStatus('not-sent');
                }
            } else {
                setMessageStatus('not-sent');
            }
        } catch (error) {
            console.error('Failed to fetch message status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendReceipt = async (e: React.MouseEvent) => {
        e.stopPropagation();
        
        try {
            setSending(true);
            await api.api.paymentsControllerSendPaymentReceipt(paymentId);
            toast.success('Payment receipt sent successfully');
            fetchMessageStatus(); // Refresh status
        } catch (error) {
            toast.error('Failed to send payment receipt');
            console.error(error);
        } finally {
            setSending(false);
        }
    };

    const handleResend = async (e: React.MouseEvent) => {
        e.stopPropagation();
        
        if (!messageId) return;
        
        try {
            setSending(true);
            await api.api.messagesControllerResendMessage(messageId);
            toast.success('Payment receipt resent successfully');
            fetchMessageStatus(); // Refresh status
        } catch (error) {
            toast.error('Failed to resend payment receipt');
            console.error(error);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return <span className={styles.loading}>...</span>;
    }

    return (
        <div className={styles.statusContainer}>
            {messageStatus === 'sent' && (
                <Badge variant="success">
                    ✓ Sent
                </Badge>
            )}
            
            {messageStatus === 'failed' && (
                <>
                    <Badge variant="danger">
                        ✗ Failed
                    </Badge>
                    <button
                        className={styles.resendBtn}
                        onClick={handleResend}
                        disabled={sending}
                        title="Resend receipt"
                    >
                        {sending ? '...' : '↻'}
                    </button>
                </>
            )}
            
            {messageStatus === 'not-sent' && (
                <button
                    className={styles.sendBtn}
                    onClick={handleSendReceipt}
                    disabled={sending}
                    title="Send receipt"
                >
                    {sending ? '...' : 'Send'}
                </button>
            )}
        </div>
    );
};

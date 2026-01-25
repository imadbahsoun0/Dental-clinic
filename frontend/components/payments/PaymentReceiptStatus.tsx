'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Badge } from '@/components/common/Badge';
import { Message } from '@/types';
import { useSettingsStore } from '@/store/settingsStore';
import toast from 'react-hot-toast';
import styles from './PaymentReceiptStatus.module.css';

interface PaymentReceiptStatusProps {
    paymentId: string;
    message?: Message;
    onRefresh?: () => void | Promise<void>;
    loading?: boolean;
}

export const PaymentReceiptStatus: React.FC<PaymentReceiptStatusProps> = ({ 
    paymentId, 
    message,
    onRefresh,
    loading = false
}) => {
    const [sending, setSending] = useState(false);
    const notificationSettings = useSettingsStore((state) => state.notificationSettings);

    const isNotificationEnabled = notificationSettings.notificationToggles?.payment_receipt ?? true;
    
    const messageStatus = message 
        ? (message.status === 'sent' ? 'sent' : 'failed')
        : 'not-sent';
    const messageId = message?.id || null;

    const handleSendReceipt = async (e: React.MouseEvent) => {
        e.stopPropagation();
        
        try {
            setSending(true);
            await api.api.paymentsControllerSendPaymentReceipt(paymentId);
            toast.success('Payment receipt sent successfully');
            if (onRefresh) await onRefresh(); // Refresh messages from parent
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
            if (onRefresh) await onRefresh(); // Refresh messages from parent
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
                        disabled={sending || !isNotificationEnabled}
                        title={!isNotificationEnabled ? 'Payment receipt notifications are disabled' : 'Resend receipt'}
                    >
                        {sending ? '...' : '↻'}
                    </button>
                </>
            )}
            
            {messageStatus === 'not-sent' && (
                <button
                    className={styles.sendBtn}
                    onClick={handleSendReceipt}
                    disabled={sending || !isNotificationEnabled}
                    title={!isNotificationEnabled ? 'Payment receipt notifications are disabled' : 'Send receipt'}
                >
                    {sending ? '...' : 'Send'}
                </button>
            )}
        </div>
    );
};

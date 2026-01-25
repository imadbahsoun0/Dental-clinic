'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Badge } from '@/components/common/Badge';
import { Message } from '@/types';
import { useSettingsStore } from '@/store/settingsStore';
import toast from 'react-hot-toast';
import styles from './MedicalHistoryStatus.module.css';

interface MedicalHistoryStatusProps {
    patientId: string;
    message?: Message;
    onRefresh?: () => void | Promise<void>;
    loading?: boolean;
}

export const MedicalHistoryStatus: React.FC<MedicalHistoryStatusProps> = ({ 
    patientId,
    message,
    onRefresh,
    loading = false
}) => {
    const [sending, setSending] = useState(false);
    const notificationSettings = useSettingsStore((state) => state.notificationSettings);

    const isNotificationEnabled = notificationSettings.notificationToggles?.medical_history ?? true;
    
    const messageStatus = message 
        ? (message.status === 'sent' ? 'sent' : 'failed')
        : 'not-sent';
    const messageId = message?.id || null;

    const handleSendMedicalHistory = async (e: React.MouseEvent) => {
        e.stopPropagation();
        
        try {
            setSending(true);
            await api.api.patientsControllerSendMedicalHistoryReminder(patientId);
            toast.success('Medical history link sent successfully');
            if (onRefresh) await onRefresh(); // Refresh messages from parent
        } catch (error) {
            toast.error('Failed to send medical history link');
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
            toast.success('Medical history link resent successfully');
            if (onRefresh) await onRefresh(); // Refresh messages from parent
        } catch (error) {
            toast.error('Failed to resend medical history link');
            console.error(error);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return <span className={styles.loading}>Loading...</span>;
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
                        title={!isNotificationEnabled ? 'Medical history notifications are disabled' : 'Resend medical history link'}
                    >
                        {sending ? '...' : '↻'}
                    </button>
                </>
            )}
            
            {messageStatus === 'not-sent' && (
                <button
                    className={styles.sendBtn}
                    onClick={handleSendMedicalHistory}
                    disabled={sending || !isNotificationEnabled}
                    title={!isNotificationEnabled ? 'Medical history notifications are disabled' : 'Send medical history link'}
                >
                    {sending ? 'Sending...' : 'Send'}
                </button>
            )}
        </div>
    );
};

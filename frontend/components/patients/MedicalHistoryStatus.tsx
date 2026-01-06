'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Badge } from '@/components/common/Badge';
import { Message } from '@/types';
import { useSettingsStore } from '@/store/settingsStore';
import toast from 'react-hot-toast';
import styles from './MedicalHistoryStatus.module.css';

interface MedicalHistoryStatusProps {
    patientId: string;
}

export const MedicalHistoryStatus: React.FC<MedicalHistoryStatusProps> = ({ patientId }) => {
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [messageStatus, setMessageStatus] = useState<'sent' | 'failed' | 'not-sent'>('not-sent');
    const [messageId, setMessageId] = useState<string | null>(null);
    const notificationSettings = useSettingsStore((state) => state.notificationSettings);
    const fetchNotificationSettings = useSettingsStore((state) => state.fetchNotificationSettings);

    useEffect(() => {
        fetchMessageStatus();
        fetchNotificationSettings();
    }, [patientId]);

    const isNotificationEnabled = notificationSettings.notificationToggles?.medical_history ?? true;

    const fetchMessageStatus = async () => {
        try {
            setLoading(true);
            const response = await api.api.messagesControllerFindAll({
                patientId,
                type: 'medical_history',
            });
            
            if (response.data && response.data.length > 0) {
                const messages = response.data as unknown as Message[];
                const latestMessage = messages[0]; // Assuming sorted by newest first
                setMessageId(latestMessage.id);
                setMessageStatus(latestMessage.status === 'sent' ? 'sent' : 'failed');
            } else {
                setMessageStatus('not-sent');
            }
        } catch (error) {
            console.error('Failed to fetch message status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMedicalHistory = async (e: React.MouseEvent) => {
        e.stopPropagation();
        
        try {
            setSending(true);
            await api.api.patientsControllerSendMedicalHistoryReminder(patientId);
            toast.success('Medical history link sent successfully');
            fetchMessageStatus(); // Refresh status
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
            fetchMessageStatus(); // Refresh status
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

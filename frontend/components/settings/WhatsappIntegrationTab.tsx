'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { api } from '@/lib/api';
import type { RequestParams, WhatsappIntegrationStatusDto } from '@/lib/api';
import styles from './settings-tabs.module.css';

type LoadState = 'idle' | 'loading';

export const WhatsappIntegrationTab: React.FC = () => {
    const [status, setStatus] = useState<WhatsappIntegrationStatusDto | null>(null);
    const [lastStatusError, setLastStatusError] = useState<string | null>(null);
    const [statusState, setStatusState] = useState<LoadState>('idle');

    const [qrUrl, setQrUrl] = useState<string | null>(null);
    const [qrState, setQrState] = useState<LoadState>('idle');
    const [isQrAutoRefreshEnabled, setIsQrAutoRefreshEnabled] = useState(false);

    const [isReconnectModalOpen, setIsReconnectModalOpen] = useState(false);
    const [isReconnectSubmitting, setIsReconnectSubmitting] = useState(false);

    const loadStatus = useCallback(async () => {
        try {
            setStatusState('loading');
            setLastStatusError(null);

            const res = await api.api.whatsappIntegrationControllerGetStatus();
            if (!res.success) {
                setStatus(null);
                setLastStatusError(res.message || 'Unable to check connection');
                return;
            }

            const nextStatus = res.data ?? null;
            setStatus(nextStatus);

            if (nextStatus?.isConnected) {
                setIsQrAutoRefreshEnabled(false);
            }
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Unable to check connection';
            setStatus(null);
            setLastStatusError(message);
        } finally {
            setStatusState('idle');
        }
    }, []);

    const fetchQr = useCallback(async (opts?: { silent?: boolean }) => {
        try {
            setQrState('loading');

            const params: RequestParams = { format: 'blob' };
            const blob = (await api.api.whatsappIntegrationControllerGetQr(params)) as unknown as Blob;
            const nextUrl = URL.createObjectURL(blob);

            setQrUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return nextUrl;
            });
            setIsQrAutoRefreshEnabled(true);
        } catch {
            if (!opts?.silent) toast.error('Failed to load QR code');
        } finally {
            setQrState('idle');
        }
    }, []);

    const openReconnectModal = useCallback(() => {
        setIsReconnectModalOpen(true);
    }, []);

    const confirmReconnect = useCallback(async () => {
        try {
            setIsReconnectSubmitting(true);
            await api.api.whatsappIntegrationControllerDeleteSession();

            setIsQrAutoRefreshEnabled(false);
            setQrUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return null;
            });

            toast.success('Reconnecting…');
            setIsReconnectModalOpen(false);
            await loadStatus();
        } catch {
            toast.error('Failed to reconnect');
        } finally {
            setIsReconnectSubmitting(false);
        }
    }, [loadStatus]);

    useEffect(() => {
        void loadStatus();
        return () => {
            setQrUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return null;
            });
        };
    }, [loadStatus]);

    useEffect(() => {
        if (status?.isConnected) return;
        const intervalId = window.setInterval(() => {
            void loadStatus();
        }, 10_000);
        return () => window.clearInterval(intervalId);
    }, [loadStatus, status?.isConnected]);

    useEffect(() => {
        if (!isQrAutoRefreshEnabled) return;
        if (!status?.needsQrScan) return;

        const intervalId = window.setInterval(() => {
            void fetchQr({ silent: true });
        }, 10_000);

        return () => window.clearInterval(intervalId);
    }, [fetchQr, isQrAutoRefreshEnabled, status?.needsQrScan]);

    const connectionSummary = useMemo(() => {
        if (statusState === 'loading') return 'Checking…';
        if (status?.isConnected) return 'Connected';
        if (status?.needsQrScan) return 'Needs QR scan';
        if (lastStatusError) return 'Can’t check';
        return 'Not connected';
    }, [lastStatusError, status?.isConnected, status?.needsQrScan, statusState]);

    return (
        <div className={styles.tabContent}>
            <Card title="WhatsApp Connection">
                <div className={styles.form}>
                    <p className={styles.description}>
                        Status is checked automatically. If a QR code is needed, scan it with WhatsApp on your phone.
                    </p>

                    <div className={styles.statusBox}>
                        <div className={styles.statusHeader}>
                            <div>
                                <div className={styles.statusTitle}>Status</div>
                                <div className={styles.statusValue}>{connectionSummary}</div>
                            </div>

                            <div className={styles.row}>
                                <Button onClick={loadStatus} disabled={statusState === 'loading'}>
                                    {statusState === 'loading' ? 'Checking…' : 'Refresh'}
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={openReconnectModal}
                                    disabled={statusState === 'loading' || isReconnectSubmitting}
                                >
                                    Reconnect
                                </Button>
                            </div>
                        </div>

                        {lastStatusError && <p className={styles.description}>{lastStatusError}</p>}
                    </div>

                    {status?.isConnected && (
                        <p className={styles.description}>WhatsApp is connected and ready.</p>
                    )}

                    {status?.needsQrScan && (
                        <div>
                            <p className={styles.description}>
                                Scan the QR code below with WhatsApp to connect.
                            </p>

                            <div className={styles.row}>
                                <Button onClick={() => void fetchQr()} disabled={qrState === 'loading'}>
                                    {qrState === 'loading' ? 'Loading…' : 'Show QR Code'}
                                </Button>
                            </div>

                            {qrUrl && (
                                <div className={styles.logoPreview}>
                                    <img src={qrUrl} alt="WhatsApp QR" className={styles.qrImage} />
                                    <p className={styles.description}>Refreshes automatically every 10 seconds.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {status && !status.isConnected && !status.needsQrScan && (
                        <p className={styles.description}>Not connected yet. Try “Reconnect” if needed.</p>
                    )}
                </div>
            </Card>

            <Modal
                isOpen={isReconnectModalOpen}
                onClose={() => setIsReconnectModalOpen(false)}
                title="Reconnect WhatsApp"
                footer={
                    <div className={styles.row}>
                        <Button
                            variant="secondary"
                            onClick={() => setIsReconnectModalOpen(false)}
                            disabled={isReconnectSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button onClick={() => void confirmReconnect()} disabled={isReconnectSubmitting}>
                            {isReconnectSubmitting ? 'Reconnecting…' : 'Reconnect'}
                        </Button>
                    </div>
                }
            >
                <p className={styles.description}>
                    This will reset the current connection. You may need to scan a new QR code afterwards.
                </p>
            </Modal>
        </div>
    );
};

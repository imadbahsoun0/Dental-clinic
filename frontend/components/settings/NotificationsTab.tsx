'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { useSettingsStore } from '@/store/settingsStore';
import toast from 'react-hot-toast';
import styles from './settings-tabs.module.css';

export const NotificationsTab: React.FC = () => {
    const notificationSettings = useSettingsStore((state) => state.notificationSettings);
    const updateNotificationSettings = useSettingsStore((state) => state.updateNotificationSettings);
    const fetchNotificationSettings = useSettingsStore((state) => state.fetchNotificationSettings);
    const clinicBranding = useSettingsStore((state) => state.clinicBranding);

    const [settings, setSettings] = useState(notificationSettings);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchNotificationSettings();
    }, []);

    useEffect(() => {
        setSettings(notificationSettings);
    }, [notificationSettings]);

    const handleSave = async () => {
        if (!settings.appointmentReminder.messageTemplate.trim() || !settings.paymentReminder.messageTemplate.trim()) {
            toast.error('Message templates cannot be empty');
            return;
        }

        setLoading(true);
        await updateNotificationSettings(settings);
        setLoading(false);
    };

    const insertVariable = (field: 'appointmentReminder' | 'paymentReminder', variable: string) => {
        const currentTemplate = settings[field].messageTemplate;
        const textarea = document.getElementById(`${field}-template`) as HTMLTextAreaElement;
        const cursorPos = textarea?.selectionStart || currentTemplate.length;
        const newTemplate =
            currentTemplate.slice(0, cursorPos) + variable + currentTemplate.slice(cursorPos);
        setSettings({
            ...settings,
            [field]: { ...settings[field], messageTemplate: newTemplate },
        });
    };

    const availableVariables = [
        { value: '{{patientName}}', label: 'Patient Name' },
        { value: '{{appointmentTime}}', label: 'Appointment Time' },
        { value: '{{appointmentDate}}', label: 'Appointment Date' },
        { value: '{{doctorName}}', label: 'Doctor Name' },
        { value: '{{clinicLocation}}', label: 'Clinic Location' },
        { value: '{{amountDue}}', label: 'Amount Due' },
    ];

    return (
        <div className={styles.tabContent}>
            <Card title="Appointment Reminder">
                <div className={styles.form}>
                    <div className={styles.toggleSection}>
                        <label className={styles.toggleLabel}>
                            <input
                                type="checkbox"
                                checked={settings.appointmentReminder.enabled}
                                onChange={(e) =>
                                    setSettings({
                                        ...settings,
                                        appointmentReminder: {
                                            ...settings.appointmentReminder,
                                            enabled: e.target.checked,
                                        },
                                    })
                                }
                                className={styles.checkbox}
                            />
                            <span>Enable appointment reminders</span>
                        </label>
                    </div>

                    {settings.appointmentReminder.enabled && (
                        <>
                            <div className={styles.row}>
                                <Input
                                    type="number"
                                    label="Send reminder before appointment"
                                    value={String(settings.appointmentReminder.timing)}
                                    onChange={(value) =>
                                        setSettings({
                                            ...settings,
                                            appointmentReminder: {
                                                ...settings.appointmentReminder,
                                                timing: parseInt(value) || 1,
                                            },
                                        })
                                    }
                                />
                                <Select
                                    label="Unit"
                                    options={[
                                        { value: 'hours', label: 'Hours' },
                                        { value: 'days', label: 'Days' },
                                    ]}
                                    value={settings.appointmentReminder.timingUnit}
                                    onChange={(value) =>
                                        setSettings({
                                            ...settings,
                                            appointmentReminder: {
                                                ...settings.appointmentReminder,
                                                timingUnit: value as 'hours' | 'days',
                                            },
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className={styles.label}>Message Template *</label>
                                <textarea
                                    id="appointmentReminder-template"
                                    className={styles.textarea}
                                    rows={4}
                                    value={settings.appointmentReminder.messageTemplate}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            appointmentReminder: {
                                                ...settings.appointmentReminder,
                                                messageTemplate: e.target.value,
                                            },
                                        })
                                    }
                                    placeholder="Enter your message template..."
                                />
                                <div className={styles.variableHelper}>
                                    <p className={styles.helperText}>Insert variables:</p>
                                    <div className={styles.variableButtons}>
                                        {availableVariables.map((variable) => (
                                            <button
                                                key={variable.value}
                                                type="button"
                                                className={styles.variableButton}
                                                onClick={() => insertVariable('appointmentReminder', variable.value)}
                                            >
                                                {variable.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </Card>

            <Card title="Payment Reminder" className={styles.marginTop}>
                <div className={styles.form}>
                    <div className={styles.toggleSection}>
                        <label className={styles.toggleLabel}>
                            <input
                                type="checkbox"
                                checked={settings.paymentReminder.enabled}
                                onChange={(e) =>
                                    setSettings({
                                        ...settings,
                                        paymentReminder: {
                                            ...settings.paymentReminder,
                                            enabled: e.target.checked,
                                        },
                                    })
                                }
                                className={styles.checkbox}
                            />
                            <span>Enable payment reminders</span>
                        </label>
                    </div>

                    {settings.paymentReminder.enabled && (
                        <>
                            <div className={styles.row}>
                                <Input
                                    type="number"
                                    label="Send reminder every"
                                    value={String(settings.paymentReminder.timing)}
                                    onChange={(value) =>
                                        setSettings({
                                            ...settings,
                                            paymentReminder: {
                                                ...settings.paymentReminder,
                                                timing: parseInt(value) || 1,
                                            },
                                        })
                                    }
                                />
                                <Select
                                    label="Unit"
                                    options={[
                                        { value: 'hours', label: 'Hours' },
                                        { value: 'days', label: 'Days' },
                                    ]}
                                    value={settings.paymentReminder.timingUnit}
                                    onChange={(value) =>
                                        setSettings({
                                            ...settings,
                                            paymentReminder: {
                                                ...settings.paymentReminder,
                                                timingUnit: value as 'hours' | 'days',
                                            },
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className={styles.label}>Message Template *</label>
                                <textarea
                                    id="paymentReminder-template"
                                    className={styles.textarea}
                                    rows={4}
                                    value={settings.paymentReminder.messageTemplate}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            paymentReminder: {
                                                ...settings.paymentReminder,
                                                messageTemplate: e.target.value,
                                            },
                                        })
                                    }
                                    placeholder="Enter your message template..."
                                />
                                <div className={styles.variableHelper}>
                                    <p className={styles.helperText}>Insert variables:</p>
                                    <div className={styles.variableButtons}>
                                        {availableVariables.map((variable) => (
                                            <button
                                                key={variable.value}
                                                type="button"
                                                className={styles.variableButton}
                                                onClick={() => insertVariable('paymentReminder', variable.value)}
                                            >
                                                {variable.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </Card>

            <div className={styles.formActions}>
                <Button onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Notification Settings'}
                </Button>
            </div>

            <Card title="Current Clinic Location" className={styles.marginTop}>
                <p className={styles.description}>
                    The clinic location used in notification templates is: <strong>{clinicBranding.location}</strong>
                </p>
                <p className={styles.description}>
                    You can update this in the <strong>Branding</strong> tab.
                </p>
            </Card>
        </div>
    );
};

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
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
    }, [fetchNotificationSettings]);

    useEffect(() => {
        if (notificationSettings) {
            setSettings(notificationSettings);
        }
    }, [notificationSettings]);

    // Show loading state if settings haven't loaded yet
    if (!settings || !settings.appointmentReminders || !settings.messageTemplates) {
        return <div className={styles.tabContent}>Loading notification settings...</div>;
    }

    const handleSave = async () => {
        // Validate templates
        const templates = settings.messageTemplates;
        if (!templates.medical_history.trim() || !templates.payment_receipt.trim() || 
            !templates.appointment_reminder.trim() || !templates.follow_up.trim() || 
            !templates.payment_overdue.trim()) {
            toast.error('All message templates are required');
            return;
        }

        // Only send the fields that are allowed in the update DTO
        const updatePayload = {
            appointmentReminders: settings.appointmentReminders,
            messageTemplates: settings.messageTemplates,
            notificationToggles: settings.notificationToggles || {
                medical_history: true,
                payment_receipt: true,
                follow_up: true,
                payment_overdue: true,
            },
        };

        setLoading(true);
        await updateNotificationSettings(updatePayload);
        setLoading(false);
    };

    const insertVariable = (templateKey: keyof typeof settings.messageTemplates, variable: string) => {
        const currentTemplate = settings.messageTemplates[templateKey];
        const textarea = document.getElementById(`${templateKey}-template`) as HTMLTextAreaElement;
        const cursorPos = textarea?.selectionStart || currentTemplate.length;
        const newTemplate =
            currentTemplate.slice(0, cursorPos) + variable + currentTemplate.slice(cursorPos);
        setSettings({
            ...settings,
            messageTemplates: {
                ...settings.messageTemplates,
                [templateKey]: newTemplate,
            },
        });
    };

    const addReminder = () => {
        setSettings({
            ...settings,
            appointmentReminders: [
                ...settings.appointmentReminders,
                { enabled: true, timingInHours: 24 },
            ],
        });
    };

    const removeReminder = (index: number) => {
        if (settings.appointmentReminders.length === 1) {
            toast.error('At least one reminder is required');
            return;
        }
        setSettings({
            ...settings,
            appointmentReminders: settings.appointmentReminders.filter((_, i) => i !== index),
        });
    };

    const updateReminder = (index: number, field: 'enabled' | 'timingInHours', value: boolean | number) => {
        const updatedReminders = settings.appointmentReminders.map((reminder, i) =>
            i === index ? { ...reminder, [field]: value } : reminder
        );
        setSettings({ ...settings, appointmentReminders: updatedReminders });
    };

    const availableVariables = {
        medical_history: [
            { value: '{{patientName}}', label: 'Patient Name' },
            { value: '{{medicalHistoryLink}}', label: 'Medical History Link' },
            { value: '{{clinicName}}', label: 'Clinic Name' },
            { value: '{{clinicLocation}}', label: 'Clinic Location' },
        ],
        payment_receipt: [
            { value: '{{patientName}}', label: 'Patient Name' },
            { value: '{{amount}}', label: 'Payment Amount' },
            { value: '{{remainingBalance}}', label: 'Remaining Balance' },
            { value: '{{clinicName}}', label: 'Clinic Name' },
            { value: '{{clinicLocation}}', label: 'Clinic Location' },
        ],
        appointment_reminder: [
            { value: '{{patientName}}', label: 'Patient Name' },
            { value: '{{appointmentDate}}', label: 'Appointment Date' },
            { value: '{{appointmentTime}}', label: 'Appointment Time' },
            { value: '{{doctorName}}', label: 'Doctor Name' },
            { value: '{{clinicName}}', label: 'Clinic Name' },
            { value: '{{clinicLocation}}', label: 'Clinic Location' },
        ],
        follow_up: [
            { value: '{{patientName}}', label: 'Patient Name' },
            { value: '{{followUpReason}}', label: 'Follow-up Reason' },
            { value: '{{clinicName}}', label: 'Clinic Name' },
            { value: '{{clinicLocation}}', label: 'Clinic Location' },
        ],
        payment_overdue: [
            { value: '{{patientName}}', label: 'Patient Name' },
            { value: '{{amountDue}}', label: 'Amount Due' },
            { value: '{{clinicName}}', label: 'Clinic Name' },
            { value: '{{clinicLocation}}', label: 'Clinic Location' },
        ],
    };

    const templateLabels = {
        medical_history: 'Medical History Link',
        payment_receipt: 'Payment Receipt',
        appointment_reminder: 'Appointment Reminder',
        follow_up: 'Follow-up Reminder',
        payment_overdue: 'Payment Overdue',
    };

    const toggleNotification = (notificationType: keyof typeof settings.messageTemplates) => {
        // Skip appointment_reminder as it's controlled separately via appointmentReminders array
        if (notificationType === 'appointment_reminder') return;
        
        const currentToggles = settings.notificationToggles || {
            medical_history: true,
            payment_receipt: true,
            follow_up: true,
            payment_overdue: true,
        };
        
        setSettings({
            ...settings,
            notificationToggles: {
                ...currentToggles,
                [notificationType]: !currentToggles[notificationType as keyof typeof currentToggles],
            },
        });
    };

    return (
        <div className={styles.tabContent}>
            <Card title="Appointment Reminders">
                <div className={styles.form}>
                    <p className={styles.description}>
                        Configure multiple reminders for appointments. Each reminder will be sent at the specified time before the appointment.
                    </p>
                    
                    {settings.appointmentReminders.map((reminder, index) => (
                        <div key={index} className={styles.reminderRow}>
                            <div className={styles.toggleSection}>
                                <label className={styles.toggleLabel}>
                                    <input
                                        type="checkbox"
                                        checked={reminder.enabled}
                                        onChange={(e) => updateReminder(index, 'enabled', e.target.checked)}
                                        className={styles.checkbox}
                                    />
                                    <span>Enabled</span>
                                </label>
                            </div>
                            
                            <div className={styles.row}>
                                <Input
                                    type="number"
                                    label="Hours before appointment"
                                    value={String(reminder.timingInHours)}
                                    onChange={(value) => updateReminder(index, 'timingInHours', parseInt(value) || 1)}
                                />
                                <button
                                    className={styles.removeBtn}
                                    onClick={() => removeReminder(index)}
                                    disabled={settings.appointmentReminders.length === 1}
                                    title="Remove reminder"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}
                    
                    <Button variant="secondary" onClick={addReminder}>
                        + Add Reminder
                    </Button>
                </div>
            </Card>

            {Object.entries(templateLabels).map(([key, label]) => {
                const notificationType = key as keyof typeof settings.messageTemplates;
                const isAppointmentReminder = notificationType === 'appointment_reminder';
                const isEnabled = isAppointmentReminder 
                    ? true // Appointment reminders controlled via array above
                    : settings.notificationToggles?.[notificationType as keyof typeof settings.notificationToggles] ?? true;
                
                return (
                    <Card key={key} title={label} className={styles.marginTop}>
                        <div className={styles.form}>
                            {!isAppointmentReminder && (
                                <div className={styles.toggleSection}>
                                    <label className={styles.toggleLabel}>
                                        <input
                                            type="checkbox"
                                            checked={isEnabled}
                                            onChange={() => toggleNotification(notificationType)}
                                            className={styles.checkbox}
                                        />
                                        <span>Enable {label} Notifications</span>
                                    </label>
                                </div>
                            )}
                            <div>
                                <label className={styles.label}>Message Template *</label>
                            <textarea
                                id={`${key}-template`}
                                className={styles.textarea}
                                rows={4}
                                value={settings.messageTemplates[key as keyof typeof settings.messageTemplates]}
                                onChange={(e) =>
                                    setSettings({
                                        ...settings,
                                        messageTemplates: {
                                            ...settings.messageTemplates,
                                            [key]: e.target.value,
                                        },
                                    })
                                }
                                placeholder="Enter your message template..."
                            />
                            <div className={styles.variableHelper}>
                                <p className={styles.helperText}>Insert variables:</p>
                                <div className={styles.variableButtons}>
                                    {availableVariables[key as keyof typeof availableVariables].map((variable) => (
                                        <button
                                            key={variable.value}
                                            type="button"
                                            className={styles.variableButton}
                                            onClick={() => insertVariable(key as keyof typeof settings.messageTemplates, variable.value)}
                                        >
                                            {variable.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
                );
            })}

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

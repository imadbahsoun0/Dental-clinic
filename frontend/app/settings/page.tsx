'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useSettingsStore } from '@/store/settingsStore';
import styles from './settings.module.css';

export default function SettingsPage() {
    const appointmentTypes = useSettingsStore((state) => state.appointmentTypes);
    const addAppointmentType = useSettingsStore((state) => state.addAppointmentType);
    const updateDoctorLogo = useSettingsStore((state) => state.updateDoctorLogo);

    const [newType, setNewType] = useState({
        name: '',
        price: 0,
        duration: 30,
        color: '#3b82f6',
    });

    const handleAddType = () => {
        if (newType.name && newType.price > 0) {
            addAppointmentType(newType);
            setNewType({ name: '', price: 0, duration: 30, color: '#3b82f6' });
        }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateDoctorLogo(reader.result as string);
                alert('Logo uploaded successfully!');
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <MainLayout title="Settings">
            {/* Appointment Types */}
            <Card title="Appointment Types" className={styles.marginBottom}>
                <div className={styles.typesList}>
                    {appointmentTypes.map((type) => (
                        <div key={type.id} className={styles.typeItem}>
                            <div
                                className={styles.typeColor}
                                style={{ backgroundColor: type.color }}
                            ></div>
                            <div className={styles.typeDetails}>
                                <div className={styles.typeName}>{type.name}</div>
                                <div className={styles.typeInfo}>
                                    ${type.price} • {type.duration} min
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.addTypeForm}>
                    <h4 className={styles.formTitle}>Add New Appointment Type</h4>
                    <div className={styles.formGrid}>
                        <Input
                            type="text"
                            label="Name"
                            placeholder="e.g., Root Canal"
                            value={newType.name}
                            onChange={(value) => setNewType({ ...newType, name: value })}
                        />
                        <Input
                            type="number"
                            label="Price ($)"
                            value={String(newType.price)}
                            onChange={(value) => setNewType({ ...newType, price: parseFloat(value) || 0 })}
                        />
                        <Input
                            type="number"
                            label="Duration (min)"
                            value={String(newType.duration)}
                            onChange={(value) => setNewType({ ...newType, duration: parseInt(value) || 30 })}
                        />
                        <div>
                            <label className={styles.colorLabel}>Color</label>
                            <input
                                type="color"
                                className={styles.colorPicker}
                                value={newType.color}
                                onChange={(e) => setNewType({ ...newType, color: e.target.value })}
                            />
                        </div>
                    </div>
                    <Button onClick={handleAddType}>Add Appointment Type</Button>
                </div>
            </Card>

            {/* Doctor Logo */}
            <Card title="Doctor Logo" className={styles.marginBottom}>
                <p className={styles.description}>
                    Upload your clinic logo to be displayed on medical history forms sent to patients.
                </p>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className={styles.fileInput}
                />
            </Card>

            {/* Medical History Questions */}
            <Card title="Medical History Questions">
                <p className={styles.description}>
                    Medical history questions are pre-configured. Patients will fill these out when they receive the medical history link.
                </p>
                <div className={styles.questionsList}>
                    <div className={styles.questionItem}>✓ Do you have dental insurance?</div>
                    <div className={styles.questionItem}>✓ Are you currently taking any medications?</div>
                    <div className={styles.questionItem}>✓ Do you have any allergies?</div>
                    <div className={styles.questionItem}>✓ Select all symptoms you are experiencing</div>
                    <div className={styles.questionItem}>✓ Have you had any previous dental surgeries?</div>
                    <div className={styles.questionItem}>✓ Do you smoke or use tobacco products?</div>
                </div>
            </Card>
        </MainLayout>
    );
}

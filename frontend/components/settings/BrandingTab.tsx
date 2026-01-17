'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { useSettingsStore } from '@/store/settingsStore';
import styles from './settings-tabs.module.css';

export const BrandingTab: React.FC = () => {
    const clinicBranding = useSettingsStore((state) => state.clinicBranding);
    const fetchClinicBranding = useSettingsStore((state) => state.fetchClinicBranding);
    const updateClinicBranding = useSettingsStore((state) => state.updateClinicBranding);
    const users = useSettingsStore((state) => state.users);
    const fetchUsers = useSettingsStore((state) => state.fetchUsers);
    const doctorLogo = useSettingsStore((state) => state.doctorLogo);
    const updateDoctorLogo = useSettingsStore((state) => state.updateDoctorLogo);
    const uploadLogo = useSettingsStore((state) => state.uploadLogo);

    const [branding, setBranding] = useState(clinicBranding);

    useEffect(() => {
        fetchClinicBranding();
        fetchUsers();
    }, [fetchClinicBranding, fetchUsers]);

    useEffect(() => {
        setBranding(clinicBranding);
    }, [clinicBranding]);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Preview
            const reader = new FileReader();
            reader.onloadend = () => {
                updateDoctorLogo(reader.result as string);
            };
            reader.readAsDataURL(file);

            // Upload to API
            try {
                const { id, url } = await uploadLogo(file);
                // Store logoId in branding state so "Save" sends it
                setBranding((prev) => ({ ...prev, logoId: id, logo: url }));
                toast.success('Logo uploaded successfully!');
            } catch (error) {
                console.error(error);
                toast.error('Failed to upload logo');
            }
        }
    };

    const handleSave = async () => {
        await updateClinicBranding(branding);
    };

    const doctorOptions = users
        .filter((u) => u.role === 'dentist' || u.role === 'admin')
        .map((u) => ({
            value: u.id,
            label: `${u.name}${u.role === 'admin' ? ' (Admin)' : ''}`,
        }));

    return (
        <div className={styles.tabContent}>
            <Card title="Clinic Logo">
                <div className={styles.logoSection}>
                    {doctorLogo && (
                        <div className={styles.logoPreview}>
                            <img src={doctorLogo} alt="Clinic Logo" className={styles.logoImage} />
                        </div>
                    )}
                    <p className={styles.description}>
                        Upload your clinic logo. This will be displayed on medical history forms and other patient-facing documents.
                    </p>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className={styles.fileInput}
                    />
                </div>
            </Card>

            <Card title="Clinic Information" className={styles.marginTop}>
                <div className={styles.form}>
                    <Input
                        type="text"
                        label="Clinic Name *"
                        value={branding.clinicName}
                        onChange={(value) => setBranding({ ...branding, clinicName: value })}
                        placeholder="e.g., DentaCare Pro"
                    />
                    <Input
                        type="text"
                        label="Location / Address *"
                        value={branding.location}
                        onChange={(value) => setBranding({ ...branding, location: value })}
                        placeholder="123 Dental Street, Suite 100, New York, NY 10001"
                    />
                    <Input
                        type="tel"
                        label="Phone Number *"
                        value={branding.phone}
                        onChange={(value) => setBranding({ ...branding, phone: value })}
                        placeholder="+1 (555) 123-4567"
                    />
                    <Input
                        type="email"
                        label="Email Address *"
                        value={branding.email}
                        onChange={(value) => setBranding({ ...branding, email: value })}
                        placeholder="info@dentacarepro.com"
                    />
                    <Input
                        type="text"
                        label="Website"
                        value={branding.website || ''}
                        onChange={(value) => setBranding({ ...branding, website: value })}
                        placeholder="https://www.dentacarepro.com"
                    />

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                            Default Doctor (New Appointments)
                        </label>
                        <Select
                            options={[{ value: '', label: 'None' }, ...doctorOptions]}
                            value={branding.defaultDoctorId || ''}
                            onChange={(value) => setBranding({ ...branding, defaultDoctorId: value || null })}
                            placeholder="Select a default doctor..."
                        />
                        <p className={styles.description} style={{ marginTop: '8px', marginBottom: 0 }}>
                            This doctor will be preselected when creating a new appointment.
                        </p>
                    </div>

                    <div className={styles.formActions}>
                        <Button onClick={handleSave}>Save Branding</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, Tab } from '@/components/common/Tabs';
import { ProfileTab } from '@/components/settings/ProfileTab';
import { TreatmentTypesTab } from '@/components/settings/TreatmentTypesTab';
import { UsersTab } from '@/components/settings/UsersTab';
import { BrandingTab } from '@/components/settings/BrandingTab';
import { NotificationsTab } from '@/components/settings/NotificationsTab';
import { MedicalHistoryTab } from '@/components/settings/MedicalHistoryTab';
import { useSettingsStore } from '@/store/settingsStore';
import styles from './settings.module.css';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const fetchClinicBranding = useSettingsStore((state) => state.fetchClinicBranding);

    useEffect(() => {
        // Fetch clinic branding on mount for notification templates
        fetchClinicBranding();
    }, []);

    const tabs: Tab[] = [
        { id: 'profile', label: 'Profile Settings', icon: '👤' },
        { id: 'treatments', label: 'Treatment Types', icon: '🦷' },
        { id: 'users', label: 'Users', icon: '👥' },
        { id: 'branding', label: 'Branding', icon: '🏥' },
        { id: 'notifications', label: 'Notifications', icon: '🔔' },
        { id: 'medical-history', label: 'Medical History', icon: '📋' },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return <ProfileTab />;
            case 'treatments':
                return <TreatmentTypesTab />;
            case 'users':
                return <UsersTab />;
            case 'branding':
                return <BrandingTab />;
            case 'notifications':
                return <NotificationsTab />;
            case 'medical-history':
                return <MedicalHistoryTab />;
            default:
                return <ProfileTab />;
        }
    };

    return (
        <MainLayout title="Settings">
            <div className={styles.settingsContainer}>
                <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                <div className={styles.tabContentWrapper}>{renderTabContent()}</div>
            </div>
        </MainLayout>
    );
}

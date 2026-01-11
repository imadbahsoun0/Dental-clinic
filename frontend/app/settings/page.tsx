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
import { WhatsappIntegrationTab } from '@/components/settings/WhatsappIntegrationTab';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';
import styles from './settings.module.css';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const fetchClinicBranding = useSettingsStore((state) => state.fetchClinicBranding);
    const currentOrg = useAuthStore((state) => state.currentOrg);
    const role = currentOrg?.role;

    useEffect(() => {
        // Only admins can access branding/settings endpoints.
        if (role === 'admin') {
            fetchClinicBranding();
        }
    }, [fetchClinicBranding, role]);

    const tabs: Tab[] = role === 'admin'
        ? [
            { id: 'profile', label: 'Profile Settings', icon: '👤' },
            { id: 'treatments', label: 'Treatment Types', icon: '🦷' },
            { id: 'users', label: 'Users', icon: '👥' },
            { id: 'branding', label: 'Branding', icon: '🏥' },
            { id: 'notifications', label: 'Notifications', icon: '🔔' },
            { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
            { id: 'medical-history', label: 'Medical History', icon: '📋' },
        ]
        : [
            { id: 'profile', label: 'Profile Settings', icon: '👤' },
        ];

    const effectiveActiveTab = role === 'admin' ? activeTab : 'profile';

    const handleTabChange = (tabId: string) => {
        if (role === 'admin') {
            setActiveTab(tabId);
        }
    };

    const renderTabContent = () => {
        switch (effectiveActiveTab) {
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
            case 'whatsapp':
                return <WhatsappIntegrationTab />;
            case 'medical-history':
                return <MedicalHistoryTab />;
            default:
                return <ProfileTab />;
        }
    };

    return (
        <MainLayout title="Settings">
            <div className={styles.settingsContainer}>
                <Tabs tabs={tabs} activeTab={effectiveActiveTab} onTabChange={handleTabChange} />
                <div className={styles.tabContentWrapper}>{renderTabContent()}</div>
            </div>
        </MainLayout>
    );
}

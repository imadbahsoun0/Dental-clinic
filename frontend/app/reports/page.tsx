'use client';

import React, { useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, Tab } from '@/components/common/Tabs';
import { useAuthStore } from '@/store/authStore';
import { IncomeReportTab } from '@/components/reports/IncomeReportTab';
import { TreatmentsReportTab } from '@/components/reports/TreatmentsReportTab';
import styles from '@/components/reports/reports.module.css';

type ReportTabId = 'income' | 'treatments';

export default function ReportsPage() {
    const currentOrg = useAuthStore((state) => state.currentOrg);
    const role = currentOrg?.role;

    const [activeTab, setActiveTab] = useState<ReportTabId>('income');

    const tabs: Tab[] = useMemo(
        () => [
            { id: 'income', label: 'Income', icon: '💵' },
            { id: 'treatments', label: 'Treatments', icon: '🦷' },
        ],
        [],
    );

    if (role !== 'admin') {
        return (
            <MainLayout title="Reports">
                <div className={styles.unauthorized}>
                    <h3>Access denied</h3>
                    <p className={styles.smallText}>This section is available to admins only.</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout title="Reports">
            <Tabs tabs={tabs} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as ReportTabId)} />
            {activeTab === 'income' ? <IncomeReportTab /> : <TreatmentsReportTab />}
        </MainLayout>
    );
}

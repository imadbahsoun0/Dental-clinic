'use client';

import React from 'react';
import styles from './Tabs.module.css';

export interface Tab {
    id: string;
    label: string;
    icon?: string;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
    return (
        <div className={styles.tabsContainer}>
            <div className={styles.tabsList}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
                        onClick={() => onTabChange(tab.id)}
                        type="button"
                    >
                        {tab.icon && <span className={styles.icon}>{tab.icon}</span>}
                        <span className={styles.label}>{tab.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

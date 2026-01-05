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
    const activeTabData = tabs.find(tab => tab.id === activeTab);

    return (
        <div className={styles.tabsContainer}>
            {/* Mobile Dropdown */}
            <div className={styles.mobileSelect}>
                <select 
                    value={activeTab} 
                    onChange={(e) => onTabChange(e.target.value)}
                    className={styles.select}
                >
                    {tabs.map((tab) => (
                        <option key={tab.id} value={tab.id}>
                            {tab.icon ? `${tab.icon} ${tab.label}` : tab.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Desktop Tabs */}
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

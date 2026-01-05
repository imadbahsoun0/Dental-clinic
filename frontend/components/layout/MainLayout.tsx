'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import styles from './MainLayout.module.css';

interface MainLayoutProps {
    children: React.ReactNode;
    title: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    return (
        <ProtectedRoute>
            <div className={styles.appContainer}>
                <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
                <main className={styles.mainContent}>
                    <Header title={title} onMenuToggle={toggleSidebar} />
                    <div className={styles.content}>{children}</div>
                </main>
            </div>
        </ProtectedRoute>
    );
};

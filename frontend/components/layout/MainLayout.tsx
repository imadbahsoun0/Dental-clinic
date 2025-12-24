'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import styles from './MainLayout.module.css';

interface MainLayoutProps {
    children: React.ReactNode;
    title: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
    return (
        <ProtectedRoute>
            <div className={styles.appContainer}>
                <Sidebar />
                <main className={styles.mainContent}>
                    <Header title={title} />
                    <div className={styles.content}>{children}</div>
                </main>
            </div>
        </ProtectedRoute>
    );
};

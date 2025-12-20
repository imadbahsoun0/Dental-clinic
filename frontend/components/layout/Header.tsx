'use client';

import React from 'react';
import styles from './Header.module.css';

interface HeaderProps {
    title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
    return (
        <header className={styles.header}>
            <h1 className={styles.pageTitle}>{title}</h1>
            <div className={styles.searchBar}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7a7a8a" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input type="text" placeholder="Search patients, appointments..." />
            </div>
            <div className={styles.headerRight}>
                <button className={styles.headerBtn}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    <span className={styles.notificationDot}></span>
                </button>
                <button className={styles.headerBtn}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                </button>
            </div>
        </header>
    );
};

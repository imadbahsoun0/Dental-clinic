'use client';

import React from 'react';
import styles from './Header.module.css';

interface HeaderProps {
    title: string;
    onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onMenuToggle }) => {
    return (
        <header className={styles.header}>
            {onMenuToggle && (
                <button className={styles.menuToggle} onClick={onMenuToggle} aria-label="Toggle menu">
                    ☰
                </button>
            )}
            <h1 className={styles.pageTitle}>{title}</h1>
        </header>
    );
};

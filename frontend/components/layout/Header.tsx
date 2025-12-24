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
        </header>
    );
};

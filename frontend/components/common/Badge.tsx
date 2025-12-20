import React from 'react';
import { BadgeProps } from '@/types';
import styles from './Badge.module.css';

export const Badge: React.FC<BadgeProps> = ({ variant, children }) => {
    return <span className={`${styles.badge} ${styles[variant]}`}>{children}</span>;
};

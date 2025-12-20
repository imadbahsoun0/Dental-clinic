import React from 'react';
import { CardProps } from '@/types';
import styles from './Card.module.css';

export const Card: React.FC<CardProps> = ({ title, action, children, className = '' }) => {
    return (
        <div className={`${styles.card} ${className}`}>
            {(title || action) && (
                <div className={styles.cardHeader}>
                    {title && <h3 className={styles.cardTitle}>{title}</h3>}
                    {action && <div className={styles.cardAction}>{action}</div>}
                </div>
            )}
            <div className={styles.cardBody}>{children}</div>
        </div>
    );
};

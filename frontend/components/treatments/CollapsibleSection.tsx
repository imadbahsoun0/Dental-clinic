'use client';

import React, { useState } from 'react';
import styles from './CollapsibleSection.module.css';

interface CollapsibleSectionProps {
    title: string;
    defaultCollapsed?: boolean;
    children: React.ReactNode;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
    title,
    defaultCollapsed = false,
    children,
}) => {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

    return (
        <div className={styles.collapsibleSection}>
            <button
                className={styles.header}
                onClick={() => setIsCollapsed(!isCollapsed)}
                aria-expanded={!isCollapsed}
            >
                <h2 className={styles.title}>{title}</h2>
                <span className={`${styles.icon} ${isCollapsed ? styles.collapsed : ''}`}>
                    ▼
                </span>
            </button>
            {!isCollapsed && <div className={styles.content}>{children}</div>}
        </div>
    );
};

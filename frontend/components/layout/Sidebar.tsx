'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/appointments', label: 'Appointments', icon: '📅', badge: '8' },
    { href: '/patients', label: 'Patients', icon: '👥' },
    { href: '/treatments', label: 'Treatments', icon: '🦷' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export const Sidebar: React.FC = () => {
    const pathname = usePathname();

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logoSection}>
                <Link href="/dashboard" className={styles.logo}>
                    <div className={styles.logoIcon}>🦷</div>
                    <div>
                        <div className={styles.logoText}>DentaCare</div>
                        <div className={styles.logoSubtitle}>Pro</div>
                    </div>
                </Link>
            </div>

            <nav className={styles.navSection}>
                <div className={styles.navLabel}>Main Menu</div>
                {navItems.map((item) => {
                    const isActive = pathname?.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                        >
                            <span className={styles.navItemIcon}>{item.icon}</span>
                            <span>{item.label}</span>
                            {item.badge && <span className={styles.navBadge}>{item.badge}</span>}
                        </Link>
                    );
                })}
            </nav>

            <div className={styles.userSection}>
                <div className={styles.userCard}>
                    <div className={styles.userAvatar}>DR</div>
                    <div>
                        <div className={styles.userName}>Dr. Rachel Kim</div>
                        <div className={styles.userRole}>Dentist</div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

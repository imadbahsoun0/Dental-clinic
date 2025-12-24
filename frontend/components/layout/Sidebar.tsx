'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import styles from './Sidebar.module.css';

const mainNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/appointments', label: 'Appointments', icon: '📅', badge: '8' },
    { href: '/patients', label: 'Patients', icon: '👥' },
    { href: '/expenses', label: 'Expenses', icon: '💰' },
    { href: '/doctors-payments', label: 'Doctor Payments', icon: '💳' },
];

const settingsNavItems = [
    { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export const Sidebar: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();
    const currentUser = useAuthStore((state) => state.currentUser);
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    // Get user initials
    const getUserInitials = (name: string) => {
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

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

            {/* Main Navigation */}
            <nav className={styles.navSection}>
                <div className={styles.navLabel}>Main Menu</div>
                {mainNavItems.map((item) => {
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

            {/* Settings Navigation */}
            <nav className={styles.navSection}>
                <div className={styles.navLabel}>Configuration</div>
                {settingsNavItems.map((item) => {
                    const isActive = pathname?.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                        >
                            <span className={styles.navItemIcon}>{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {currentUser && (
                <div className={styles.userSection}>
                    <div className={styles.userCard}>
                        <div className={styles.userAvatar}>
                            {getUserInitials(currentUser.name)}
                        </div>
                        <div className={styles.userInfo}>
                            <div className={styles.userName}>{currentUser.name}</div>
                            <div className={styles.userRole}>
                                {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                            </div>
                        </div>
                    </div>
                    <button onClick={handleLogout} className={styles.logoutButton}>
                        <span className={styles.logoutIcon}>🚪</span>
                        <span>Logout</span>
                    </button>
                </div>
            )}
        </aside>
    );
};

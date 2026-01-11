'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useAppointmentStore } from '@/store/appointmentStore';
import styles from './Sidebar.module.css';

const mainNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/appointments', label: 'Appointments', icon: '📅' }, // Removed static badge
    { href: '/patients', label: 'Patients', icon: '👥' },
    { href: '/expenses', label: 'Expenses', icon: '💰' },
    { href: '/doctors-payments', label: 'Doctor Payments', icon: '💳' },
    { href: '/notifications', label: 'Notifications', icon: '🔔' },
    { href: '/reports', label: 'Reports', icon: '📈' },

];

const settingsNavItems = [
    { href: '/settings', label: 'Settings', icon: '⚙️' },
];

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
    const pathname = usePathname();
    const router = useRouter();
    const currentUser = useAuthStore((state) => state.currentUser);
    const currentOrg = useAuthStore((state) => state.currentOrg);
    const logout = useAuthStore((state) => state.logout);

    const role = currentOrg?.role;

    const visibleMainNavItems = React.useMemo(() => {
        return mainNavItems.filter((item) => {
            if (item.href === '/reports') {
                return role === 'admin';
            }
            // Secretary should not see Doctor Payments page.
            if (role === 'secretary' && item.href === '/doctors-payments') {
                return false;
            }
            return true;
        });
    }, [role]);

    // Dynamic Appointment Badge
    const todayCount = useAppointmentStore((state) => state.todayCount);
    const fetchTodayStats = useAppointmentStore((state) => state.fetchTodayStats);

    React.useEffect(() => {
        fetchTodayStats();
        // Poll every minute to keep the count fresh
        const interval = setInterval(fetchTodayStats, 60000);
        return () => clearInterval(interval);
    }, [fetchTodayStats]);

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

    const handleLinkClick = () => {
        if (onClose) {
            onClose();
        }
    };

    return (
        <>
            {isOpen && <div className={`${styles.overlay} ${isOpen ? styles.active : ''}`} onClick={onClose}></div>}
            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
            <div className={styles.logoSection}>
                <Link href="/dashboard" className={styles.logo}>
                    <div className={styles.logoIcon}>🦷</div>
                    <div>
                        <div className={styles.logoText}>DentiFlow</div>
                        <div className={styles.logoSubtitle}></div>
                    </div>
                </Link>
            </div>

            {/* Main Navigation */}
            <nav className={styles.navSection}>
                <div className={styles.navLabel}>Main Menu</div>
                {visibleMainNavItems.map((item) => {
                    const isActive = pathname?.startsWith(item.href);
                    // Determine badge content
                    let badge = null;
                    if (item.label === 'Appointments' && todayCount > 0) {
                        badge = String(todayCount);
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                            onClick={handleLinkClick}
                        >
                            <span className={styles.navItemIcon}>{item.icon}</span>
                            <span>{item.label}</span>
                            {badge && <span className={styles.navBadge}>{badge}</span>}
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
                            onClick={handleLinkClick}
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
                                {(currentOrg?.role || 'user').charAt(0).toUpperCase() + (currentOrg?.role || 'user').slice(1)}
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
        </>
    );
};

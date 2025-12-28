import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import styles from './OrganizationSelector.module.css';

export default function OrganizationSelector() {
    const { currentUser, selectOrganization } = useAuthStore();
    const [selectedOrgId, setSelectedOrgId] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const activeOrgs = currentUser?.organizations?.filter(org => org.status === 'active') || [];

    const handleSelectOrganization = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!selectedOrgId) {
            setError('Please select an organization');
            return;
        }

        setIsLoading(true);
        const result = await selectOrganization(selectedOrgId);
        setIsLoading(false);

        if (result.success) {
            router.push('/dashboard');
        } else {
            setError(result.error || 'Failed to select organization');
        }
    };

    const handleLogout = async () => {
        await useAuthStore.getState().logout();
        router.push('/login');
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.logo}>
                        <div className={styles.logoIcon}>🦷</div>
                        <div>
                            <div className={styles.logoText}>DentaCare</div>
                            <div className={styles.logoSubtitle}>Pro</div>
                        </div>
                    </div>
                    <h1 className={styles.title}>Select Organization</h1>
                    <p className={styles.subtitle}>
                        Welcome back, {currentUser?.name}
                    </p>
                    <p className={styles.description}>
                        You have access to multiple organizations. Please select one to continue.
                    </p>
                </div>

                <form onSubmit={handleSelectOrganization} className={styles.form}>
                    {error && (
                        <div className={styles.error}>
                            <span className={styles.errorIcon}>⚠️</span>
                            {error}
                        </div>
                    )}

                    <div>
                        <div className={styles.sectionLabel}>
                            Choose Organization
                        </div>
                        <div className={styles.orgList}>
                            {activeOrgs.map((org) => (
                                <label
                                    key={org.id}
                                    className={`${styles.orgCard} ${selectedOrgId === org.orgId ? styles.selected : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name="organization"
                                        value={org.orgId}
                                        checked={selectedOrgId === org.orgId}
                                        onChange={(e) => setSelectedOrgId(e.target.value)}
                                        className={styles.radioInput}
                                    />
                                    <div className={styles.orgInfo}>
                                        <div className={styles.orgHeader}>
                                            <span className={styles.orgName}>
                                                {org.orgName || 'Unknown Organization'}
                                            </span>
                                            <span className={`${styles.roleBadge} ${styles[org.role]}`}>
                                                {org.role}
                                            </span>
                                        </div>
                                        {org.role === 'dentist' && org.percentage && (
                                            <div className={styles.orgDetails}>
                                                Commission: {org.percentage}%
                                            </div>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !selectedOrgId}
                        className={styles.submitButton}
                    >
                        {isLoading ? 'Loading...' : 'Continue'}
                    </button>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className={styles.logoutButton}
                    >
                        Logout
                    </button>
                </form>
            </div>
        </div>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import styles from './login.module.css';

export default function LoginPage() {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await login(email, password);

            if (result.success) {
                router.push('/dashboard');
            } else {
                setError(result.error || 'Login failed');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginCard}>
                <div className={styles.header}>
                    <div className={styles.logo}>
                        <div className={styles.logoIcon}>🦷</div>
                        <div>
                            <div className={styles.logoText}>DentaCare</div>
                            <div className={styles.logoSubtitle}>Pro</div>
                        </div>
                    </div>
                    <h1 className={styles.title}>Welcome Back</h1>
                    <p className={styles.subtitle}>Sign in to your account to continue</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && (
                        <div className={styles.error}>
                            <span className={styles.errorIcon}>⚠️</span>
                            {error}
                        </div>
                    )}

                    <Input
                        type="email"
                        label="Email Address"
                        value={email}
                        onChange={setEmail}
                        placeholder="your.email@dentalclinic.com"
                        required
                    />

                    <Input
                        type="password"
                        label="Password"
                        value={password}
                        onChange={setPassword}
                        placeholder="Enter your password"
                        required
                    />

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className={styles.submitButton}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>

                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <Link href="/forgot-password" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.875rem' }}>
                            Forgot Password?
                        </Link>
                    </div>
                </form>

                <div className={styles.footer}>
                    <p className={styles.hint}>
                        💡 Demo credentials: Use any email from the users list with password: <code>password123</code>
                    </p>
                </div>
            </div>
        </div>
    );
}

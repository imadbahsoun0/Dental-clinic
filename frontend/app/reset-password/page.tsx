'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import styles from './reset-password.module.css';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!token) {
            setError('Invalid or missing reset token');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.api.authControllerResetPassword({
                token,
                newPassword: password,
            });

            if (response.success) {
                setMessage(response.message);
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } else {
                setError(response.message || 'Failed to reset password');
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className={styles.error}>
                <span className={styles.icon}>⚠️</span>
                Invalid or missing reset token. Please request a new password reset link.
                <div className={styles.backLink}>
                    <Link href="/forgot-password">Request Reset Link</Link>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {message && (
                <div className={styles.message}>
                    <span className={styles.icon}>✅</span>
                    {message}
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                        Redirecting to login...
                    </div>
                </div>
            )}

            {error && (
                <div className={styles.error}>
                    <span className={styles.icon}>⚠️</span>
                    {error}
                </div>
            )}

            <Input
                type="password"
                label="New Password"
                value={password}
                onChange={setPassword}
                placeholder="Enter new password"
                required
            />

            <Input
                type="password"
                label="Confirm Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Confirm new password"
                required
            />

            <Button
                type="submit"
                disabled={isLoading}
                className={styles.submitButton}
            >
                {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
        </form>
    );
}

export default function ResetPasswordPage() {
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
                    <h1 className={styles.title}>Reset Password</h1>
                    <p className={styles.subtitle}>Enter your new password below</p>
                </div>

                <Suspense fallback={<div>Loading...</div>}>
                    <ResetPasswordForm />
                </Suspense>

                <div className={styles.backLink}>
                    <Link href="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.875rem' }}>
                        ← Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}

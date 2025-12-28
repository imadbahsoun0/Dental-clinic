'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import styles from './forgot-password.module.css';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        try {
            const response = await api.api.authControllerForgotPassword({ email });
            if (response.success) {
                setMessage(response.message);
                setEmail('');
            } else {
                setError(response.message || 'Failed to send reset email');
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || 'An unexpected error occurred');
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
                    <h1 className={styles.title}>Forgot Password</h1>
                    <p className={styles.subtitle}>Enter your email to receive reset instructions</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {message && (
                        <div className={styles.message}>
                            <span className={styles.icon}>✅</span>
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className={styles.error}>
                            <span className={styles.icon}>⚠️</span>
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

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className={styles.submitButton}
                    >
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </Button>

                    <div className={styles.backLink}>
                        <Link href="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.875rem' }}>
                            ← Back to Sign In
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

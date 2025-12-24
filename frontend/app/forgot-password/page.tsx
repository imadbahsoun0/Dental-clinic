'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSettingsStore } from '@/store/settingsStore';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import styles from '../login/login.module.css';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const users = useSettingsStore((state) => state.users);
    const updateUser = useSettingsStore((state) => state.updateUser);

    const [step, setStep] = useState<'email' | 'reset'>('email');
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [userId, setUserId] = useState('');

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Find user by email
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            setError('No account found with this email address');
            return;
        }

        if (user.status !== 'active') {
            setError('Account is inactive. Please contact administrator.');
            return;
        }

        // In a real app, you would send a reset email here
        // For demo purposes, we'll just move to the reset step
        setUserId(user.id);
        setStep('reset');
        setSuccess('Email verified! You can now reset your password.');
    };

    const handlePasswordReset = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!newPassword || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Update user password
        updateUser(userId, { password: newPassword });

        setSuccess('Password reset successful! Redirecting to login...');
        setTimeout(() => {
            router.push('/login');
        }, 2000);
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
                    <h1 className={styles.title}>
                        {step === 'email' ? 'Forgot Password?' : 'Reset Password'}
                    </h1>
                    <p className={styles.subtitle}>
                        {step === 'email'
                            ? 'Enter your email to reset your password'
                            : 'Enter your new password'
                        }
                    </p>
                </div>

                {step === 'email' ? (
                    <form onSubmit={handleEmailSubmit} className={styles.form}>
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

                        <Button type="submit" className={styles.submitButton}>
                            Continue
                        </Button>

                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <Link href="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.875rem' }}>
                                ← Back to Login
                            </Link>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handlePasswordReset} className={styles.form}>
                        {error && (
                            <div className={styles.error}>
                                <span className={styles.errorIcon}>⚠️</span>
                                {error}
                            </div>
                        )}

                        {success && (
                            <div style={{
                                backgroundColor: '#d1fae5',
                                border: '1px solid #6ee7b7',
                                color: '#065f46',
                                padding: '0.875rem 1rem',
                                borderRadius: '12px',
                                fontSize: '0.875rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <span style={{ fontSize: '1.125rem' }}>✓</span>
                                {success}
                            </div>
                        )}

                        <Input
                            type="password"
                            label="New Password"
                            value={newPassword}
                            onChange={setNewPassword}
                            placeholder="Enter new password (min. 6 characters)"
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

                        <Button type="submit" className={styles.submitButton}>
                            Reset Password
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}

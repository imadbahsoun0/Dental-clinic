'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import styles from './settings-tabs.module.css';

export const ProfileTab: React.FC = () => {
    const user = useAuthStore((state) => state.user);
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
    });

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        if (user) {
            setProfile({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    const handleProfileSave = async () => {
        if (!profile.name || !profile.email) {
            toast.error('Name and email are required');
            return;
        }

        setLoading(true);
        try {
            const response = await api.api.usersControllerUpdateProfile({
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
            });
            const result = response as any;
            if (result.success) {
                toast.success('Profile updated successfully');
                // Update auth store
                useAuthStore.getState().setUser({ ...user, ...result.data });
            }
        } catch (error: any) {
            console.error('Failed to update profile:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
            toast.error('All password fields are required');
            return;
        }

        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (passwords.newPassword.length < 8) {
            toast.error('Password must be at least 8 characters long');
            return;
        }

        setLoading(true);
        try {
            const response = await api.api.authControllerChangePassword({
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword,
            });
            const result = response as any;
            if (result.success) {
                toast.success('Password changed successfully. Please login again.');
                setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
                // Redirect to login after a short delay
                setTimeout(() => {
                    useAuthStore.getState().logout();
                    window.location.href = '/login';
                }, 2000);
            }
        } catch (error: any) {
            console.error('Failed to change password:', error);
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.tabContent}>
            <Card title="Profile Information">
                <div className={styles.form}>
                    <Input
                        type="text"
                        label="Full Name"
                        value={profile.name}
                        onChange={(value) => setProfile({ ...profile, name: value })}
                        required
                    />
                    <Input
                        type="email"
                        label="Email Address"
                        value={profile.email}
                        onChange={(value) => setProfile({ ...profile, email: value })}
                        required
                    />
                    <Input
                        type="tel"
                        label="Phone Number"
                        value={profile.phone}
                        onChange={(value) => setProfile({ ...profile, phone: value })}
                    />
                    <div className={styles.formActions}>
                        <Button onClick={handleProfileSave} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Profile'}
                        </Button>
                    </div>
                </div>
            </Card>

            <Card title="Change Password" className={styles.marginTop}>
                <div className={styles.form}>
                    <Input
                        type="password"
                        label="Current Password"
                        value={passwords.currentPassword}
                        onChange={(value) => setPasswords({ ...passwords, currentPassword: value })}
                        required
                    />
                    <Input
                        type="password"
                        label="New Password"
                        value={passwords.newPassword}
                        onChange={(value) => setPasswords({ ...passwords, newPassword: value })}
                        placeholder="At least 8 characters"
                        required
                    />
                    <Input
                        type="password"
                        label="Confirm New Password"
                        value={passwords.confirmPassword}
                        onChange={(value) => setPasswords({ ...passwords, confirmPassword: value })}
                        required
                    />
                    <div className={styles.formActions}>
                        <Button onClick={handlePasswordChange} disabled={loading}>
                            {loading ? 'Changing...' : 'Change Password'}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

'use client';

import React, { useState } from 'react';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import styles from './settings-tabs.module.css';

export const ProfileTab: React.FC = () => {
    const [profile, setProfile] = useState({
        name: 'Dr. Sarah Smith',
        email: 'sarah.smith@dentalclinic.com',
        phone: '+1 (555) 100-0001',
    });

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleProfileSave = () => {
        // TODO: Implement profile save logic
        alert('Profile updated successfully!');
    };

    const handlePasswordChange = () => {
        if (passwords.newPassword !== passwords.confirmPassword) {
            alert('New passwords do not match!');
            return;
        }
        if (passwords.newPassword.length < 8) {
            alert('Password must be at least 8 characters long!');
            return;
        }
        // TODO: Implement password change logic
        alert('Password changed successfully!');
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
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
                    />
                    <Input
                        type="email"
                        label="Email Address"
                        value={profile.email}
                        onChange={(value) => setProfile({ ...profile, email: value })}
                    />
                    <Input
                        type="tel"
                        label="Phone Number"
                        value={profile.phone}
                        onChange={(value) => setProfile({ ...profile, phone: value })}
                    />
                    <div className={styles.formActions}>
                        <Button onClick={handleProfileSave}>Save Profile</Button>
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
                    />
                    <Input
                        type="password"
                        label="New Password"
                        value={passwords.newPassword}
                        onChange={(value) => setPasswords({ ...passwords, newPassword: value })}
                    />
                    <Input
                        type="password"
                        label="Confirm New Password"
                        value={passwords.confirmPassword}
                        onChange={(value) => setPasswords({ ...passwords, confirmPassword: value })}
                    />
                    <div className={styles.formActions}>
                        <Button onClick={handlePasswordChange}>Change Password</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

'use client';

import React, { useState } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Table, TableColumn, TableAction } from '@/components/common/Table';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { useSettingsStore } from '@/store/settingsStore';
import { User } from '@/types';
import styles from './settings-tabs.module.css';

export const UsersTab: React.FC = () => {
    const users = useSettingsStore((state) => state.users);
    const addUser = useSettingsStore((state) => state.addUser);
    const updateUser = useSettingsStore((state) => state.updateUser);
    const deleteUser = useSettingsStore((state) => state.deleteUser);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [userForm, setUserForm] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'secretary' as 'dentist' | 'secretary' | 'admin',
        status: 'active' as 'active' | 'inactive',
        wallet: '0',
        percentage: '',
    });

    const handleAddUser = () => {
        setEditingUser(null);
        setUserForm({
            name: '',
            email: '',
            phone: '',
            role: 'secretary',
            status: 'active',
            wallet: '0',
            percentage: '',
        });
        setModalOpen(true);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setUserForm({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            role: user.role,
            status: user.status,
            wallet: user.wallet?.toString() || '0',
            percentage: user.percentage?.toString() || '',
        });
        setModalOpen(true);
    };

    const handleSaveUser = () => {
        if (!userForm.name || !userForm.email) {
            alert('Please fill in all required fields');
            return;
        }

        // Validate dentist-specific fields
        if (userForm.role === 'dentist' && !userForm.percentage) {
            alert('Percentage is required for dentists');
            return;
        }

        const userData: any = {
            name: userForm.name,
            email: userForm.email,
            phone: userForm.phone,
            role: userForm.role,
            status: userForm.status,
        };

        // Add wallet and percentage for dentists
        if (userForm.role === 'dentist') {
            userData.wallet = parseFloat(userForm.wallet) || 0;
            userData.percentage = parseFloat(userForm.percentage) || 0;
        }

        if (editingUser) {
            updateUser(editingUser.id, userData);
        } else {
            addUser(userData);
        }
        setModalOpen(false);
    };

    const handleDeleteUser = (user: User) => {
        if (confirm(`Are you sure you want to delete "${user.name}"?`)) {
            deleteUser(user.id);
        }
    };

    const handleToggleStatus = (user: User) => {
        updateUser(user.id, { status: user.status === 'active' ? 'inactive' : 'active' });
    };

    const columns: TableColumn<User>[] = [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        {
            key: 'role',
            label: 'Role',
            render: (user) => (
                <span
                    style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor:
                            user.role === 'admin'
                                ? '#fef3c7'
                                : user.role === 'dentist'
                                    ? '#dbeafe'
                                    : '#f3e8ff',
                        color:
                            user.role === 'admin'
                                ? '#92400e'
                                : user.role === 'dentist'
                                    ? '#1e40af'
                                    : '#6b21a8',
                    }}
                >
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
            ),
        },
        {
            key: 'percentage',
            label: 'Commission',
            render: (user) => (
                user.role === 'dentist' && user.percentage ? (
                    <span style={{ fontWeight: 600, color: '#059669' }}>
                        {user.percentage}%
                    </span>
                ) : (
                    <span style={{ color: '#9ca3af' }}>-</span>
                )
            ),
        },
        {
            key: 'wallet',
            label: 'Wallet',
            render: (user) => (
                user.role === 'dentist' ? (
                    <span style={{ fontWeight: 600, color: user.wallet && user.wallet > 0 ? '#dc2626' : '#6b7280' }}>
                        ${(user.wallet || 0).toFixed(2)}
                    </span>
                ) : (
                    <span style={{ color: '#9ca3af' }}>-</span>
                )
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (user) => (
                <span
                    style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor: user.status === 'active' ? '#d1fae5' : '#fee2e2',
                        color: user.status === 'active' ? '#065f46' : '#991b1b',
                    }}
                >
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </span>
            ),
        },
    ];

    const actions: TableAction<User>[] = [
        {
            label: (user: User) => (user.status === 'active' ? 'Deactivate' : 'Activate'),
            onClick: handleToggleStatus,
            variant: 'secondary',
        } as any,
        { label: 'Edit', onClick: handleEditUser, variant: 'secondary' },
        { label: 'Delete', onClick: handleDeleteUser, variant: 'danger' },
    ];

    return (
        <div className={styles.tabContent}>
            <Card title="Users" action={<Button onClick={handleAddUser}>Add User</Button>}>
                <Table
                    columns={columns}
                    data={users}
                    actions={actions}
                    emptyMessage="No users found. Add your first user to get started."
                />
            </Card>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingUser ? 'Edit User' : 'Add User'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveUser}>{editingUser ? 'Update' : 'Add'} User</Button>
                    </>
                }
            >
                <div className={styles.form}>
                    <Input
                        type="text"
                        label="Full Name *"
                        value={userForm.name}
                        onChange={(value) => setUserForm({ ...userForm, name: value })}
                        placeholder="e.g., Dr. John Doe"
                    />
                    <Input
                        type="email"
                        label="Email Address *"
                        value={userForm.email}
                        onChange={(value) => setUserForm({ ...userForm, email: value })}
                        placeholder="john.doe@dentalclinic.com"
                    />
                    <Input
                        type="tel"
                        label="Phone Number"
                        value={userForm.phone}
                        onChange={(value) => setUserForm({ ...userForm, phone: value })}
                        placeholder="+1 (555) 123-4567"
                    />
                    <Select
                        label="Role *"
                        options={[
                            { value: 'dentist', label: 'Dentist' },
                            { value: 'secretary', label: 'Secretary' },
                            { value: 'admin', label: 'Admin' },
                        ]}
                        value={userForm.role}
                        onChange={(value) => setUserForm({ ...userForm, role: value as any })}
                    />
                    <Select
                        label="Status *"
                        options={[
                            { value: 'active', label: 'Active' },
                            { value: 'inactive', label: 'Inactive' },
                        ]}
                        value={userForm.status}
                        onChange={(value) => setUserForm({ ...userForm, status: value as any })}
                    />
                    {userForm.role === 'dentist' && (
                        <>
                            <Input
                                type="number"
                                label="Commission Percentage *"
                                value={userForm.percentage}
                                onChange={(value) => setUserForm({ ...userForm, percentage: value })}
                                placeholder="e.g., 30"
                            />
                            <Input
                                type="number"
                                label="Wallet Balance"
                                value={userForm.wallet}
                                onChange={(value) => setUserForm({ ...userForm, wallet: value })}
                                placeholder="0.00"
                            />
                        </>
                    )}
                </div>
            </Modal>
        </div>
    );
};

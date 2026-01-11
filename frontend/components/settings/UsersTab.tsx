import React, { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Table, TableColumn, TableAction } from '@/components/common/Table';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { useSettingsStore } from '@/store/settingsStore';
import type { UserWithRole } from '@/types';
import styles from './settings-tabs.module.css';
import { ConfirmationModal } from '../common/ConfirmationModal';
import toast from 'react-hot-toast';

type UserRole = 'secretary' | 'dentist' | 'admin';
type UserStatus = 'active' | 'inactive';

type UserFormState = {
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    status: UserStatus;
    wallet: string;
    percentage: string;
    password: string;
};

export const UsersTab: React.FC = () => {
    const users = useSettingsStore((state) => state.users);
    const fetchUsers = useSettingsStore((state) => state.fetchUsers);
    const addUser = useSettingsStore((state) => state.addUser);
    const updateUser = useSettingsStore((state) => state.updateUser);
    const deleteUser = useSettingsStore((state) => state.deleteUser);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserWithRole | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [userForm, setUserForm] = useState<UserFormState>({
        name: '',
        email: '',
        phone: '',
        role: 'secretary',
        status: 'active',
        wallet: '0',
        percentage: '',
        password: '',
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const handleAddUser = () => {
        setEditingUser(null);
        setFormErrors({});
        setUserForm({
            name: '',
            email: '',
            phone: '',
            role: 'secretary',
            status: 'active',
            wallet: '0',
            percentage: '',
            password: '',
        });
        setModalOpen(true);
    };

    const handleEditUser = (user: UserWithRole) => {
        setEditingUser(user);
        setFormErrors({});
        setUserForm({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            role: user.role ?? 'secretary',
            status: user.status ?? 'active',
            wallet: user.wallet?.toString() || '0',
            percentage: user.percentage?.toString() || '',
            password: '',
        });
        setModalOpen(true);
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};
        if (!userForm.name.trim()) errors.name = 'Full Name is required';
        if (!userForm.email.trim()) errors.email = 'Email Address is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userForm.email)) errors.email = 'Invalid email format';

        if (userForm.password && userForm.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        if (userForm.role === 'dentist') {
            if (!userForm.percentage || isNaN(Number(userForm.percentage))) {
                errors.percentage = 'Valid commission percentage is required';
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveUser = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            if (editingUser) {
                await updateUser(editingUser.id, {
                    name: userForm.name,
                    phone: userForm.phone,
                    role: userForm.role,
                    status: userForm.status,
                    percentage:
                        userForm.role === 'dentist'
                            ? parseFloat(userForm.percentage) || 0
                            : undefined,
                    password: userForm.password || undefined,
                });
                toast.success('User updated successfully');
            } else {
                await addUser({
                    name: userForm.name,
                    email: userForm.email,
                    phone: userForm.phone,
                    role: userForm.role,
                    percentage:
                        userForm.role === 'dentist'
                            ? parseFloat(userForm.percentage) || 0
                            : undefined,
                    password: userForm.password || undefined,
                });
                toast.success('User created successfully');
            }
            setModalOpen(false);
            fetchUsers(); // Refresh list to ensure sync
        } catch (error) {
            console.error(error);
            toast.error('Failed to save user');
        } finally {
            setIsLoading(false);
        }
    };

    const initiateDeleteUser = (user: UserWithRole) => {
        setUserToDelete(user);
        setConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;
        setIsLoading(true);
        try {
            await deleteUser(userToDelete.id);
            toast.success('User deleted successfully');
            setConfirmDeleteOpen(false);
            setUserToDelete(null);
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete user');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = (user: UserWithRole) => {
        const currentStatus: UserStatus = user.status ?? 'active';
        const nextStatus: UserStatus = currentStatus === 'active' ? 'inactive' : 'active';
        updateUser(user.id, { status: nextStatus });
        toast.success(`User set to ${nextStatus === 'inactive' ? 'Inactive' : 'Active'}`);
    };

    const columns: TableColumn<UserWithRole>[] = [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        {
            key: 'role',
            label: 'Role',
            render: (user: UserWithRole) => (
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
                    {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Unknown'}
                </span>
            ),
        },
        {
            key: 'percentage',
            label: 'Commission',
            render: (user: UserWithRole) => (
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
            render: (user: UserWithRole) => (
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
            render: (user: UserWithRole) => (
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
                    {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Unknown'}
                </span>
            ),
        },
    ];

    const actions: TableAction<UserWithRole>[] = [
        {
            label: (user: UserWithRole) => (user.status === 'active' ? 'Deactivate' : 'Activate'),
            onClick: handleToggleStatus, // Ensure this updates status correctly
            variant: (user: UserWithRole) => (user.status === 'active' ? 'danger' : 'primary'),
        },
        { label: 'Edit', onClick: handleEditUser, variant: 'secondary' },
        { label: 'Delete', onClick: initiateDeleteUser, variant: 'danger' },
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
                        <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveUser} disabled={isLoading}>
                            {isLoading ? 'Saving...' : (editingUser ? 'Update' : 'Add') + ' User'}
                        </Button>
                    </>
                }
            >
                <div className={styles.form}>
                    <Input
                        type="text"
                        label="Full Name"
                        value={userForm.name}
                        onChange={(value) => setUserForm({ ...userForm, name: value })}
                        placeholder="e.g., Dr. John Doe"
                        error={formErrors.name}
                        required
                    />
                    <Input
                        type="email"
                        label="Email Address"
                        value={userForm.email}
                        onChange={(value) => setUserForm({ ...userForm, email: value })}
                        placeholder="john.doe@dentalclinic.com"
                        error={formErrors.email}
                        required
                    />
                    <Input
                        type="tel"
                        label="Phone Number"
                        value={userForm.phone}
                        onChange={(value) => setUserForm({ ...userForm, phone: value })}
                        placeholder="+1 (555) 123-4567"
                    />
                    <Select
                        label="Role"
                        options={[
                            { value: 'dentist', label: 'Dentist' },
                            { value: 'secretary', label: 'Secretary' },
                            { value: 'admin', label: 'Admin' },
                        ]}
                        value={userForm.role}
                        onChange={(value) => setUserForm({ ...userForm, role: value as UserRole })}
                        error={formErrors.role}
                        required
                    />
                    <Select
                        label="Status"
                        options={[
                            { value: 'active', label: 'Active' },
                            { value: 'inactive', label: 'Inactive' },
                        ]}
                        value={userForm.status}
                        onChange={(value) => setUserForm({ ...userForm, status: value as UserStatus })}
                        error={formErrors.status}
                        required
                    />
                    <Input
                        type="password"
                        label={editingUser ? 'New Password (optional)' : 'Password (optional)'}
                        value={userForm.password}
                        onChange={(value) => setUserForm({ ...userForm, password: value })}
                        placeholder={editingUser ? 'Leave blank to keep current password' : 'Set an initial password'}
                        error={formErrors.password}
                    />
                    {userForm.role === 'dentist' && (
                        <>
                            <Input
                                type="number"
                                label="Commission Percentage"
                                value={userForm.percentage}
                                onChange={(value) => setUserForm({ ...userForm, percentage: value })}
                                placeholder="e.g., 30"
                                error={formErrors.percentage}
                                required
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

            <ConfirmationModal
                isOpen={confirmDeleteOpen}
                onClose={() => setConfirmDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete User"
                message={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="danger"
                isLoading={isLoading}
            />
        </div>
    );
};

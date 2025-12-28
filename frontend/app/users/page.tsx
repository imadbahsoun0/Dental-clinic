'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { api } from '@/lib/api';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '@/lib/api';
import styles from './users.module.css';
import toast from 'react-hot-toast';

enum UserRole {
    ADMIN = 'admin',
    DENTIST = 'dentist',
    SECRETARY = 'secretary',
}

enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserResponseDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserResponseDto | null>(null);

    const [formData, setFormData] = useState<CreateUserDto>({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: UserRole.DENTIST,
        percentage: 0,
    });

    // Pagination
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await api.api.usersControllerFindAll({ page, limit });
            const result = response.data as any;
            setUsers(result.data);
            setTotal(result.meta.total);
        } catch (error: any) {
            console.error('Failed to fetch users', error);
            toast.error('Failed to fetch users');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, limit]);

    const handleSubmit = async () => {
        try {
            if (editingUser) {
                await api.api.usersControllerUpdate(editingUser.id, {
                    name: formData.name,
                    phone: formData.phone,
                    role: formData.role,
                    percentage: formData.percentage ? Number(formData.percentage) : undefined,
                    status: UserStatus.ACTIVE, // Default or toggle
                });
                toast.success('User updated successfully');
            } else {
                await api.api.usersControllerCreate({
                    ...formData,
                    percentage: formData.percentage ? Number(formData.percentage) : undefined,
                });
                toast.success('User created successfully');
            }
            setIsModalOpen(false);
            setEditingUser(null);
            fetchUsers();
            resetForm();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (user: UserResponseDto) => {
        // Find current org details
        const currentOrg = user.organizations[0]; // Simplified for now, should pick from context
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '', // Password not editable directly here, or handled separately
            phone: user.phone || '',
            role: (currentOrg?.role as UserRole) || UserRole.DENTIST,
            percentage: currentOrg?.percentage || 0,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to deactivate this user?')) return;
        try {
            await api.api.usersControllerRemove(id);
            toast.success('User deactivated');
            fetchUsers();
        } catch (error: any) {
            toast.error('Failed to deactivate user');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            phone: '',
            role: UserRole.DENTIST,
            percentage: 0,
        });
    };

    const openCreateModal = () => {
        setEditingUser(null);
        resetForm();
        setIsModalOpen(true);
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <MainLayout title="Users">
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>User Management</h2>
                    <p>Manage users, roles, and permissions.</p>
                </div>
                <Button onClick={openCreateModal}>+ Add User</Button>
            </div>

            <div className={styles.tableContainer}>
                {isLoading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => {
                                const orgDetails = user.organizations[0]; // Assuming current org context filtering by backend
                                return (
                                    <tr key={user.id}>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{orgDetails?.role}</td>
                                        <td>
                                            <span className={`${styles.badge} ${orgDetails?.status === 'active' ? styles.badgeActive : styles.badgeInactive}`}>
                                                {orgDetails?.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button className={styles.cancelButton} onClick={() => handleEdit(user)} style={{ marginRight: '0.5rem' }}>Edit</button>
                                            <button className={styles.cancelButton} onClick={() => handleDelete(user.id)} style={{ color: 'red' }}>Deactivate</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}

                {/* Pagination Controls */}
                <div style={{ padding: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className={styles.cancelButton}>Prev</button>
                    <span>Page {page} of {totalPages || 1}</span>
                    <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className={styles.cancelButton}>Next</button>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingUser ? 'Edit User' : 'Add New User'}
                footer={
                    <div className={styles.modalActions}>
                        <button className={styles.cancelButton} onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button className={styles.submitButton} onClick={handleSubmit}>{editingUser ? 'Update' : 'Create'}</button>
                    </div>
                }
            >
                <div className={styles.formGroup}>
                    <label className={styles.label}>Name</label>
                    <input
                        className={styles.input}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Full Name"
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Email</label>
                    <input
                        className={styles.input}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={!!editingUser} // Email usually invariant
                        placeholder="Email Address"
                    />
                </div>
                {!editingUser && (
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Password</label>
                        <input
                            className={styles.input}
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Password"
                        />
                    </div>
                )}
                <div className={styles.formGroup}>
                    <label className={styles.label}>Phone</label>
                    <input
                        className={styles.input}
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Phone Number"
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Role</label>
                    <select
                        className={styles.select}
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    >
                        <option value={UserRole.ADMIN}>Admin</option>
                        <option value={UserRole.DENTIST}>Dentist</option>
                        <option value={UserRole.SECRETARY}>Secretary</option>
                    </select>
                </div>
                {formData.role === UserRole.DENTIST && (
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Commission Percentage (%)</label>
                        <input
                            className={styles.input}
                            type="number"
                            value={formData.percentage || 0}
                            onChange={(e) => setFormData({ ...formData, percentage: Number(e.target.value) })}
                        />
                    </div>
                )}
            </Modal>
        </MainLayout>
    );
}

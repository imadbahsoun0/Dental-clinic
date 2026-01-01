'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Expense } from '@/types';
import { useSettingsStore } from '@/store/settingsStore';
import { formatLocalDate } from '@/utils/dateUtils';
import styles from './ExpenseModal.module.css';

interface ExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
    expense?: Expense | null;
}

const EXPENSE_CATEGORIES = [
    'Doctor Payment',
    'Supplies',
    'Equipment',
    'Utilities',
    'Rent',
    'Salaries',
    'Marketing',
    'Maintenance',
    'Other',
];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
    isOpen,
    onClose,
    onSave,
    expense,
}) => {
    const [formData, setFormData] = useState({
        name: '',
        customName: '',
        amount: '',
        date: '',
        invoiceFile: '',
        notes: '',
        doctorId: '',
    });
    const [fileName, setFileName] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Memoize dentists to prevent infinite re-renders
    const users = useSettingsStore((state) => state.users);
    const dentists = React.useMemo(() => users.filter((u: any) => u.role === 'dentist'), [users]);

    useEffect(() => {
        if (expense) {
            const isCustom = !EXPENSE_CATEGORIES.includes(expense.name);
            setFormData({
                name: isCustom ? 'Other' : expense.name,
                customName: isCustom ? expense.name : '',
                amount: expense.amount.toString(),
                date: expense.date,
                invoiceFile: expense.invoiceFile || '',
                notes: expense.notes || '',
                doctorId: expense.doctorId || '',
            });
            if (expense.invoiceFile) {
                setFileName(expense.invoiceFile.split('/').pop() || '');
            }
        } else {
            setFormData({
                name: '',
                customName: '',
                amount: '',
                date: formatLocalDate(new Date()),
                invoiceFile: '',
                notes: '',
                doctorId: '',
            });
            setFileName('');
        }
        setErrors({});
    }, [expense, isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            // In a real app, you'd upload the file here
            setFormData({ ...formData, invoiceFile: `/invoices/${file.name}` });
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name) {
            newErrors.name = 'Expense category is required';
        }

        if (formData.name === 'Other' && !formData.customName.trim()) {
            newErrors.customName = 'Please specify the expense name';
        }

        if (formData.name === 'Doctor Payment' && !formData.doctorId) {
            newErrors.doctorId = 'Please select a doctor';
        }

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Amount must be greater than 0';
        }

        if (!formData.date) {
            newErrors.date = 'Date is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        const expenseName = formData.name === 'Other' ? formData.customName : formData.name;

        const expenseData: any = {
            name: expenseName,
            amount: parseFloat(formData.amount),
            date: formData.date,
            invoiceFile: formData.invoiceFile || undefined,
            notes: formData.notes || undefined,
        };

        // Add doctor payment specific fields
        if (formData.name === 'Doctor Payment' && formData.doctorId) {
            expenseData.doctorId = formData.doctorId;
            expenseData.expenseType = 'Doctor Payment';
        }

        onSave(expenseData);

        onClose();
    };

    const footer = (
        <div className={styles.modalFooter}>
            <Button variant="secondary" onClick={onClose}>
                Cancel
            </Button>
            <Button variant="primary" onClick={() => handleSubmit({} as React.FormEvent)}>
                {expense ? 'Update' : 'Add'} Expense
            </Button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={expense ? 'Edit Expense' : 'Add New Expense'}
            footer={footer}
        >
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        Expense Category <span className={styles.required}>*</span>
                    </label>
                    <select
                        className={`${styles.select} ${errors.name ? styles.error : ''}`}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    >
                        <option value="">Select category...</option>
                        {EXPENSE_CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                    {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                </div>

                {formData.name === 'Other' && (
                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            Specify Expense Name <span className={styles.required}>*</span>
                        </label>
                        <input
                            type="text"
                            className={`${styles.input} ${errors.customName ? styles.error : ''}`}
                            value={formData.customName}
                            onChange={(e) => setFormData({ ...formData, customName: e.target.value })}
                            placeholder="Enter expense name"
                        />
                        {errors.customName && <span className={styles.errorText}>{errors.customName}</span>}
                    </div>
                )}

                {formData.name === 'Doctor Payment' && (
                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            Select Doctor <span className={styles.required}>*</span>
                        </label>
                        <select
                            className={`${styles.select} ${errors.doctorId ? styles.error : ''}`}
                            value={formData.doctorId}
                            onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                        >
                            <option value="">Select doctor...</option>
                            {dentists.map((doctor) => (
                                <option key={doctor.id} value={doctor.id}>
                                    {doctor.name}
                                </option>
                            ))}
                        </select>
                        {errors.doctorId && <span className={styles.errorText}>{errors.doctorId}</span>}
                    </div>
                )}

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            Amount <span className={styles.required}>*</span>
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            className={`${styles.input} ${errors.amount ? styles.error : ''}`}
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            placeholder="0.00"
                        />
                        {errors.amount && <span className={styles.errorText}>{errors.amount}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            Date <span className={styles.required}>*</span>
                        </label>
                        <input
                            type="date"
                            className={`${styles.input} ${errors.date ? styles.error : ''}`}
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                        {errors.date && <span className={styles.errorText}>{errors.date}</span>}
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Invoice (Optional)</label>
                    <div className={styles.fileUpload}>
                        <input
                            type="file"
                            id="invoice-file"
                            className={styles.fileInput}
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <label htmlFor="invoice-file" className={styles.fileLabel}>
                            <span className={styles.fileIcon}>📎</span>
                            {fileName || 'Choose file...'}
                        </label>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Notes (Optional)</label>
                    <textarea
                        className={styles.textarea}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Add any additional notes..."
                        rows={3}
                    />
                </div>
            </form>
        </Modal>
    );
};

'use client';

import React, { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { useExpenseStore } from '@/store/expenseStore';
import { useSettingsStore } from '@/store/settingsStore';
import { ExpenseModal } from '@/components/expenses/ExpenseModal';
import { Expense } from '@/types';
import styles from './expenses.module.css';

const ITEMS_PER_PAGE = 10;

export default function ExpensesPage() {
    const expenses = useExpenseStore((state) => state.expenses);
    const addExpense = useExpenseStore((state) => state.addExpense);
    const updateExpense = useExpenseStore((state) => state.updateExpense);
    const deleteExpense = useExpenseStore((state) => state.deleteExpense);
    const allUsers = useSettingsStore((state) => state.users);

    // Memoize users to prevent infinite re-renders
    const users = useMemo(() => allUsers, [allUsers]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        name: '',
        startDate: '',
        endDate: '',
    });

    // Filter and sort expenses
    const filteredExpenses = useMemo(() => {
        let filtered = [...expenses];

        // Filter by name
        if (filters.name) {
            filtered = filtered.filter((exp) =>
                exp.name.toLowerCase().includes(filters.name.toLowerCase())
            );
        }

        // Filter by date range
        if (filters.startDate) {
            filtered = filtered.filter((exp) => exp.date >= filters.startDate);
        }
        if (filters.endDate) {
            filtered = filtered.filter((exp) => exp.date <= filters.endDate);
        }

        // Sort by date (newest first)
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return filtered;
    }, [expenses, filters]);

    // Pagination
    const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE);
    const paginatedExpenses = filteredExpenses.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleAddExpense = () => {
        setEditingExpense(null);
        setIsModalOpen(true);
    };

    const handleEditExpense = (expense: Expense) => {
        setEditingExpense(expense);
        setIsModalOpen(true);
    };

    const handleSaveExpense = (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (editingExpense) {
            updateExpense(editingExpense.id, expenseData);
        } else {
            addExpense(expenseData);
        }
        setIsModalOpen(false);
        setEditingExpense(null);
    };

    const handleDeleteExpense = (id: string) => {
        if (confirm('Are you sure you want to delete this expense?')) {
            deleteExpense(id);
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters({ ...filters, [key]: value });
        setCurrentPage(1); // Reset to first page when filtering
    };

    const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    return (
        <MainLayout title="Expenses">
            <div className={styles.header}>
                <div className={styles.headerInfo}>
                    <h1 className={styles.title}>Expense Management</h1>
                    <p className={styles.subtitle}>
                        Track and manage clinic expenses
                    </p>
                </div>
                <Button variant="primary" onClick={handleAddExpense}>
                    + Add Expense
                </Button>
            </div>

            {/* Summary Card */}
            <div className={styles.summaryCard}>
                <div className={styles.summaryItem}>
                    <div className={styles.summaryLabel}>Total Expenses</div>
                    <div className={styles.summaryValue}>${totalExpenses.toFixed(2)}</div>
                </div>
                <div className={styles.summaryItem}>
                    <div className={styles.summaryLabel}>Number of Expenses</div>
                    <div className={styles.summaryValue}>{filteredExpenses.length}</div>
                </div>
            </div>

            {/* Filters */}
            <Card className={styles.filtersCard}>
                <div className={styles.filters}>
                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Filter by Name</label>
                        <input
                            type="text"
                            className={styles.filterInput}
                            placeholder="Search by expense name..."
                            value={filters.name}
                            onChange={(e) => handleFilterChange('name', e.target.value)}
                        />
                    </div>
                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Start Date</label>
                        <input
                            type="date"
                            className={styles.filterInput}
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        />
                    </div>
                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>End Date</label>
                        <input
                            type="date"
                            className={styles.filterInput}
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        />
                    </div>
                    {(filters.name || filters.startDate || filters.endDate) && (
                        <button
                            className={styles.clearFilters}
                            onClick={() => {
                                setFilters({ name: '', startDate: '', endDate: '' });
                                setCurrentPage(1);
                            }}
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </Card>

            {/* Expenses Table */}
            <Card>
                {paginatedExpenses.length > 0 ? (
                    <>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                    <th>Type</th>
                                    <th>Doctor</th>
                                    <th>Invoice</th>
                                    <th>Notes</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedExpenses.map((expense) => (
                                    <tr key={expense.id}>
                                        <td>
                                            <div className={styles.expenseName}>
                                                <span className={styles.nameIcon}>💰</span>
                                                {expense.name}
                                            </div>
                                        </td>
                                        <td className={styles.amount}>
                                            ${expense.amount.toFixed(2)}
                                        </td>
                                        <td>{new Date(expense.date).toLocaleDateString()}</td>
                                        <td>
                                            {expense.expenseType ? (
                                                <Badge variant="info">
                                                    <span className={styles.typeBadge}>
                                                        {expense.expenseType}
                                                    </span>
                                                </Badge>
                                            ) : (
                                                <span style={{ color: '#9ca3af' }}>-</span>
                                            )}
                                        </td>
                                        <td>
                                            {expense.doctorId ? (
                                                <span className={styles.doctorName}>
                                                    {users.find(u => u.id === expense.doctorId)?.name || 'Unknown'}
                                                </span>
                                            ) : (
                                                <span style={{ color: '#9ca3af' }}>-</span>
                                            )}
                                        </td>
                                        <td>
                                            {expense.invoiceFile ? (
                                                <Badge variant="success">
                                                    <span className={styles.invoiceBadge}>
                                                        📎 Attached
                                                    </span>
                                                </Badge>
                                            ) : (
                                                <Badge variant="info">
                                                    <span className={styles.invoiceBadge}>
                                                        No Invoice
                                                    </span>
                                                </Badge>
                                            )}
                                        </td>
                                        <td className={styles.notes}>
                                            {expense.notes || '-'}
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button
                                                    className={styles.actionBtn}
                                                    onClick={() => handleEditExpense(expense)}
                                                    title="Edit"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    className={`${styles.actionBtn} ${styles.delete}`}
                                                    onClick={() => handleDeleteExpense(expense.id)}
                                                    title="Delete"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="3 6 5 6 21 6" />
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className={styles.pagination}>
                                <button
                                    className={styles.pageBtn}
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                                <span className={styles.pageInfo}>
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    className={styles.pageBtn}
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📊</div>
                        <h3 className={styles.emptyTitle}>No expenses found</h3>
                        <p className={styles.emptyText}>
                            {filters.name || filters.startDate || filters.endDate
                                ? 'Try adjusting your filters'
                                : 'Get started by adding your first expense'}
                        </p>
                        {!filters.name && !filters.startDate && !filters.endDate && (
                            <Button variant="primary" onClick={handleAddExpense}>
                                Add Expense
                            </Button>
                        )}
                    </div>
                )}
            </Card>

            <ExpenseModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingExpense(null);
                }}
                onSave={handleSaveExpense}
                expense={editingExpense}
            />
        </MainLayout>
    );
}

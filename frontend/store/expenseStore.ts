import { create } from 'zustand';
import { Expense } from '@/types';
import { dummyExpenses } from '@/data/dummyData';

interface ExpenseStore {
    expenses: Expense[];
    addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateExpense: (id: string, expense: Partial<Expense>) => void;
    deleteExpense: (id: string) => void;
    getExpensesByDateRange: (startDate: string, endDate: string) => Expense[];
    getExpensesByName: (name: string) => Expense[];
    getTotalExpensesByDate: (date: string) => number;
    getExpensesByDoctor: (doctorId: string) => Expense[]; // Get expenses for a specific doctor
    getTotalPaidToDoctor: (doctorId: string) => number; // Get total amount paid to a doctor
}

export const useExpenseStore = create<ExpenseStore>()((set, get) => ({
    expenses: dummyExpenses,

    addExpense: (expenseData) => {
        const newExpense: Expense = {
            ...expenseData,
            id: `exp-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        set((state) => ({ expenses: [...state.expenses, newExpense] }));
    },

    updateExpense: (id, expenseData) => {
        set((state) => ({
            expenses: state.expenses.map((e) =>
                e.id === id ? { ...e, ...expenseData, updatedAt: new Date().toISOString() } : e
            ),
        }));
    },

    deleteExpense: (id) => {
        set((state) => ({
            expenses: state.expenses.filter((e) => e.id !== id),
        }));
    },

    getExpensesByDateRange: (startDate, endDate) => {
        const { expenses } = get();
        return expenses.filter((e) => e.date >= startDate && e.date <= endDate);
    },

    getExpensesByName: (name) => {
        const { expenses } = get();
        if (!name) return expenses;
        return expenses.filter((e) => e.name.toLowerCase().includes(name.toLowerCase()));
    },

    getTotalExpensesByDate: (date) => {
        const { expenses } = get();
        return expenses
            .filter((e) => e.date === date)
            .reduce((total, e) => total + e.amount, 0);
    },

    getExpensesByDoctor: (doctorId) => {
        const { expenses } = get();
        return expenses.filter((e) => e.doctorId === doctorId);
    },

    getTotalPaidToDoctor: (doctorId) => {
        const { expenses } = get();
        return expenses
            .filter((e) => e.doctorId === doctorId && e.expenseType === 'Doctor Payment')
            .reduce((total, e) => total + e.amount, 0);
    },
}));

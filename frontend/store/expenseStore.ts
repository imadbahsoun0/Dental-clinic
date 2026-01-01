import { create } from 'zustand';
import { Expense } from '@/types';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface ExpenseStore {
    expenses: Expense[];
    loading: boolean;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    fetchExpenses: (params?: {
        page?: number;
        limit?: number;
        startDate?: string;
        endDate?: string;
        doctorId?: string;
        expenseType?: string;
    }) => Promise<void>;
    addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
    deleteExpense: (id: string) => Promise<void>;
    processDoctorPayment: (doctorId: string, amount: number, notes: string) => Promise<{ newWalletBalance: number }>;
    getExpensesByDateRange: (startDate: string, endDate: string) => Expense[];
    getExpensesByName: (name: string) => Expense[];
    getTotalExpensesByDate: (date: string) => number;
    getExpensesByDoctor: (doctorId: string) => Expense[];
    getTotalPaidToDoctor: (doctorId: string) => number;
}

export const useExpenseStore = create<ExpenseStore>()((set, get) => ({
    expenses: [],
    loading: false,
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    },

    fetchExpenses: async (params) => {
        set({ loading: true });
        try {
            const response: any = await api.api.expensesControllerFindAll({
                page: params?.page,
                limit: params?.limit,
                startDate: params?.startDate,
                endDate: params?.endDate,
                doctorId: params?.doctorId,
                expenseType: params?.expenseType as any,
            });
            
            if (response.success && response.data) {
                set({
                    expenses: response.data.data as any[],
                    pagination: response.data.meta || get().pagination,
                });
            }
        } catch (error: any) {
            console.error('Failed to fetch expenses:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch expenses');
        } finally {
            set({ loading: false });
        }
    },

    addExpense: async (expenseData) => {
        try {
            const response: any = await api.api.expensesControllerCreate({
                name: expenseData.name,
                amount: expenseData.amount,
                date: expenseData.date,
                expenseType: expenseData.expenseType as any,
                notes: expenseData.notes,
                doctorId: expenseData.doctorId,
            });

            if (response.success) {
                toast.success('Expense added successfully');
                // Refresh expenses list
                await get().fetchExpenses({ page: get().pagination.page });
            }
        } catch (error: any) {
            console.error('Failed to add expense:', error);
            toast.error(error.response?.data?.message || 'Failed to add expense');
            throw error;
        }
    },

    updateExpense: async (id, expenseData) => {
        try {
            const response: any = await api.api.expensesControllerUpdate(id, {
                name: expenseData.name,
                amount: expenseData.amount,
                date: expenseData.date,
                expenseType: expenseData.expenseType as any,
                notes: expenseData.notes,
                doctorId: expenseData.doctorId,
            });

            if (response.success) {
                toast.success('Expense updated successfully');
                // Refresh expenses list
                await get().fetchExpenses({ page: get().pagination.page });
            }
        } catch (error: any) {
            console.error('Failed to update expense:', error);
            toast.error(error.response?.data?.message || 'Failed to update expense');
            throw error;
        }
    },

    deleteExpense: async (id) => {
        try {
            const response: any = await api.api.expensesControllerRemove(id);

            if (response.success) {
                toast.success('Expense deleted successfully');
                // Refresh expenses list
                await get().fetchExpenses({ page: get().pagination.page });
            }
        } catch (error: any) {
            console.error('Failed to delete expense:', error);
            toast.error(error.response?.data?.message || 'Failed to delete expense');
            throw error;
        }
    },

    processDoctorPayment: async (doctorId, amount, notes) => {
        try {
            const response: any = await api.api.expensesControllerProcessDoctorPayment({
                doctorId,
                amount,
                notes,
            });

            if (response.success && response.data) {
                toast.success('Doctor payment processed successfully');
                // Refresh expenses list
                await get().fetchExpenses({ page: get().pagination.page });
                return { newWalletBalance: response.data.newWalletBalance };
            }
            throw new Error('Invalid response');
        } catch (error: any) {
            console.error('Failed to process doctor payment:', error);
            toast.error(error.response?.data?.message || 'Failed to process doctor payment');
            throw error;
        }
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

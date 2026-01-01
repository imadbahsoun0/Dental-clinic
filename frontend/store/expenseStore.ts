import { create } from 'zustand';
import { Expense } from '@/types';
import { api, StandardResponse, CreateExpenseDto, UpdateExpenseDto } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface ExpenseResponse {
    data: Expense[];
    meta: PaginationMeta;
}

interface ExpenseStore {
    expenses: Expense[];
    loading: boolean;
    pagination: PaginationMeta;
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
            const response = await api.api.expensesControllerFindAll({
                page: params?.page,
                limit: params?.limit,
                startDate: params?.startDate,
                endDate: params?.endDate,
                doctorId: params?.doctorId,
                expenseType: params?.expenseType as CreateExpenseDto['expenseType'],
            }) as unknown as StandardResponse;
            
            if (response.success && response.data) {
                const expenseData = response.data as ExpenseResponse;
                set({
                    expenses: expenseData.data,
                    pagination: expenseData.meta,
                });
            }
        } catch (error) {
            console.error('Failed to fetch expenses:', error);
            const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fetch expenses';
            toast.error(errorMessage);
        } finally {
            set({ loading: false });
        }
    },

    addExpense: async (expenseData) => {
        try {
            const createDto: CreateExpenseDto = {
                name: expenseData.name,
                amount: expenseData.amount,
                date: expenseData.date,
                expenseType: expenseData.expenseType as CreateExpenseDto['expenseType'],
                notes: expenseData.notes,
                doctorId: expenseData.doctorId,
            };

            const response = await api.api.expensesControllerCreate(createDto) as unknown as StandardResponse;

            if (response.success) {
                toast.success('Expense added successfully');
                // Refresh expenses list
                await get().fetchExpenses({ page: get().pagination.page });
            }
        } catch (error) {
            console.error('Failed to add expense:', error);
            const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to add expense';
            toast.error(errorMessage);
            throw error;
        }
    },

    updateExpense: async (id, expenseData) => {
        try {
            const updateDto: UpdateExpenseDto = {
                name: expenseData.name,
                amount: expenseData.amount,
                date: expenseData.date,
                expenseType: expenseData.expenseType as CreateExpenseDto['expenseType'],
                notes: expenseData.notes,
                doctorId: expenseData.doctorId,
            };

            const response = await api.api.expensesControllerUpdate(id, updateDto) as unknown as StandardResponse;

            if (response.success) {
                toast.success('Expense updated successfully');
                // Refresh expenses list
                await get().fetchExpenses({ page: get().pagination.page });
            }
        } catch (error) {
            console.error('Failed to update expense:', error);
            const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update expense';
            toast.error(errorMessage);
            throw error;
        }
    },

    deleteExpense: async (id) => {
        try {
            const response = await api.api.expensesControllerRemove(id) as unknown as StandardResponse;

            if (response.success) {
                toast.success('Expense deleted successfully');
                // Refresh expenses list
                await get().fetchExpenses({ page: get().pagination.page });
            }
        } catch (error) {
            console.error('Failed to delete expense:', error);
            const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete expense';
            toast.error(errorMessage);
            throw error;
        }
    },

    processDoctorPayment: async (doctorId, amount, notes) => {
        try {
            const response = await api.api.expensesControllerProcessDoctorPayment({
                doctorId,
                amount,
                notes,
            }) as unknown as StandardResponse;

            if (response.success && response.data) {
                toast.success('Doctor payment processed successfully');
                // Refresh expenses list
                await get().fetchExpenses({ page: get().pagination.page });
                const resultData = response.data as { newWalletBalance: number };
                return { newWalletBalance: resultData.newWalletBalance };
            }
            throw new Error('Invalid response');
        } catch (error) {
            console.error('Failed to process doctor payment:', error);
            const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to process doctor payment';
            toast.error(errorMessage);
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
            .filter((e) => e.doctorId === doctorId && e.expenseType === 'doctor_payment')
            .reduce((total, e) => total + e.amount, 0);
    },
}));

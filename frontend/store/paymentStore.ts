import { create } from 'zustand';
import { Payment } from '@/types';
import { api, PaymentResponseDto, StandardResponse } from '@/lib/api';
import toast from 'react-hot-toast';

interface PaymentStore {
    payments: Payment[];
    loading: boolean;
    addPayment: (paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updatePayment: (id: string, paymentData: Partial<Payment>) => Promise<void>;
    deletePayment: (id: string) => Promise<void>;
    fetchPayments: (patientId?: string) => Promise<void>;
}

type PaymentApiResponse = StandardResponse & { data?: { data: PaymentResponseDto[]; meta: { total: number; page: number; limit: number; totalPages: number } } };
type SinglePaymentResponse = StandardResponse & { data?: PaymentResponseDto };

const transformPaymentFromApi = (p: PaymentResponseDto): Payment => ({
    id: p.id,
    patientId: p.patientId,
    amount: p.amount,
    date: p.date,
    paymentMethod: p.paymentMethod,
    notes: p.notes,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
});

export const usePaymentStore = create<PaymentStore>()((set) => ({
    payments: [],
    loading: false,

    fetchPayments: async (patientId?: string) => {
        try {
            set({ loading: true });
            const response = await api.api.paymentsControllerFindAll({
                ...(patientId && { patientId }),
                page: 1,
                limit: 1000,
            }) as unknown as PaymentApiResponse;

            if (response.data?.data) {
                const payments = response.data.data.map(transformPaymentFromApi);
                set({ payments });
            }
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            console.error('Failed to fetch payments:', error);
            toast.error(err.response?.data?.message || 'Failed to fetch payments');
        } finally {
            set({ loading: false });
        }
    },

    addPayment: async (paymentData) => {
        try {
            set({ loading: true });
            const response = await api.api.paymentsControllerCreate({
                patientId: paymentData.patientId,
                amount: paymentData.amount,
                date: paymentData.date,
                paymentMethod: paymentData.paymentMethod,
                notes: paymentData.notes,
            }) as unknown as SinglePaymentResponse;

            if (response.data) {
                const payment = transformPaymentFromApi(response.data);
                set((state) => ({
                    payments: [...state.payments, payment],
                }));
                toast.success('Payment added successfully');
            }
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            console.error('Failed to add payment:', error);
            toast.error(err.response?.data?.message || 'Failed to add payment');
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    updatePayment: async (id, paymentData) => {
        try {
            set({ loading: true });
            const updatePayload: Partial<{
                amount: number;
                date: string;
                paymentMethod: 'cash' | 'card' | 'transfer' | 'check' | 'other';
                notes: string;
            }> = {};

            if (paymentData.amount !== undefined) updatePayload.amount = paymentData.amount;
            if (paymentData.date) updatePayload.date = paymentData.date;
            if (paymentData.paymentMethod) updatePayload.paymentMethod = paymentData.paymentMethod;
            if (paymentData.notes !== undefined) updatePayload.notes = paymentData.notes;

            const response = await api.api.paymentsControllerUpdate(id, updatePayload) as unknown as SinglePaymentResponse;

            if (response.data) {
                const updatedPayment = transformPaymentFromApi(response.data);
                set((state) => ({
                    payments: state.payments.map((payment) =>
                        payment.id === id ? { ...payment, ...updatedPayment } : payment
                    ),
                }));
                toast.success('Payment updated successfully');
            }
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            console.error('Failed to update payment:', error);
            toast.error(err.response?.data?.message || 'Failed to update payment');
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    deletePayment: async (id) => {
        try {
            set({ loading: true });
            await api.api.paymentsControllerRemove(id);
            set((state) => ({
                payments: state.payments.filter((payment) => payment.id !== id),
            }));
            toast.success('Payment deleted successfully');
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            console.error('Failed to delete payment:', error);
            toast.error(err.response?.data?.message || 'Failed to delete payment');
            throw error;
        } finally {
            set({ loading: false });
        }
    },
}));

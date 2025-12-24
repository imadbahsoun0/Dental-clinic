import { create } from 'zustand';
import { Payment } from '@/types';
import { dummyPayments } from '@/data/dummyPayments';

interface PaymentStore {
    payments: Payment[];
    addPayment: (paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updatePayment: (id: string, paymentData: Partial<Payment>) => void;
    deletePayment: (id: string) => void;
}

export const usePaymentStore = create<PaymentStore>()((set) => ({
    payments: dummyPayments,

    addPayment: (paymentData) => {
        const newPayment: Payment = {
            ...paymentData,
            id: `pay-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        set((state) => ({
            payments: [...state.payments, newPayment],
        }));
    },

    updatePayment: (id, paymentData) => {
        set((state) => ({
            payments: state.payments.map((payment) =>
                payment.id === id
                    ? { ...payment, ...paymentData, updatedAt: new Date().toISOString() }
                    : payment
            ),
        }));
    },

    deletePayment: (id) => {
        set((state) => ({
            payments: state.payments.filter((payment) => payment.id !== id),
        }));
    },
}));

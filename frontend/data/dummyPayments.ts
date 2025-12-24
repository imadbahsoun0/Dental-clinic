import { Payment } from '@/types';

export const dummyPayments: Payment[] = [
    {
        id: 'payment-1',
        patientId: 'pt-001234',
        amount: 500,
        date: '2025-12-15T00:00:00.000Z',
        paymentMethod: 'cash',
        notes: 'Partial payment for root canal',
        createdAt: '2025-12-15T10:00:00.000Z',
        updatedAt: '2025-12-15T10:00:00.000Z',
    },
    {
        id: 'payment-2',
        patientId: 'pt-001234',
        amount: 300,
        date: '2025-12-20T00:00:00.000Z',
        paymentMethod: 'card',
        notes: 'Second installment',
        createdAt: '2025-12-20T14:30:00.000Z',
        updatedAt: '2025-12-20T14:30:00.000Z',
    },
    {
        id: 'payment-3',
        patientId: 'pt-001235',
        amount: 150,
        date: '2025-12-18T00:00:00.000Z',
        paymentMethod: 'transfer',
        createdAt: '2025-12-18T09:15:00.000Z',
        updatedAt: '2025-12-18T09:15:00.000Z',
    },
];

import { create } from 'zustand';
import { Treatment } from '@/types';
import { dummyTreatments } from '@/data/dummyData';

interface TreatmentStore {
    treatments: Treatment[];
    addTreatment: (treatment: Omit<Treatment, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateTreatment: (id: string, treatment: Partial<Treatment>) => void;
    deleteTreatment: (id: string) => void;
    getTreatmentsByPatient: (patientId: string) => Treatment[];
}

export const useTreatmentStore = create<TreatmentStore>()((set, get) => ({
    treatments: dummyTreatments,

    addTreatment: (treatmentData) => {
        const newTreatment: Treatment = {
            ...treatmentData,
            id: `tr-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        set((state) => ({ treatments: [...state.treatments, newTreatment] }));
    },

    updateTreatment: (id, treatmentData) => {
        set((state) => {
            const oldTreatment = state.treatments.find((t) => t.id === id);
            const updatedTreatments = state.treatments.map((t) =>
                t.id === id ? { ...t, ...treatmentData, updatedAt: new Date().toISOString() } : t
            );

            // Check if status changed to 'completed' and update doctor wallet
            if (oldTreatment && treatmentData.status === 'completed' && oldTreatment.status !== 'completed') {
                const treatment = updatedTreatments.find((t) => t.id === id);
                if (treatment?.drName) {
                    // Import settingsStore to update doctor wallet
                    const { useSettingsStore } = require('@/store/settingsStore');
                    const users = useSettingsStore.getState().users;
                    const doctor = users.find((u) => u.name === treatment.drName && u.role === 'dentist');

                    if (doctor && doctor.percentage) {
                        // Calculate commission
                        const commission = treatment.totalPrice * (doctor.percentage / 100);
                        const newWallet = (doctor.wallet || 0) + commission;

                        // Update doctor's wallet
                        useSettingsStore.getState().updateUser(doctor.id, { wallet: newWallet });
                    }
                }
            }

            return { treatments: updatedTreatments };
        });
    },

    deleteTreatment: (id) => {
        set((state) => ({
            treatments: state.treatments.filter((t) => t.id !== id),
        }));
    },

    getTreatmentsByPatient: (patientId) => {
        const { treatments } = get();
        return treatments.filter((t) => t.patientId === patientId);
    },
}));

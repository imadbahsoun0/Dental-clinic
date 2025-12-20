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
        set((state) => ({
            treatments: state.treatments.map((t) =>
                t.id === id ? { ...t, ...treatmentData, updatedAt: new Date().toISOString() } : t
            ),
        }));
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

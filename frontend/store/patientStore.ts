import { create } from 'zustand';
import { Patient } from '@/types';
import { dummyPatients } from '@/data/dummyData';

interface PatientStore {
    patients: Patient[];
    selectedPatient: Patient | null;
    addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updatePatient: (id: string, patient: Partial<Patient>) => void;
    setSelectedPatient: (patient: Patient | null) => void;
    searchPatients: (query: string) => Patient[];
}

export const usePatientStore = create<PatientStore>()((set, get) => ({
    patients: dummyPatients,
    selectedPatient: null,

    addPatient: (patientData) => {
        const newPatient: Patient = {
            ...patientData,
            id: `pt-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        set((state) => ({ patients: [...state.patients, newPatient] }));
    },

    updatePatient: (id, patientData) => {
        set((state) => ({
            patients: state.patients.map((p) =>
                p.id === id ? { ...p, ...patientData, updatedAt: new Date().toISOString() } : p
            ),
        }));
    },

    setSelectedPatient: (patient) => set({ selectedPatient: patient }),

    searchPatients: (query) => {
        const { patients } = get();
        const lowerQuery = query.toLowerCase();
        return patients.filter(
            (p) =>
                p.firstName.toLowerCase().includes(lowerQuery) ||
                p.lastName.toLowerCase().includes(lowerQuery) ||
                p.id.toLowerCase().includes(lowerQuery) ||
                p.mobileNumber.includes(query)
        );
    },
}));

import { create } from 'zustand';
import { Patient } from '@/types';
import { api } from '@/lib/api';

interface PatientStore {
    patients: Patient[];
    loading: boolean;
    error: string | null;
    total: number;
    addPatient: (patient: any) => Promise<void>;
    updatePatient: (id: string, patient: Partial<Patient>) => Promise<void>;
    deletePatient: (id: string) => Promise<void>;
    fetchPatients: (page?: number, limit?: number, search?: string) => Promise<void>;
    fetchPatient: (id: string) => Promise<Patient | null>;
    selectedPatient: Patient | null;
    setSelectedPatient: (patient: Patient | null) => void;
}

export const usePatientStore = create<PatientStore>()((set, get) => ({
    patients: [],
    loading: false,
    error: null,
    total: 0,
    selectedPatient: null,

    fetchPatients: async (page = 1, limit = 10, search = '') => {
        set({ loading: true, error: null });
        try {
            const response = await api.api.patientsControllerFindAll({
                page,
                limit,
                search: search || undefined
            });

            // Handle StandardResponse wrapper with nested data/meta structure
            const responseData: any = response.data || response;
            const patientsList = responseData.data?.data || responseData.data || [];
            const meta = responseData.data?.meta || responseData.meta || { total: patientsList.length };

            set({ patients: patientsList, total: meta.total, loading: false });
        } catch (error) {
            console.error('Failed to fetch patients:', error);
            set({ error: 'Failed to fetch patients', loading: false });
        }
    },

    fetchPatient: async (id) => {
        try {
            const response = await api.api.patientsControllerFindOne(id);
            const responseData: any = response.data || response;
            const patient = responseData.data || responseData;
            return patient;
        } catch (error) {
            console.error(`Failed to fetch patient ${id}:`, error);
            return null;
        }
    },

    addPatient: async (patientData) => {
        set({ loading: true, error: null });
        try {
            const response = await api.api.patientsControllerCreate(patientData);
            const responseData: any = response.data || response;
            const newPatient = responseData.data || responseData;

            set((state) => ({
                patients: [newPatient, ...state.patients],
                total: state.total + 1,
                loading: false
            }));
        } catch (error) {
            console.error('Failed to add patient:', error);
            set({ error: 'Failed to add patient', loading: false });
            throw error;
        }
    },

    updatePatient: async (id, patientData) => {
        try {
            await api.api.patientsControllerUpdate(id, patientData);

            set((state) => ({
                patients: state.patients.map((p) =>
                    p.id === id ? { ...p, ...patientData, updatedAt: new Date().toISOString() } : p
                ),
            }));
        } catch (error) {
            console.error('Failed to update patient:', error);
            throw error;
        }
    },

    deletePatient: async (id) => {
        try {
            await api.api.patientsControllerRemove(id);

            set((state) => ({
                patients: state.patients.filter((p) => p.id !== id),
                total: state.total - 1,
            }));
        } catch (error) {
            console.error('Failed to delete patient:', error);
            throw error;
        }
    },

    setSelectedPatient: (patient) => set({ selectedPatient: patient }),
}));

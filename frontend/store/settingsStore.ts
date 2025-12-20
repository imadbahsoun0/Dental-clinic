import { create } from 'zustand';
import { AppointmentType, MedicalHistoryQuestion } from '@/types';
import { dummyAppointmentTypes, dummyMedicalHistoryQuestions } from '@/data/dummyData';

interface SettingsStore {
    appointmentTypes: AppointmentType[];
    doctorLogo: string | null;
    medicalHistoryQuestions: MedicalHistoryQuestion[];
    addAppointmentType: (type: Omit<AppointmentType, 'id'>) => void;
    updateAppointmentType: (id: string, type: Partial<AppointmentType>) => void;
    deleteAppointmentType: (id: string) => void;
    updateDoctorLogo: (logo: string) => void;
    updateMedicalHistoryQuestions: (questions: MedicalHistoryQuestion[]) => void;
}

export const useSettingsStore = create<SettingsStore>()((set) => ({
    appointmentTypes: dummyAppointmentTypes,
    doctorLogo: null,
    medicalHistoryQuestions: dummyMedicalHistoryQuestions,

    addAppointmentType: (typeData) => {
        const newType: AppointmentType = {
            ...typeData,
            id: `apt-${Date.now()}`,
        };
        set((state) => ({ appointmentTypes: [...state.appointmentTypes, newType] }));
    },

    updateAppointmentType: (id, typeData) => {
        set((state) => ({
            appointmentTypes: state.appointmentTypes.map((t) =>
                t.id === id ? { ...t, ...typeData } : t
            ),
        }));
    },

    deleteAppointmentType: (id) => {
        set((state) => ({
            appointmentTypes: state.appointmentTypes.filter((t) => t.id !== id),
        }));
    },

    updateDoctorLogo: (logo) => set({ doctorLogo: logo }),

    updateMedicalHistoryQuestions: (questions) => set({ medicalHistoryQuestions: questions }),
}));

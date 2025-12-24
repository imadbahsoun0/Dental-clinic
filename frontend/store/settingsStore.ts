import { create } from 'zustand';
import { AppointmentType, MedicalHistoryQuestion, TreatmentCategory, User, ClinicBranding, NotificationSettings } from '@/types';
import { dummyMedicalHistoryQuestions, dummyDoctors, dummyUsers, dummyClinicBranding, dummyNotificationSettings, dummyAppointmentTypes } from '@/data/dummyData';
import { treatmentCategories } from '@/data/categorizedTreatments';

interface SettingsStore {
    // Treatment Types & Categories
    treatmentCategories: TreatmentCategory[];
    appointmentTypes: AppointmentType[];
    addTreatmentCategory: (category: Omit<TreatmentCategory, 'id'>) => void;
    updateTreatmentCategory: (id: string, category: Partial<TreatmentCategory>) => void;
    deleteTreatmentCategory: (id: string) => void;
    addAppointmentType: (type: Omit<AppointmentType, 'id'>) => void;
    updateAppointmentType: (id: string, type: Partial<AppointmentType>) => void;
    deleteAppointmentType: (id: string) => void;

    // Medical History
    doctorLogo: string | null;
    medicalHistoryQuestions: MedicalHistoryQuestion[];
    updateDoctorLogo: (logo: string) => void;
    updateMedicalHistoryQuestions: (questions: MedicalHistoryQuestion[]) => void;
    addMedicalHistoryQuestion: (question: Omit<MedicalHistoryQuestion, 'id'>) => void;
    updateMedicalHistoryQuestion: (id: string, question: Partial<MedicalHistoryQuestion>) => void;
    deleteMedicalHistoryQuestion: (id: string) => void;

    // Users
    users: User[];
    addUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateUser: (id: string, user: Partial<User>) => void;
    deleteUser: (id: string) => void;
    getDentists: () => User[]; // Get all users with role 'dentist'

    // Clinic Branding
    clinicBranding: ClinicBranding;
    updateClinicBranding: (branding: Partial<ClinicBranding>) => void;

    // Notification Settings
    notificationSettings: NotificationSettings;
    updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;

    // Doctors (legacy)
    doctors: string[];
}

export const useSettingsStore = create<SettingsStore>()((set, get) => ({
    // Treatment Types & Categories
    treatmentCategories: treatmentCategories,
    appointmentTypes: dummyAppointmentTypes,

    addTreatmentCategory: (categoryData) => {
        const newCategory: TreatmentCategory = {
            ...categoryData,
            id: `cat-${Date.now()}`,
        };
        set((state) => ({
            treatmentCategories: [...state.treatmentCategories, newCategory]
        }));
    },

    updateTreatmentCategory: (id, categoryData) => {
        set((state) => ({
            treatmentCategories: state.treatmentCategories.map((c) =>
                c.id === id ? { ...c, ...categoryData } : c
            ),
        }));
    },

    deleteTreatmentCategory: (id) => {
        set((state) => ({
            treatmentCategories: state.treatmentCategories.filter((c) => c.id !== id),
            // Also remove all appointment types in this category
            appointmentTypes: state.appointmentTypes.filter((t) => t.categoryId !== id),
        }));
    },

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

    // Medical History
    doctorLogo: null,
    medicalHistoryQuestions: dummyMedicalHistoryQuestions,

    updateDoctorLogo: (logo) => set({ doctorLogo: logo }),

    updateMedicalHistoryQuestions: (questions) => set({ medicalHistoryQuestions: questions }),

    addMedicalHistoryQuestion: (questionData) => {
        const newQuestion: MedicalHistoryQuestion = {
            ...questionData,
            id: `mhq-${Date.now()}`,
        };
        set((state) => ({
            medicalHistoryQuestions: [...state.medicalHistoryQuestions, newQuestion]
        }));
    },

    updateMedicalHistoryQuestion: (id, questionData) => {
        set((state) => ({
            medicalHistoryQuestions: state.medicalHistoryQuestions.map((q) =>
                q.id === id ? { ...q, ...questionData } : q
            ),
        }));
    },

    deleteMedicalHistoryQuestion: (id) => {
        set((state) => ({
            medicalHistoryQuestions: state.medicalHistoryQuestions.filter((q) => q.id !== id),
        }));
    },

    // Users
    users: dummyUsers,

    addUser: (userData) => {
        const newUser: User = {
            ...userData,
            id: `user-${Date.now()}`,
            // Initialize wallet to 0 for dentists
            wallet: userData.role === 'dentist' ? (userData.wallet ?? 0) : undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        set((state) => ({ users: [...state.users, newUser] }));
    },

    updateUser: (id, userData) => {
        set((state) => ({
            users: state.users.map((u) =>
                u.id === id ? { ...u, ...userData, updatedAt: new Date().toISOString() } : u
            ),
        }));
    },

    deleteUser: (id) => {
        set((state) => ({
            users: state.users.filter((u) => u.id !== id),
        }));
    },

    getDentists: () => {
        const { users } = get();
        return users.filter((u) => u.role === 'dentist');
    },

    // Clinic Branding
    clinicBranding: dummyClinicBranding,

    updateClinicBranding: (branding) => {
        set((state) => ({
            clinicBranding: { ...state.clinicBranding, ...branding },
        }));
    },

    // Notification Settings
    notificationSettings: dummyNotificationSettings,

    updateNotificationSettings: (settings) => {
        set((state) => ({
            notificationSettings: { ...state.notificationSettings, ...settings },
        }));
    },

    // Doctors (legacy)
    doctors: dummyDoctors,
}));

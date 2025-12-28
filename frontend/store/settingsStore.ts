import { create } from 'zustand';
import { AppointmentType, MedicalHistoryQuestion, TreatmentCategory, User, ClinicBranding, NotificationSettings } from '@/types';
import { dummyMedicalHistoryQuestions, dummyDoctors, dummyUsers, dummyClinicBranding, dummyNotificationSettings, dummyAppointmentTypes } from '@/data/dummyData';
import { treatmentCategories } from '@/data/categorizedTreatments';
import { api } from '@/lib/api';

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
    fetchUsers: () => Promise<void>;
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
    users: [], // Start empty, fetch on mount

    fetchUsers: async () => {
        try {
            const response = await api.api.usersControllerFindAll({ limit: 100 });
            const result = response.data as any; // Handle Paginated response mismatch
            const usersData = result.data || [];

            // Map to UIUser format (flatten org details)
            // We assume the user belongs to the current org context of the request
            // We pick the organization entry that matches the current context?
            // Actually, the API returns users scoped to the org.
            // But we don't know WHICH orgId from the response easily without checking AuthStore or assuming logic.
            // For now, we take the *first* organization entry as the active one for this view,
            // because `findAll` filters by OrgScope.

            const mappedUsers = usersData.map((u: any) => {
                const orgDetails = u.organizations?.[0] || {};
                return {
                    ...u,
                    role: orgDetails.role,
                    status: orgDetails.status,
                    wallet: orgDetails.wallet,
                    percentage: orgDetails.percentage,
                };
            });

            set({ users: mappedUsers });
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    },

    addUser: async (userData) => {
        try {
            const response = await api.api.usersControllerCreate({
                name: userData.name,
                email: userData.email,
                password: userData.password, // Let backend handle invitation if undefined
                phone: userData.phone,
                role: (userData as any).role,
                percentage: (userData as any).percentage,
            } as any); // Cast to any to avoid TS error if client expects required password
            const newUserRaw = response.data as any;

            // Map response
            const orgDetails = newUserRaw.organizations?.[0] || {};
            const newUser = {
                ...newUserRaw,
                role: orgDetails.role,
                status: orgDetails.status,
                wallet: orgDetails.wallet,
                percentage: orgDetails.percentage,
            };

            set((state) => ({ users: [...state.users, newUser] }));
        } catch (error) {
            console.error('Failed to create user:', error);
            alert('Failed to create user');
        }
    },

    updateUser: async (id, userData) => {
        try {
            // map partial updates
            const updateDto: any = {};
            if (userData.name) updateDto.name = userData.name;
            if (userData.phone) updateDto.phone = userData.phone;
            if ((userData as any).role) updateDto.role = (userData as any).role;
            if ((userData as any).percentage) updateDto.percentage = (userData as any).percentage;
            if ((userData as any).status) updateDto.status = (userData as any).status;

            await api.api.usersControllerUpdate(id, updateDto);

            // Refresh local state optimistically or fetch?
            // Optimistic update
            set((state) => ({
                users: state.users.map((u) =>
                    u.id === id ? { ...u, ...userData } : u
                ),
            }));
        } catch (error) {
            console.error('Failed to update user:', error);
        }
    },

    deleteUser: async (id) => {
        try {
            await api.api.usersControllerRemove(id);
            set((state) => ({
                users: state.users.filter((u) => u.id !== id),
            }));
        } catch (error) {
            console.error('Failed to delete user:', error);
        }
    },

    getDentists: () => {
        const { users } = get();
        // Check role property which we flattened
        return users.filter((u: any) => u.role === 'dentist');
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

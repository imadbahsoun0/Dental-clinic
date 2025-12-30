import { create } from 'zustand';
import { MedicalHistoryQuestion, TreatmentCategory, TreatmentType, User, ClinicBranding, NotificationSettings } from '@/types';
import { dummyMedicalHistoryQuestions, dummyDoctors, dummyNotificationSettings } from '@/data/dummyData';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface SettingsStore {
    // Treatment Types & Categories
    treatmentCategories: TreatmentCategory[];
    fetchTreatmentCategories: () => Promise<void>;
    addTreatmentCategory: (category: Omit<TreatmentCategory, 'id'>) => Promise<void>;
    updateTreatmentCategory: (id: string, category: Partial<TreatmentCategory>) => Promise<void>;
    deleteTreatmentCategory: (id: string) => Promise<void>;

    treatmentTypes: TreatmentType[];
    fetchTreatmentTypes: () => Promise<void>;
    addTreatmentType: (type: Omit<TreatmentType, 'id'>) => Promise<void>;
    updateTreatmentType: (id: string, type: Partial<TreatmentType>) => Promise<void>;
    deleteTreatmentType: (id: string) => Promise<void>;

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
    addUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateUser: (id: string, user: Partial<User>) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;
    getDentists: () => User[]; // Get all users with role 'dentist'

    // Clinic Branding
    clinicBranding: ClinicBranding;
    fetchClinicBranding: () => Promise<void>;
    updateClinicBranding: (branding: Partial<ClinicBranding>) => Promise<void>;
    uploadLogo: (file: File) => Promise<{ id: string; url: string }>;

    // Notification Settings
    notificationSettings: NotificationSettings;
    updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;

    // Doctors (legacy)
    doctors: string[];
}

export const useSettingsStore = create<SettingsStore>()((set, get) => ({
    // Treatment Types & Categories
    treatmentCategories: [],

    fetchTreatmentCategories: async () => {
        try {
            const response = await api.api.treatmentTypesControllerFindAllCategories();
            const result = response as any; // StandardResponse
            if (result.success && result.data) {
                set({ treatmentCategories: result.data });
            }
        } catch (error) {
            console.error('Failed to fetch treatment categories:', error);
            toast.error('Failed to load treatment categories');
        }
    },

    addTreatmentCategory: async (categoryData) => {
        try {
            const response = await api.api.treatmentTypesControllerCreateCategory({
                name: categoryData.name,
                icon: categoryData.icon,
                order: categoryData.order,
            });
            const result = response as any;
            if (result.success && result.data) {
                set((state) => ({
                    treatmentCategories: [...state.treatmentCategories, result.data]
                }));
                toast.success('Category added successfully');
            }
        } catch (error) {
            console.error('Failed to add category:', error);
            toast.error('Failed to add category');
        }
    },

    updateTreatmentCategory: async (id, categoryData) => {
        try {
            const response = await api.api.treatmentTypesControllerUpdateCategory(id, categoryData);
            const result = response as any;
            if (result.success && result.data) {
                set((state) => ({
                    treatmentCategories: state.treatmentCategories.map((c) =>
                        c.id === id ? { ...c, ...result.data } : c
                    ),
                }));
                toast.success('Category updated successfully');
            }
        } catch (error) {
            console.error('Failed to update category:', error);
            toast.error('Failed to update category');
        }
    },

    deleteTreatmentCategory: async (id) => {
        try {
            await api.api.treatmentTypesControllerRemoveCategory(id);
            set((state) => ({
                treatmentCategories: state.treatmentCategories.filter((c) => c.id !== id),
                treatmentTypes: state.treatmentTypes.filter((t) => t.categoryId !== id),
            }));
            toast.success('Category deleted successfully');
        } catch (error) {
            console.error('Failed to delete category:', error);
            toast.error('Failed to delete category');
        }
    },

    treatmentTypes: [],

    fetchTreatmentTypes: async () => {
        try {
            const response = await api.api.treatmentTypesControllerFindAllTypes();
            const result = response as any;
            if (result.success && result.data) {
                set({ treatmentTypes: result.data });
            }
        } catch (error) {
            console.error('Failed to fetch treatment types:', error);
            toast.error('Failed to load treatment types');
        }
    },

    addTreatmentType: async (typeData) => {
        try {
            const response = await api.api.treatmentTypesControllerCreateType({
                name: typeData.name,
                categoryId: typeData.categoryId!,
                priceVariants: typeData.priceVariants.map(pv => ({
                    name: pv.name || pv.label || 'Default',
                    price: pv.price,
                    currency: 'USD',
                    toothNumbers: (pv.toothNumbers || []) as any,
                    isDefault: pv.isDefault || false,
                })),
                duration: typeData.duration,
                color: typeData.color,
            });
            const result = response as any;
            if (result.success && result.data) {
                set((state) => ({
                    treatmentTypes: [...state.treatmentTypes, result.data]
                }));
                toast.success('Treatment type added successfully');
            }
        } catch (error) {
            console.error('Failed to add treatment type:', error);
            toast.error('Failed to add treatment type');
        }
    },

    updateTreatmentType: async (id, typeData) => {
        try {
            const updatePayload: any = { ...typeData };
            if (typeData.priceVariants) {
                updatePayload.priceVariants = typeData.priceVariants.map(pv => ({
                    name: pv.name || pv.label || 'Default',
                    price: pv.price,
                    currency: 'USD',
                    toothNumbers: (pv.toothNumbers || []) as any,
                    isDefault: pv.isDefault || false,
                }));
            }

            const response = await api.api.treatmentTypesControllerUpdateType(id, updatePayload);
            const result = response as any;
            if (result.success && result.data) {
                set((state) => ({
                    treatmentTypes: state.treatmentTypes.map((t) =>
                        t.id === id ? { ...t, ...result.data } : t
                    ),
                }));
                toast.success('Treatment type updated successfully');
            }
        } catch (error) {
            console.error('Failed to update treatment type:', error);
            toast.error('Failed to update treatment type');
        }
    },

    deleteTreatmentType: async (id) => {
        try {
            await api.api.treatmentTypesControllerRemoveType(id);
            set((state) => ({
                treatmentTypes: state.treatmentTypes.filter((t) => t.id !== id),
            }));
            toast.success('Treatment type deleted successfully');
        } catch (error) {
            console.error('Failed to delete treatment type:', error);
            toast.error('Failed to delete treatment type');
        }
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
    users: [],

    fetchUsers: async () => {
        try {
            const response = await api.api.usersControllerFindAll({ limit: 100 });
            const result = response as any;
            const usersData = result.data?.data || result.data || [];

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
                password: userData.password,
                phone: userData.phone,
                role: (userData as any).role,
                percentage: (userData as any).percentage,
            } as any);
            const newUserRaw = response.data as any;

            const orgDetails = newUserRaw.organizations?.[0] || {};
            const newUser = {
                ...newUserRaw,
                role: orgDetails.role,
                status: orgDetails.status,
                wallet: orgDetails.wallet,
                percentage: orgDetails.percentage,
            };

            set((state) => ({ users: [...state.users, newUser] }));
            toast.success('User added successfully');
        } catch (error) {
            console.error('Failed to create user:', error);
            toast.error('Failed to create user');
        }
    },

    updateUser: async (id, userData) => {
        try {
            const updateDto: any = {};
            if (userData.name) updateDto.name = userData.name;
            if (userData.phone) updateDto.phone = userData.phone;
            if ((userData as any).role) updateDto.role = (userData as any).role;
            if ((userData as any).percentage) updateDto.percentage = (userData as any).percentage;
            if ((userData as any).status) updateDto.status = (userData as any).status;

            await api.api.usersControllerUpdate(id, updateDto);

            set((state) => ({
                users: state.users.map((u) =>
                    u.id === id ? { ...u, ...userData } : u
                ),
            }));
            toast.success('User updated successfully');
        } catch (error) {
            console.error('Failed to update user:', error);
            toast.error('Failed to update user');
        }
    },

    deleteUser: async (id) => {
        try {
            await api.api.usersControllerRemove(id);
            set((state) => ({
                users: state.users.filter((u) => u.id !== id),
            }));
            toast.success('User deleted successfully');
        } catch (error) {
            console.error('Failed to delete user:', error);
            toast.error('Failed to delete user');
        }
    },

    getDentists: () => {
        const { users } = get();
        return users.filter((u: any) => u.role === 'dentist');
    },

    // Clinic Branding
    clinicBranding: {
        clinicName: '',
        location: '',
        phone: '',
        email: '',
    },

    fetchClinicBranding: async () => {
        try {
            const response = await api.api.organizationsControllerGetCurrent();
            const result = response as any;
            const org = result.data || result;

            set({
                clinicBranding: {
                    clinicName: org.name || '',
                    location: org.location || '',
                    phone: org.phone || '',
                    email: org.email || '',
                    website: org.website,
                    logo: org.logo?.url || null,
                },
                doctorLogo: org.logo?.url || null,
            });
        } catch (error) {
            console.error('Failed to fetch clinic branding:', error);
        }
    },

    updateClinicBranding: async (branding) => {
        try {
            const updateDto: any = {};
            if (branding.clinicName) updateDto.name = branding.clinicName;
            if (branding.location) updateDto.location = branding.location;
            if (branding.phone) updateDto.phone = branding.phone;
            if (branding.email) updateDto.email = branding.email;
            if (branding.website) updateDto.website = branding.website;
            if ((branding as any).logoId) updateDto.logoId = (branding as any).logoId;

            await api.api.organizationsControllerUpdateCurrent(updateDto);

            set((state) => ({
                clinicBranding: { ...state.clinicBranding, ...branding },
                doctorLogo: branding.logo || state.doctorLogo,
            }));
            toast.success('Branding updated successfully');
        } catch (error) {
            console.error('Failed to update clinic branding:', error);
            toast.error('Failed to update branding');
        }
    },

    uploadLogo: async (file) => {
        try {
            const response = await api.api.filesControllerUploadFile({ file: file as any }) as any;
            const result = response as any;
            const attachment = result.data || result;
            return { id: attachment.id, url: attachment.url };
        } catch (error) {
            console.error('Failed to upload logo:', error);
            throw error;
        }
    },

    // Notification Settings
    notificationSettings: dummyNotificationSettings,

    updateNotificationSettings: (settings) => {
        set((state) => ({
            notificationSettings: { ...state.notificationSettings, ...settings },
        }));
    },

    // Doctors (legacy component reliance)
    doctors: dummyDoctors,
}));

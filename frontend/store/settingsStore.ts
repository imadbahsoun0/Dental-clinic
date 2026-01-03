import { create } from 'zustand';
import { MedicalHistoryQuestion, TreatmentCategory, TreatmentType, User, UserWithRole, ClinicBranding, NotificationSettings } from '@/types';
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
    fetchMedicalHistoryQuestions: () => Promise<void>;
    addMedicalHistoryQuestion: (question: Omit<MedicalHistoryQuestion, 'id'>) => Promise<void>;
    updateMedicalHistoryQuestion: (id: string, question: Partial<MedicalHistoryQuestion>) => Promise<void>;
    deleteMedicalHistoryQuestion: (id: string) => Promise<void>;

    // Users (with flattened role from current org)
    users: UserWithRole[];
    fetchUsers: () => Promise<void>;
    addUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateUser: (id: string, user: Partial<User>) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;
    getDentists: () => UserWithRole[]; // Get all users with role 'dentist'

    // Clinic Branding
    clinicBranding: ClinicBranding;
    fetchClinicBranding: () => Promise<void>;
    updateClinicBranding: (branding: Partial<ClinicBranding>) => Promise<void>;
    uploadLogo: (file: File) => Promise<{ id: string; url: string }>;

    // Notification Settings
    notificationSettings: NotificationSettings;
    fetchNotificationSettings: () => Promise<void>;
    updateNotificationSettings: (settings: Partial<NotificationSettings>) => Promise<void>;

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
    medicalHistoryQuestions: [],

    updateDoctorLogo: (logo) => set({ doctorLogo: logo }),

    updateMedicalHistoryQuestions: (questions) => set({ medicalHistoryQuestions: questions }),

    fetchMedicalHistoryQuestions: async () => {
        try {
            const response = await api.api.medicalHistoryControllerFindAll();
            const result = response as any;
            if (result.success && result.data) {
                set({ medicalHistoryQuestions: result.data });
            }
        } catch (error) {
            console.error('Failed to fetch medical history questions:', error);
            toast.error('Failed to load medical history questions');
        }
    },

    addMedicalHistoryQuestion: async (questionData) => {
        try {
            const response = await api.api.medicalHistoryControllerCreate(questionData as any);
            const result = response as any;
            if (result.success && result.data) {
                set((state) => ({
                    medicalHistoryQuestions: [...state.medicalHistoryQuestions, result.data]
                }));
                toast.success('Question added successfully');
            }
        } catch (error) {
            console.error('Failed to add question:', error);
            toast.error('Failed to add question');
        }
    },

    updateMedicalHistoryQuestion: async (id, questionData) => {
        try {
            const response = await api.api.medicalHistoryControllerUpdate(id, questionData as any);
            const result = response as any;
            if (result.success && result.data) {
                set((state) => ({
                    medicalHistoryQuestions: state.medicalHistoryQuestions.map((q) =>
                        q.id === id ? { ...q, ...result.data } : q
                    ),
                }));
                toast.success('Question updated successfully');
            }
        } catch (error) {
            console.error('Failed to update question:', error);
            toast.error('Failed to update question');
        }
    },

    deleteMedicalHistoryQuestion: async (id) => {
        try {
            await api.api.medicalHistoryControllerRemove(id);
            set((state) => ({
                medicalHistoryQuestions: state.medicalHistoryQuestions.filter((q) => q.id !== id),
            }));
            toast.success('Question deleted successfully');
        } catch (error) {
            console.error('Failed to delete question:', error);
            toast.error('Failed to delete question');
        }
    },

    // Users
    users: [],

    fetchUsers: async () => {
        try {
            const response = await api.api.usersControllerFindAll({ limit: 100 });
            const result = response as unknown as { data?: { data?: User[] } };
            const usersData = result.data?.data || [];

            const mappedUsers: UserWithRole[] = usersData.map((u) => {
                const orgDetails = u.organizations?.[0];
                return {
                    ...u,
                    role: orgDetails?.role,
                    status: orgDetails?.status,
                    wallet: orgDetails?.wallet,
                    percentage: orgDetails?.percentage,
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
        return users.filter((u) => u.role === 'dentist');
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
    notificationSettings: {
        appointmentReminders: [
            { enabled: true, timingInHours: 24 }
        ],
        messageTemplates: {
            medical_history: 'Hello {{patientName}}, please fill out your medical history form: {{medicalHistoryLink}}',
            payment_receipt: 'Hello {{patientName}}, we received your payment of {{amount}}. Remaining balance: {{remainingBalance}}. Thank you!',
            appointment_reminder: 'Hello {{patientName}}, reminder for your appointment on {{appointmentDate}} at {{appointmentTime}} with Dr. {{doctorName}}.',
            follow_up: 'Hello {{patientName}}, this is a reminder for your follow-up: {{followUpReason}}',
            payment_overdue: 'Hello {{patientName}}, you have an outstanding balance of {{amountDue}}. Please contact us to arrange payment.',
        },
    },

    fetchNotificationSettings: async () => {
        try {
            const response = await api.api.notificationSettingsControllerGet();
            const result = response as any;
            if (result.success && result.data) {
                set({ notificationSettings: result.data });
            }
        } catch (error) {
            console.error('Failed to fetch notification settings:', error);
        }
    },

    updateNotificationSettings: async (settings) => {
        try {
            const response = await api.api.notificationSettingsControllerUpdate(settings as any);
            const result = response as any;
            if (result.success && result.data) {
                set({ notificationSettings: result.data });
                toast.success('Notification settings updated successfully');
            }
        } catch (error) {
            console.error('Failed to update notification settings:', error);
            toast.error('Failed to update notification settings');
        }
    },

    // Doctors (legacy component reliance)
    doctors: [],
}));

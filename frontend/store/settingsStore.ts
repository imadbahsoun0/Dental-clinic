import { create } from 'zustand';
import {
    MedicalHistoryQuestion,
    TreatmentCategory,
    TreatmentType,
    UserWithRole,
    ClinicBranding,
    NotificationSettings,
} from '@/types';
import {
    api,
    type CreateUserDto as ApiCreateUserDto,
    type UpdateUserDto as ApiUpdateUserDto,
    type UserResponseDto,
    type UpdateOrganizationDto as ApiUpdateOrganizationDto,
} from '@/lib/api';
import toast from 'react-hot-toast';

// Type helpers for API responses with object types
type LogoAttachment = { id: string; url: string };
type OrganizationWithTypedFields = {
    name: string;
    location?: string;
    phone?: string;
    email?: string;
    website?: string;
    logo?: LogoAttachment;
    defaultDoctorId?: string | null;
};

// Helper to type StandardResponse with specific data type
type TypedResponse<T> = {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
};

type UserRole = 'admin' | 'dentist' | 'secretary';
type UserStatus = 'active' | 'inactive';

const isUserRole = (value: unknown): value is UserRole =>
    value === 'admin' || value === 'dentist' || value === 'secretary';

const isUserStatus = (value: unknown): value is UserStatus =>
    value === 'active' || value === 'inactive';

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

const extractUserArray = (value: unknown): UserResponseDto[] => {
    if (Array.isArray(value)) return value as UserResponseDto[];

    if (isRecord(value)) {
        const level1 = value.data;
        if (Array.isArray(level1)) return level1 as UserResponseDto[];

        if (isRecord(level1)) {
            const level2 = level1.data;
            if (Array.isArray(level2)) return level2 as UserResponseDto[];
        }
    }

    return [];
};

const extractUserObject = (value: unknown): UserResponseDto | null => {
    if (isRecord(value) && typeof value.id === 'string' && typeof value.email === 'string' && typeof value.name === 'string') {
        return value as unknown as UserResponseDto;
    }

    if (isRecord(value)) {
        return extractUserObject(value.data);
    }

    return null;
};

const mapUserResponseToUserWithRole = (user: UserResponseDto): UserWithRole => {
    const mappedOrgs = (user.organizations ?? []).map((org) => ({
        id: org.id,
        userId: user.id,
        orgId: org.orgId,
        role: isUserRole(org.role) ? org.role : 'secretary',
        status: isUserStatus(org.status) ? org.status : 'active',
        wallet: org.wallet,
        percentage: org.percentage,
    }));

    const orgDetails = mappedOrgs[0];

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        organizations: mappedOrgs,
        role: orgDetails?.role,
        status: orgDetails?.status,
        wallet: orgDetails?.wallet,
        percentage: orgDetails?.percentage,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};

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
    addUser: (user: ApiCreateUserDto) => Promise<void>;
    updateUser: (id: string, user: ApiUpdateUserDto) => Promise<void>;
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
            const result = response as TypedResponse<TreatmentCategory[]>;
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
            const result = response as TypedResponse<TreatmentCategory>;
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
            const result = response as TypedResponse<TreatmentCategory>;
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
            const result = response as TypedResponse<TreatmentType[]>;
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
                    toothNumbers: (pv.toothNumbers || []).map(String),
                    isDefault: pv.isDefault || false,
                })),
                duration: typeData.duration,
                color: typeData.color,
            });
            const result = response as TypedResponse<TreatmentType>;
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
            const updatePayload: Record<string, unknown> = { ...typeData };
            if (typeData.priceVariants) {
                updatePayload.priceVariants = typeData.priceVariants.map(pv => ({
                    name: pv.name || pv.label || 'Default',
                    price: pv.price,
                    currency: 'USD',
                    toothNumbers: (pv.toothNumbers || []).map(String),
                    isDefault: pv.isDefault || false,
                }));
            }

            const response = await api.api.treatmentTypesControllerUpdateType(id, updatePayload);
            const result = response as TypedResponse<TreatmentType>;
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
            const result = response as TypedResponse<MedicalHistoryQuestion[]>;
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
            const response = await api.api.medicalHistoryControllerCreate(questionData);
            const result = response as TypedResponse<MedicalHistoryQuestion>;
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
            const response = await api.api.medicalHistoryControllerUpdate(id, questionData);
            const result = response as TypedResponse<MedicalHistoryQuestion>;
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
            const payload: unknown = (response as { data?: unknown }).data;
            const usersData = extractUserArray(payload);
            set({ users: usersData.map(mapUserResponseToUserWithRole) });
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    },

    addUser: async (userData) => {
        try {
            const response = await api.api.usersControllerCreate(userData);
            const payload: unknown = (response as { data?: unknown }).data;
            const createdUser = extractUserObject(payload);
            if (!createdUser) throw new Error('Create user response missing data');

            set((state) => ({
                users: [...state.users, mapUserResponseToUserWithRole(createdUser)],
            }));
            toast.success('User added successfully');
        } catch (error) {
            console.error('Failed to create user:', error);
            toast.error('Failed to create user');
        }
    },

    updateUser: async (id, userData) => {
        try {
            const response = await api.api.usersControllerUpdate(id, userData);
            const payload: unknown = (response as { data?: unknown }).data;
            const updatedUser = extractUserObject(payload);
            if (!updatedUser) throw new Error('Update user response missing data');

            const mapped = mapUserResponseToUserWithRole(updatedUser);
            set((state) => ({
                users: state.users.map((u) => (u.id === id ? { ...u, ...mapped } : u)),
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
            const result = await api.api.organizationsControllerGetCurrent();
            const org = result.data as OrganizationWithTypedFields | undefined;
            if (!org) return;

            set({
                clinicBranding: {
                    clinicName: org.name || '',
                    location: org.location || '',
                    phone: org.phone || '',
                    email: org.email || '',
                    website: org.website,
                    logo: org.logo?.url,
                    logoId: org.logo?.id,
                    defaultDoctorId: org.defaultDoctorId ?? null,
                },
                doctorLogo: org.logo?.url ?? null,
            });
        } catch (error) {
            console.error('Failed to fetch clinic branding:', error);
        }
    },

    updateClinicBranding: async (branding) => {
        try {
            const updateDto: ApiUpdateOrganizationDto = {};
            if (branding.clinicName !== undefined) updateDto.name = branding.clinicName;
            if (branding.location !== undefined) updateDto.location = branding.location;
            if (branding.phone !== undefined) updateDto.phone = branding.phone;
            if (branding.email !== undefined) updateDto.email = branding.email;
            if (branding.website !== undefined) updateDto.website = branding.website;
            if (branding.logoId !== undefined) updateDto.logoId = branding.logoId;

            if (branding.defaultDoctorId !== undefined) {
                updateDto.defaultDoctorId = (branding.defaultDoctorId as unknown) || null;
            }

            const result = await api.api.organizationsControllerUpdateCurrent(updateDto);
            const org = result.data as OrganizationWithTypedFields | undefined;

            // Keep local state consistent with server response
            if (org) {
                set({
                    clinicBranding: {
                        clinicName: org.name || '',
                        location: org.location || '',
                        phone: org.phone || '',
                        email: org.email || '',
                        website: org.website,
                        logo: org.logo?.url,
                        logoId: org.logo?.id,
                        defaultDoctorId: org.defaultDoctorId ?? null,
                    },
                    doctorLogo: org.logo?.url ?? null,
                });
            } else {
                set((state) => ({
                    clinicBranding: { ...state.clinicBranding, ...branding },
                    doctorLogo: branding.logo ?? state.doctorLogo,
                }));
            }

            toast.success('Branding updated successfully');
        } catch (error) {
            console.error('Failed to update clinic branding:', error);
            toast.error('Failed to update branding');
        }
    },

    uploadLogo: async (file) => {
        try {
            const response = await api.api.filesControllerUploadFile({ file }) as unknown;
            const result = response as TypedResponse<LogoAttachment>;
            const attachment = result.data || (response as LogoAttachment);
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
            const result = response as TypedResponse<NotificationSettings>;
            if (result.success && result.data) {
                set({ notificationSettings: result.data });
            }
        } catch (error) {
            console.error('Failed to fetch notification settings:', error);
        }
    },

    updateNotificationSettings: async (settings) => {
        try {
            // Cast to unknown first to bypass strict type checking, as the DTO requires all fields
            const response = await api.api.notificationSettingsControllerUpdate(settings as unknown as Parameters<typeof api.api.notificationSettingsControllerUpdate>[0]);
            const result = response as TypedResponse<NotificationSettings>;
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

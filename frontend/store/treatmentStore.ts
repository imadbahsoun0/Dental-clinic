import { create } from 'zustand';
import { Treatment } from '@/types';
import { api, TreatmentResponseDto, StandardResponse } from '@/lib/api';
import toast from 'react-hot-toast';

interface TreatmentStore {
    treatments: Treatment[];
    loading: boolean;
    addTreatment: (treatment: Omit<Treatment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateTreatment: (id: string, treatment: Partial<Treatment>) => Promise<void>;
    deleteTreatment: (id: string) => Promise<void>;
    getTreatmentsByPatient: (patientId: string) => Promise<void>;
    fetchTreatments: (patientId?: string) => Promise<void>;
}

type TreatmentApiResponse = StandardResponse & { data?: { data: TreatmentResponseDto[]; meta: { total: number; page: number; limit: number; totalPages: number } } };
type SingleTreatmentResponse = StandardResponse & { data?: TreatmentResponseDto };

const transformTreatmentFromApi = (t: TreatmentResponseDto): Treatment => ({
    id: t.id,
    patientId: t.patientId,
    treatmentTypeId: t.treatmentTypeId,
    treatmentType: t.treatmentType as Treatment['treatmentType'],
    toothNumber: t.toothNumbers[0] || 0,
    toothNumbers: t.toothNumbers,
    totalPrice: t.totalPrice,
    amountPaid: 0,
    discount: t.discount,
    date: (t.appointment as { date?: string })?.date || new Date().toISOString(),
    drName: (t.appointment as { doctor?: { name?: string } })?.doctor?.name,
    status: t.status,
    appointmentId: t.appointmentId,
    notes: t.notes,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
});

export const useTreatmentStore = create<TreatmentStore>()((set, get) => ({
    treatments: [],
    loading: false,

    fetchTreatments: async (patientId?: string) => {
        try {
            set({ loading: true });
            const response = await api.api.treatmentsControllerFindAll({
                ...(patientId && { patientId }),
                page: 1,
                limit: 1000,
            }) as unknown as TreatmentApiResponse;

            if (response.data?.data) {
                const treatments = response.data.data.map(transformTreatmentFromApi);
                set({ treatments });
            }
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            console.error('Failed to fetch treatments:', error);
            toast.error(err.response?.data?.message || 'Failed to fetch treatments');
        } finally {
            set({ loading: false });
        }
    },

    getTreatmentsByPatient: async (patientId: string) => {
        await get().fetchTreatments(patientId);
    },

    addTreatment: async (treatmentData) => {
        try {
            set({ loading: true });
            const response = await api.api.treatmentsControllerCreate({
                patientId: treatmentData.patientId,
                treatmentTypeId: treatmentData.treatmentTypeId,
                toothNumbers: treatmentData.toothNumbers || [treatmentData.toothNumber],
                totalPrice: treatmentData.totalPrice,
                discount: treatmentData.discount || 0,
                status: treatmentData.status || 'planned',
                appointmentId: treatmentData.appointmentId,
                notes: treatmentData.notes,
            }) as unknown as SingleTreatmentResponse;

            if (response.data) {
                const treatment = transformTreatmentFromApi(response.data);
                set((state) => ({ treatments: [...state.treatments, treatment] }));
                toast.success('Treatment added successfully');
            }
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            console.error('Failed to add treatment:', error);
            toast.error(err.response?.data?.message || 'Failed to add treatment');
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    updateTreatment: async (id, treatmentData) => {
        try {
            set({ loading: true });
            const updatePayload: Partial<{
                treatmentTypeId: string;
                toothNumbers: number[];
                totalPrice: number;
                discount: number;
                status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
                appointmentId: string;
                notes: string;
            }> = {};

            if (treatmentData.treatmentTypeId) updatePayload.treatmentTypeId = treatmentData.treatmentTypeId;
            if (treatmentData.toothNumbers) updatePayload.toothNumbers = treatmentData.toothNumbers;
            if (treatmentData.totalPrice !== undefined) updatePayload.totalPrice = treatmentData.totalPrice;
            if (treatmentData.discount !== undefined) updatePayload.discount = treatmentData.discount;
            if (treatmentData.status) updatePayload.status = treatmentData.status;
            if (treatmentData.appointmentId) updatePayload.appointmentId = treatmentData.appointmentId;
            if (treatmentData.notes !== undefined) updatePayload.notes = treatmentData.notes;

            const response = await api.api.treatmentsControllerUpdate(id, updatePayload) as unknown as SingleTreatmentResponse;

            if (response.data) {
                const updatedTreatment = transformTreatmentFromApi(response.data);
                set((state) => ({
                    treatments: state.treatments.map((t) =>
                        t.id === id ? { ...t, ...updatedTreatment } : t
                    ),
                }));
                toast.success('Treatment updated successfully');
            }
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            console.error('Failed to update treatment:', error);
            toast.error(err.response?.data?.message || 'Failed to update treatment');
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    deleteTreatment: async (id) => {
        try {
            set({ loading: true });
            await api.api.treatmentsControllerRemove(id);
            set((state) => ({
                treatments: state.treatments.filter((t) => t.id !== id),
            }));
            toast.success('Treatment deleted successfully');
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            console.error('Failed to delete treatment:', error);
            toast.error(err.response?.data?.message || 'Failed to delete treatment');
            throw error;
        } finally {
            set({ loading: false });
        }
    },
}));

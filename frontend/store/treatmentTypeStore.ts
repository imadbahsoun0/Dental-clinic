import { create } from 'zustand';
import { api } from '@/lib/api';

export interface TreatmentType {
    id: string;
    name: string;
    duration: number;
    color: string;
    priceVariants: {
        name: string;
        price: number;
        currency?: string;
    }[];
}

interface TreatmentTypeStore {
    treatmentTypes: TreatmentType[];
    loading: boolean;
    error: string | null;
    fetchTreatmentTypes: () => Promise<void>;
}

export const useTreatmentTypeStore = create<TreatmentTypeStore>()((set) => ({
    treatmentTypes: [], // Initialize empty
    loading: false,
    error: null,

    fetchTreatmentTypes: async () => {
        set({ loading: true, error: null });
        try {
            // This API call might fail if the module isn't implemented yet (Prompt 10)
            // But we prepare the structure.
            // For now, let's use some dummy data if API fails or if endpoint doesn't exist
            // Actually, let's try to fetch. If 404, we can set empty or dummy.

            // TEMPORARY DUMMY DATA until Prompt 10 implementation
            const dummyTypes: TreatmentType[] = [
                { id: 'uuid-1', name: 'Consultation', duration: 30, color: '#3b82f6', priceVariants: [{ name: 'Standard', price: 50 }] },
                { id: 'uuid-2', name: 'Cleaning', duration: 60, color: '#10b981', priceVariants: [{ name: 'Standard', price: 100 }] },
                { id: 'uuid-3', name: 'Root Canal', duration: 90, color: '#ef4444', priceVariants: [{ name: 'Standard', price: 500 }] },
            ];

            set({ treatmentTypes: dummyTypes, loading: false });

            // Uncomment when API is ready
            /*
             const response = await api.api.treatmentTypesControllerFindAll();
             const responseData: any = response.data || response;
             const data = responseData.data || responseData || [];
             set({ treatmentTypes: data, loading: false });
            */
        } catch (error) {
            console.error('Failed to fetch treatment types:', error);
            set({ error: 'Failed to fetch treatment types', loading: false });
        }
    },
}));

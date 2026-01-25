import { create } from 'zustand';
import { Appointment } from '@/types';
import { api } from '@/lib/api';
import { normalizeDate, formatLocalDate } from '@/utils/dateUtils';

interface AppointmentStore {
    appointments: Appointment[];
    selectedAppointment: Appointment | null;
    loading: boolean;
    error: string | null;
    total: number;
    todayCount: number;
    fetchAppointments: (page?: number, limit?: number, date?: string, startDate?: string, endDate?: string, patientId?: string) => Promise<void>;
    fetchTodayStats: () => Promise<void>;
    fetchAppointmentsByDate: (date: string) => Promise<Appointment[]>;
    addAppointment: (appointment: { patientId: string; treatmentTypeId?: string; date: string; time: string; doctorId: string; notes?: string }) => Promise<void>;
    updateAppointment: (id: string, appointment: Partial<Appointment>) => Promise<void>;
    deleteAppointment: (id: string) => Promise<void>;
    getAppointmentsByDate: (date: string) => Appointment[];
    setSelectedAppointment: (appointment: Appointment | null) => void;
}

export const useAppointmentStore = create<AppointmentStore>()((set, get) => ({
    appointments: [],
    todayCount: 0,
    selectedAppointment: null,
    loading: false,
    error: null,
    total: 0,

    fetchTodayStats: async () => {
        try {
            const response = await api.api.appointmentsControllerGetTodayStats();
            // @ts-ignore
            const data = response.data?.data || response.data || response;
            set({ todayCount: data.count || 0 });
        } catch (error) {
            console.error('Failed to fetch today stats:', error);
        }
    },

    fetchAppointments: async (page = 1, limit = 100, date?: string, startDate?: string, endDate?: string, patientId?: string) => {
        set({ loading: true, error: null });
        try {
            const params: any = { page, limit };
            if (date) params.date = date;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            if (patientId) params.patientId = patientId;

            const response = await api.api.appointmentsControllerFindAll(params);

            const responseData = response.data || response;
            const rawAppointments = (responseData as { data?: { data?: any[] } }).data?.data ||
                (responseData as { data?: any[] }).data || [];

            const appointmentsList = rawAppointments.map((apt: any) => ({
                ...apt,
                date: normalizeDate(apt.date)
            }));

            const meta = (responseData as { data?: { meta?: { total: number } } }).data?.meta ||
                (responseData as { meta?: { total: number } }).meta ||
                { total: appointmentsList.length };

            // If we fetched specifically for today (exact date match), we can update the count too
            if (date && date === formatLocalDate(new Date())) {
                set({ appointments: appointmentsList, total: meta.total, loading: false, todayCount: meta.total });
            } else {
                set({ appointments: appointmentsList, total: meta.total, loading: false });
            }
        } catch (error) {
            console.error('Failed to fetch appointments:', error);
            set({ error: 'Failed to fetch appointments', loading: false });
        }
    },

    fetchAppointmentsByDate: async (date: string) => {
        try {
            const response = await api.api.appointmentsControllerFindByDate(date);
            const responseData = response.data || response;
            const rawAppointments = (responseData as { data?: Appointment[] }).data ||
                (responseData as Appointment[]) || [];

            const appointments = rawAppointments.map((apt) => ({
                ...apt,
                date: normalizeDate(apt.date),
            }));

            // Update the store with these appointments
            set({ appointments });
            return appointments;
        } catch (error) {
            console.error(`Failed to fetch appointments for ${date}:`, error);
            return [];
        }
    },

    addAppointment: async (appointmentData) => {
        set({ loading: true, error: null });
        try {
            const response = await api.api.appointmentsControllerCreate(appointmentData as any);
            const responseData = response.data || response;
            let newAppointment = (responseData as { data?: any }).data ||
                (responseData as any);

            newAppointment = {
                ...newAppointment,
                date: normalizeDate(newAppointment.date)
            };

            set((state) => ({
                appointments: [newAppointment, ...state.appointments],
                total: state.total + 1,
                loading: false,
            }));
            
            // Refresh today's count
            get().fetchTodayStats();
        } catch (error) {
            console.error('Failed to add appointment:', error);
            set({ error: 'Failed to add appointment', loading: false });
            throw error;
        }
    },

    updateAppointment: async (id, appointmentData) => {
        try {
            await api.api.appointmentsControllerUpdate(id, appointmentData);

            set((state) => ({
                appointments: state.appointments.map((a) =>
                    a.id === id ? { ...a, ...appointmentData, updatedAt: new Date().toISOString() } : a
                ),
            }));
            
            // Refresh today's count in case the date changed
            get().fetchTodayStats();
        } catch (error) {
            console.error('Failed to update appointment:', error);
            throw error;
        }
    },

    deleteAppointment: async (id) => {
        try {
            await api.api.appointmentsControllerRemove(id);

            set((state) => ({
                appointments: state.appointments.filter((a) => a.id !== id),
                total: state.total - 1,
            }));
            
            // Refresh today's count
            get().fetchTodayStats();
        } catch (error) {
            console.error('Failed to delete appointment:', error);
            throw error;
        }
    },

    getAppointmentsByDate: (date) => {
        const { appointments } = get();
        return appointments.filter((a) => a.date === date);
    },

    setSelectedAppointment: (appointment) => set({ selectedAppointment: appointment }),
}));

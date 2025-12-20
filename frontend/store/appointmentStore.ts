import { create } from 'zustand';
import { Appointment } from '@/types';
import { dummyAppointments } from '@/data/dummyData';

interface AppointmentStore {
    appointments: Appointment[];
    selectedAppointment: Appointment | null;
    addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateAppointment: (id: string, appointment: Partial<Appointment>) => void;
    deleteAppointment: (id: string) => void;
    getAppointmentsByDate: (date: string) => Appointment[];
    setSelectedAppointment: (appointment: Appointment | null) => void;
}

export const useAppointmentStore = create<AppointmentStore>()((set, get) => ({
    appointments: dummyAppointments,
    selectedAppointment: null,

    addAppointment: (appointmentData) => {
        const newAppointment: Appointment = {
            ...appointmentData,
            id: `app-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        set((state) => ({ appointments: [...state.appointments, newAppointment] }));
    },

    updateAppointment: (id, appointmentData) => {
        set((state) => ({
            appointments: state.appointments.map((a) =>
                a.id === id ? { ...a, ...appointmentData, updatedAt: new Date().toISOString() } : a
            ),
        }));
    },

    deleteAppointment: (id) => {
        set((state) => ({
            appointments: state.appointments.filter((a) => a.id !== id),
        }));
    },

    getAppointmentsByDate: (date) => {
        const { appointments } = get();
        return appointments.filter((a) => a.date === date);
    },

    setSelectedAppointment: (appointment) => set({ selectedAppointment: appointment }),
}));


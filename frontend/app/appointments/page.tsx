'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { AppointmentModal } from '@/components/appointments/AppointmentModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Calendar } from '@/components/appointments/Calendar';
import { AppointmentsHeader } from '@/components/appointments/AppointmentsHeader';
import { useAppointmentStore } from '@/store/appointmentStore';
import { usePatientStore } from '@/store/patientStore';
import { useTreatmentTypeStore } from '@/store/treatmentTypeStore';
import { useSettingsStore } from '@/store/settingsStore';
import toast from 'react-hot-toast';
import { formatLocalDate } from '@/utils/dateUtils';
import { useRouter } from 'next/navigation';
import type { UserWithRole } from '@/types';


export default function AppointmentsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [currentMonth, setCurrentMonth] = useState<Date | null>(null);
    const [today, setToday] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState<string>(''); // Filter by doctor ID

    const [calendarView, setCalendarView] = useState<'month' | 'day'>('month');
    const [calendarDate, setCalendarDate] = useState<string>('');

    // Appointment Store
    const appointments = useAppointmentStore((state) => state.appointments);
    const fetchAppointments = useAppointmentStore((state) => state.fetchAppointments);
    const fetchAppointmentsByDate = useAppointmentStore((state) => state.fetchAppointmentsByDate);
    const deleteAppointment = useAppointmentStore((state) => state.deleteAppointment);

    // Other Stores
    const patients = usePatientStore((state) => state.patients);
    const fetchPatients = usePatientStore((state) => state.fetchPatients);

    const treatmentTypes = useTreatmentTypeStore((state) => state.treatmentTypes);
    const fetchTreatmentTypes = useTreatmentTypeStore((state) => state.fetchTreatmentTypes);

    const users = useSettingsStore((state) => state.users);
    const fetchUsers = useSettingsStore((state) => state.fetchUsers);

    // Delete Confirmation
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);

    // Router
    const router = useRouter();

    const parseLocalDate = (dateStr: string): Date => new Date(`${dateStr}T00:00:00`);

    const shiftDay = (dateStr: string, deltaDays: number): string => {
        const d = parseLocalDate(dateStr);
        d.setDate(d.getDate() + deltaDays);
        return formatLocalDate(d);
    };

    // Fetch appointments based on current view
    useEffect(() => {
        if (!currentMonth) return;

        if (calendarView === 'day') {
            const dateToLoad = calendarDate || today;
            if (dateToLoad) {
                fetchAppointmentsByDate(dateToLoad);
            }
            return;
        }

        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        // Calculate visible range for the calendar grid
        const firstDayOfMonth = new Date(year, month, 1);

        // Determine start of grid (Sunday of the first week)
        const startDayOfWeek = firstDayOfMonth.getDay();
        const startDate = new Date(firstDayOfMonth);
        startDate.setDate(startDate.getDate() - startDayOfWeek);

        // Determine end of grid (6 weeks = 42 days total)
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 41);

        const startStr = formatLocalDate(startDate);
        const endStr = formatLocalDate(endDate);

        fetchAppointments(1, 1000, undefined, startStr, endStr);
    }, [currentMonth, calendarView, calendarDate, today, fetchAppointments, fetchAppointmentsByDate]);

    // Initial fetch for other data
    useEffect(() => {
        const now = new Date();
        setCurrentMonth(now);
        const todayStr = formatLocalDate(now);
        setToday(todayStr);
        setCalendarDate(todayStr);

        fetchPatients(1, 1000);
        fetchTreatmentTypes();
        fetchUsers();
    }, [fetchPatients, fetchTreatmentTypes, fetchUsers]);

    const handleCalendarDayClick = (date: string) => {
        setCalendarDate(date);

        if (calendarView === 'month') {
            setCalendarView('day');
            setCurrentMonth(parseLocalDate(date));
            return;
        }

        setSelectedDate(date);
        setEditingAppointmentId(null);
        setIsModalOpen(true);
    };

    const handleAppointmentClick = (appointmentId: string) => {
        setEditingAppointmentId(appointmentId);
        setIsModalOpen(true);
    };

    const handleCalendarAppointmentClick = (appointmentId: string) => {
        handleAppointmentClick(appointmentId);
    };

    const previousDay = () => {
        const base = calendarDate || today;
        if (!base) return;
        const next = shiftDay(base, -1);
        setCalendarDate(next);
        setCurrentMonth(parseLocalDate(next));
    };

    const nextDay = () => {
        const base = calendarDate || today;
        if (!base) return;
        const next = shiftDay(base, 1);
        setCalendarDate(next);
        setCurrentMonth(parseLocalDate(next));
    };

    const handleDeleteClick = (appointmentId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingAppointmentId(appointmentId);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (editingAppointmentId) {
            try {
                await deleteAppointment(editingAppointmentId);
                toast.success('Appointment deleted successfully');
            } catch (error) {
                toast.error('Failed to delete appointment');
            }
            setDeleteConfirmOpen(false);
            setEditingAppointmentId(null);
        }
    };

    const previousMonth = () => {
        if (currentMonth) {
            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
        }
    };

    const nextMonth = () => {
        if (currentMonth) {
            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
        }
    };

    // Generate calendar days
    const getDaysInMonth = () => {
        if (!currentMonth) return [];

        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const startDayOfWeek = firstDayOfMonth.getDay();

        const startDate = new Date(firstDayOfMonth);
        startDate.setDate(startDate.getDate() - startDayOfWeek);

        const days = [];

        // Generate 42 days (6 weeks) to cover the calendar grid
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);

            days.push({
                date: currentDate.getDate(),
                fullDate: formatLocalDate(currentDate),
                isCurrentMonth: currentDate.getMonth() === month
            });
        }

        return days;
    };

    const monthName = currentMonth ? currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';
    const dentists = (users as UserWithRole[]).filter((u) => u.role === 'dentist' || u.role === 'admin');

    if (!currentMonth) {
        return (
            <MainLayout title="Appointments">
                <Card>
                    <div style={{ padding: '40px', textAlign: 'center' }}>Loading calendar...</div>
                </Card>
            </MainLayout>
        );
    }

    return (
        <MainLayout title="Appointments">
            <Card>
                <AppointmentsHeader
                    monthName={monthName}
                    calendarView={calendarView}
                    setCalendarView={(view) => {
                        setCalendarView(view);
                        if (view === 'day' && !calendarDate) {
                            setCalendarDate(today);
                        }
                        if (view === 'month' && calendarDate) {
                            setCurrentMonth(parseLocalDate(calendarDate));
                        }
                    }}
                    activeDate={calendarDate || today}
                    previousDay={previousDay}
                    nextDay={nextDay}
                    selectedDoctor={selectedDoctor}
                    setSelectedDoctor={setSelectedDoctor}
                    dentists={dentists}
                    onNewAppointment={() => {
                        setEditingAppointmentId(null);
                        const defaultForNew = calendarView === 'day' ? (calendarDate || today) : today;
                        setSelectedDate(defaultForNew);
                        setCalendarDate(defaultForNew);
                        setIsModalOpen(true);
                    }}
                    previousMonth={previousMonth}
                    nextMonth={nextMonth}
                />

                <Calendar
                    days={getDaysInMonth()}
                    appointments={appointments}
                    patients={patients}
                    selectedDoctor={selectedDoctor}
                    today={today}
                    calendarView={calendarView}
                    activeDate={calendarDate || today}
                    onDayClick={handleCalendarDayClick}
                    onAppointmentClick={handleCalendarAppointmentClick}
                />
            </Card>

            <AppointmentModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingAppointmentId(null);
                    // Refresh data for current view
                    if (currentMonth) {
                        const year = currentMonth.getFullYear();
                        const month = currentMonth.getMonth();
                        const first = new Date(year, month, 1);
                        const startDay = first.getDay();
                        const startDate = new Date(first);
                        startDate.setDate(startDate.getDate() - startDay);
                        const endDate = new Date(startDate);
                        endDate.setDate(endDate.getDate() + 41);
                        fetchAppointments(1, 1000, undefined, formatLocalDate(startDate), formatLocalDate(endDate));
                    } else {
                        fetchAppointments(1, 1000);
                    }
                }}
                appointmentId={editingAppointmentId}
                defaultDate={selectedDate}
            />

            <ConfirmDialog
                isOpen={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Appointment"
                message="Are you sure you want to delete this appointment? This action cannot be undone."
                confirmText="Delete"
                isDestructive={true}
            />
        </MainLayout>
    );
}


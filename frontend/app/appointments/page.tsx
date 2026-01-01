'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { AppointmentModal } from '@/components/appointments/AppointmentModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useAppointmentStore } from '@/store/appointmentStore';
import { usePatientStore } from '@/store/patientStore';
import { useTreatmentTypeStore } from '@/store/treatmentTypeStore';
import { useSettingsStore } from '@/store/settingsStore';
import styles from './appointments.module.css';
import toast from 'react-hot-toast';
import { formatLocalDate } from '@/utils/dateUtils';
import { useRouter } from 'next/navigation';


export default function AppointmentsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [currentMonth, setCurrentMonth] = useState<Date | null>(null);
    const [today, setToday] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState<string>(''); // Filter by doctor ID
    const [showTodayList, setShowTodayList] = useState(false);

    // Appointment Store
    const appointments = useAppointmentStore((state) => state.appointments);
    const fetchAppointments = useAppointmentStore((state) => state.fetchAppointments);
    const deleteAppointment = useAppointmentStore((state) => state.deleteAppointment);

    // Other Stores
    const patients = usePatientStore((state) => state.patients);
    const fetchPatients = usePatientStore((state) => state.fetchPatients);

    const treatmentTypes = useTreatmentTypeStore((state) => state.treatmentTypes);
    const fetchTreatmentTypes = useTreatmentTypeStore((state) => state.fetchTreatmentTypes);

    const users = useSettingsStore((state: any) => state.users);
    const fetchUsers = useSettingsStore((state: any) => state.fetchUsers);

    // Delete Confirmation
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);

    // Router
    const router = useRouter();
    // Initialize dates and fetch data
    useEffect(() => {
        if (!currentMonth) return;

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

        // Fetch appointments for the calculated range
        fetchAppointments(1, 1000, undefined, startStr, endStr);
    }, [currentMonth, fetchAppointments]);

    // Initial fetch for other data
    useEffect(() => {
        const now = new Date();
        setCurrentMonth(now);
        setToday(formatLocalDate(now));

        fetchPatients(1, 1000);
        fetchTreatmentTypes();
        fetchUsers();
    }, [fetchPatients, fetchTreatmentTypes, fetchUsers]);

    const handleDayClick = (date: string) => {
        setSelectedDate(date);
        setEditingAppointmentId(null);
        setIsModalOpen(true);
    };

    const handleAppointmentClick = (appointmentId: string) => {
        setEditingAppointmentId(appointmentId);
        setIsModalOpen(true);
    };

    const goToToday = () => {
        setCurrentMonth(new Date());
        setShowTodayList(!showTodayList);
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
    const dentists = users.filter((u: any) => u.role === 'dentist');

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
                <div className={styles.calendarHeader}>
                    <div className={styles.calendarNav}>
                        <button className={styles.calendarNavBtn} onClick={previousMonth}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                        <h2 className={styles.calendarMonth}>{monthName}</h2>
                        <button className={styles.calendarNavBtn} onClick={nextMonth}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Doctor Filter Buttons */}
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <Button
                                variant={selectedDoctor === '' ? 'primary' : 'secondary'}
                                onClick={() => setSelectedDoctor('')}
                                size="sm"
                            >
                                All
                            </Button>
                            {dentists.map((doctor: any) => (
                                <Button
                                    key={doctor.id}
                                    variant={selectedDoctor === doctor.id ? 'primary' : 'secondary'}
                                    onClick={() => setSelectedDoctor(doctor.id)}
                                    size="sm"
                                >
                                    {doctor.name}
                                </Button>
                            ))}
                        </div>
                        <div style={{ width: '1px', height: '24px', backgroundColor: '#e5e7eb' }} />
                        <Button variant="secondary" onClick={goToToday}>Today</Button>
                        <Button onClick={() => {
                            setEditingAppointmentId(null);
                            setSelectedDate(today);
                            setIsModalOpen(true);
                        }}>+ New Appointment</Button>
                    </div>
                </div>

                {/* Today's Appointments List */}
                {showTodayList && (
                    <div style={{
                        marginTop: '20px',
                        padding: '20px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                                Today's Appointments ({appointments.filter(apt => apt.date === today).length})
                            </h3>
                            <button
                                onClick={() => setShowTodayList(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '20px',
                                    color: '#6b7280'
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {appointments
                                .filter(apt => apt.date === today && (!selectedDoctor || apt.doctor?.id === selectedDoctor))
                                .sort((a, b) => a.time.localeCompare(b.time))
                                .map((apt) => {
                                    const patient = patients.find(p => p.id === apt.patient?.id || p.id === (apt.patient as any));
                                    const treatmentType = treatmentTypes.find((t: any) => t.id === apt.treatmentType?.id || t.id === (apt.treatmentType as any));

                                    return (
                                        <div
                                            key={apt.id}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '12px 16px',
                                                backgroundColor: 'white',
                                                borderRadius: '6px',
                                                border: '1px solid #e5e7eb'
                                            }}
                                        >
                                            <div
                                                style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, cursor: 'pointer' }}
                                                onClick={() => handleAppointmentClick(apt.id)}
                                            >
                                                <div style={{
                                                    fontWeight: '600',
                                                    fontSize: '16px',
                                                    minWidth: '60px',
                                                    color: treatmentType?.color || '#3b82f6'
                                                }}>
                                                    {apt.time}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: '500', fontSize: '15px' }}>
                                                        {patient ? `${patient.firstName} ${patient.lastName}` : 'Loading...'}
                                                    </div>
                                                    <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
                                                        {treatmentType?.name || 'Unknown Type'}
                                                    </div>
                                                </div>
                                                <div style={{
                                                    fontSize: '14px',
                                                    color: '#6b7280',
                                                    fontWeight: '500'
                                                }}>
                                                    {apt.doctor?.name || 'No Doctor Assigned'}
                                                </div>
                                                <div style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: '500',
                                                    backgroundColor: apt.status === 'confirmed' ? '#d1fae5' : apt.status === 'pending' ? '#fef3c7' : '#fee2e2',
                                                    color: apt.status === 'confirmed' ? '#065f46' : apt.status === 'pending' ? '#92400e' : '#991b1b'
                                                }}>
                                                    {apt.status ? (apt.status.charAt(0).toUpperCase() + apt.status.slice(1)) : 'Pending'}
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (patient) {
                                                        router.push(`/treatments/${patient.id}`);
                                                    }
                                                }}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: '8px',
                                                    marginLeft: '12px',
                                                    color: '#3b82f6',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderRadius: '4px',
                                                    transition: 'background-color 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                title="View Patient Profile"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                    <circle cx="12" cy="7" r="4" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteClick(apt.id, e)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: '8px',
                                                    marginLeft: '4px',
                                                    color: '#ef4444',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderRadius: '4px',
                                                    transition: 'background-color 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                title="Delete Appointment"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                                                </svg>
                                            </button>
                                        </div>
                                    );
                                })}
                            {appointments.filter(apt => apt.date === today && (!selectedDoctor || apt.doctor?.id === selectedDoctor)).length === 0 && (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px',
                                    color: '#6b7280',
                                    fontSize: '14px'
                                }}>
                                    No appointments scheduled for today
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className={styles.calendarGrid}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className={styles.calendarDayHeader}>{day}</div>
                    ))}
                    {getDaysInMonth().map((day: any, index) => {
                        const dateStr = day.fullDate;
                        const dayAppointments = appointments.filter((apt) => {
                            const matchesDate = apt.date === dateStr;
                            const matchesDoctor = !selectedDoctor || apt.doctor?.id === selectedDoctor;
                            return matchesDate && matchesDoctor;
                        });
                        const isToday = dateStr === today;

                        return (
                            <div
                                key={index}
                                className={`${styles.calendarDay} ${!day.isCurrentMonth ? styles.otherMonth : ''} ${isToday ? styles.today : ''}`}
                                onClick={() => handleDayClick(dateStr)}
                            >
                                <div className={styles.calendarDayNumber}>{day.date}</div>
                                {dayAppointments.slice(0, 3).map((apt) => {
                                    const treatmentType = treatmentTypes.find((t: any) => t.id === apt.treatmentType?.id || t.id === (apt.treatmentType as any));
                                    return (
                                        <div
                                            key={apt.id}
                                            className={styles.calendarEvent}
                                            style={{ backgroundColor: (treatmentType?.color || '#3b82f6') + '20', color: treatmentType?.color || '#3b82f6', cursor: 'pointer' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAppointmentClick(apt.id);
                                            }}
                                        >
                                            {apt.time}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
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


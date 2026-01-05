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
    
    // Default to list view on mobile
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth <= 768 ? 'list' : 'calendar';
        }
        return 'calendar';
    });

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
                    <div className={styles.headerActions}>
                        {/* View Toggle (Mobile Only) */}
                        <div className={styles.viewToggleContainer}>
                            <button 
                                className={`${styles.viewToggleBtn} ${viewMode === 'calendar' ? styles.active : ''}`}
                                onClick={() => setViewMode('calendar')}
                                title="Calendar View"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                    <line x1="16" y1="2" x2="16" y2="6"/>
                                    <line x1="8" y1="2" x2="8" y2="6"/>
                                    <line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                            </button>
                            <button 
                                className={`${styles.viewToggleBtn} ${viewMode === 'list' ? styles.active : ''}`}
                                onClick={() => setViewMode('list')}
                                title="List View"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="8" y1="6" x2="21" y2="6"/>
                                    <line x1="8" y1="12" x2="21" y2="12"/>
                                    <line x1="8" y1="18" x2="21" y2="18"/>
                                    <line x1="3" y1="6" x2="3.01" y2="6"/>
                                    <line x1="3" y1="12" x2="3.01" y2="12"/>
                                    <line x1="3" y1="18" x2="3.01" y2="18"/>
                                </svg>
                            </button>
                        </div>
                        
                        {/* Doctor Filter Buttons */}
                        <div className={styles.doctorFilters}>
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
                        <Button variant="secondary" onClick={goToToday}>Today</Button>
                        <Button onClick={() => {
                            setEditingAppointmentId(null);
                            setSelectedDate(today);
                            setIsModalOpen(true);
                        }}>+ New</Button>
                    </div>
                </div>

                {/* Today's Appointments List */}
                {showTodayList && (
                    <div className={styles.todayList}>
                        <div className={styles.todayListHeader}>
                            <div className={styles.todayListHeaderContent}>
                                <div className={styles.todayBadgeLarge}>Today</div>
                                <div className={styles.todayListHeaderText}>
                                    <h3 className={styles.todayListTitle}>
                                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </h3>
                                    <p className={styles.todayListSubtitle}>
                                        {appointments.filter(apt => apt.date === today).length} {appointments.filter(apt => apt.date === today).length === 1 ? 'appointment' : 'appointments'}
                                    </p>
                                </div>
                            </div>
                            <button className={styles.todayListClose} onClick={() => setShowTodayList(false)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className={styles.todayAppointments}>
                            {appointments
                                .filter(apt => apt.date === today && (!selectedDoctor || apt.doctor?.id === selectedDoctor))
                                .sort((a, b) => a.time.localeCompare(b.time))
                                .map((apt, index) => {
                                    const patient = patients.find(p => p.id === apt.patient?.id || p.id === (apt.patient as any));
                                    const treatmentType = treatmentTypes.find((t: any) => t.id === apt.treatmentType?.id || t.id === (apt.treatmentType as any));

                                    return (
                                        <div key={apt.id} className={styles.todayAppointmentCard}>
                                            <div className={styles.todayCardLeft}>
                                                <div className={styles.todayTimeBlock}>
                                                    <div className={styles.todayTimeMain}>{apt.time}</div>
                                                    <div className={styles.todaySequence}>#{index + 1}</div>
                                                </div>
                                                <div className={styles.todayTimeBar} style={{ backgroundColor: treatmentType?.color || '#3b82f6' }} />
                                            </div>
                                            <div className={styles.todayCardContent} onClick={() => handleAppointmentClick(apt.id)}>
                                                <div className={styles.todayTopRow}>
                                                    <div className={styles.todayPatientName}>
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                            <circle cx="12" cy="7" r="4" />
                                                        </svg>
                                                        {patient ? `${patient.firstName} ${patient.lastName}` : 'Loading...'}
                                                    </div>
                                                    <span className={`${styles.statusBadge} ${styles.today}`} style={{
                                                        backgroundColor: apt.status === 'confirmed' ? '#d1fae5' : apt.status === 'pending' ? '#fef3c7' : '#fee2e2',
                                                        color: apt.status === 'confirmed' ? '#065f46' : apt.status === 'pending' ? '#92400e' : '#991b1b'
                                                    }}>
                                                        {apt.status ? (apt.status.charAt(0).toUpperCase() + apt.status.slice(1)) : 'Pending'}
                                                    </span>
                                                </div>
                                                <div className={styles.todayDoctorRow}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}>
                                                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                                    </svg>
                                                    {apt.doctor?.name || 'No Doctor Assigned'}
                                                </div>
                                                {treatmentType && (
                                                    <div className={styles.todayTreatmentRow}>
                                                        <div className={styles.todayTreatmentDot} style={{ backgroundColor: treatmentType.color || '#3b82f6' }} />
                                                        {treatmentType.name}
                                                    </div>
                                                )}
                                            </div>
                                            <div className={styles.todayCardActions}>
                                                <button
                                                    className={`${styles.todayActionButton} ${styles.view}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (patient) {
                                                            router.push(`/treatments/${patient.id}`);
                                                        }
                                                    }}
                                                    title="View Patient Profile"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                        <circle cx="12" cy="12" r="3" />
                                                    </svg>
                                                </button>
                                                <button
                                                    className={`${styles.todayActionButton} ${styles.delete}`}
                                                    onClick={(e) => handleDeleteClick(apt.id, e)}
                                                    title="Delete Appointment"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            {appointments.filter(apt => apt.date === today && (!selectedDoctor || apt.doctor?.id === selectedDoctor)).length === 0 && (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIcon}>📅</div>
                                    <div className={styles.emptyText}>No appointments scheduled for today</div>
                                    <div className={styles.emptySubtext}>Your schedule is clear!</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Calendar or List View */}
                <div className={`${styles.calendarGrid} ${viewMode === 'list' ? styles.hidden : ''}`}>
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

                {/* List/Agenda View */}
                {viewMode === 'list' && (
                    <div className={styles.agendaView}>
                        {getDaysInMonth()
                            .filter(day => day.isCurrentMonth)
                            .map((day: any) => {
                                const dateStr = day.fullDate;
                                const dayAppointments = appointments.filter((apt) => {
                                    const matchesDate = apt.date === dateStr;
                                    const matchesDoctor = !selectedDoctor || apt.doctor?.id === selectedDoctor;
                                    return matchesDate && matchesDoctor;
                                }).sort((a, b) => a.time.localeCompare(b.time));

                                if (dayAppointments.length === 0) return null;

                                const date = new Date(dateStr);
                                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                                const isToday = dateStr === today;

                                return (
                                    <div key={dateStr} className={styles.agendaDay}>
                                        <div className={`${styles.agendaDayHeader} ${isToday ? styles.todayHeader : ''}`}>
                                            <div className={styles.agendaDayNumber}>{day.date}</div>
                                            <div className={styles.agendaDayName}>
                                                {dayName}\n                                                {isToday && <span className={styles.todayBadge}>Today</span>}
                                            </div>
                                        </div>
                                        <div className={styles.agendaAppointments}>
                                            {dayAppointments.map((apt) => {
                                                const patient = patients.find(p => p.id === apt.patient?.id || p.id === (apt.patient as any));
                                                const treatmentType = treatmentTypes.find((t: any) => t.id === apt.treatmentType?.id || t.id === (apt.treatmentType as any));

                                                return (
                                                    <div key={apt.id} className={styles.agendaAppointment} onClick={() => handleAppointmentClick(apt.id)}>
                                                        <div className={styles.agendaTimeBar} style={{ backgroundColor: treatmentType?.color || '#3b82f6' }} />
                                                        <div className={styles.agendaAppointmentContent}>
                                                            <div className={styles.agendaTimeRow}>
                                                                <span className={styles.agendaTime}>{apt.time}</span>
                                                                <span className={`${styles.statusBadge} ${styles.small}`} style={{
                                                                    backgroundColor: apt.status === 'confirmed' ? '#d1fae5' : apt.status === 'pending' ? '#fef3c7' : '#fee2e2',
                                                                    color: apt.status === 'confirmed' ? '#065f46' : apt.status === 'pending' ? '#92400e' : '#991b1b'
                                                                }}>
                                                                    {apt.status ? (apt.status.charAt(0).toUpperCase() + apt.status.slice(1)) : 'Pending'}
                                                                </span>
                                                            </div>
                                                            <div className={styles.agendaPatientName}>
                                                                {patient ? `${patient.firstName} ${patient.lastName}` : 'Loading...'}
                                                            </div>
                                                            <div className={styles.agendaDoctorName}>
                                                                👨‍⚕️ {apt.doctor?.name || 'No Doctor Assigned'}
                                                            </div>
                                                        </div>
                                                        <div className={styles.agendaActions}>
                                                            <button
                                                                className={`${styles.actionButton} ${styles.view}`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (patient) {
                                                                        router.push(`/treatments/${patient.id}`);
                                                                    }
                                                                }}
                                                                title="View Patient"
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                                    <circle cx="12" cy="7" r="4" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                className={`${styles.actionButton} ${styles.delete}`}
                                                                onClick={(e) => handleDeleteClick(apt.id, e)}
                                                                title="Delete"
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        {getDaysInMonth()
                            .filter(day => day.isCurrentMonth)
                            .every(day => {
                                const dateStr = day.fullDate;
                                const dayAppointments = appointments.filter((apt) => {
                                    const matchesDate = apt.date === dateStr;
                                    const matchesDoctor = !selectedDoctor || apt.doctor?.id === selectedDoctor;
                                    return matchesDate && matchesDoctor;
                                });
                                return dayAppointments.length === 0;
                            }) && (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>📅</div>
                                <div className={styles.emptyText}>No appointments this month</div>
                            </div>
                        )}
                    </div>
                )}
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


'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { useAppointmentStore } from '@/store/appointmentStore';
import { usePatientStore } from '@/store/patientStore';
import { useSettingsStore } from '@/store/settingsStore';
import styles from './appointments.module.css';

export default function AppointmentsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [currentMonth, setCurrentMonth] = useState<Date | null>(null);
    const [today, setToday] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState<string>(''); // Filter by doctor
    const [showTodayList, setShowTodayList] = useState(false); // Show today's appointments list
    const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null); // Track if editing

    const appointments = useAppointmentStore((state) => state.appointments);
    const addAppointment = useAppointmentStore((state) => state.addAppointment);
    const updateAppointment = useAppointmentStore((state) => state.updateAppointment);
    const deleteAppointment = useAppointmentStore((state) => state.deleteAppointment);
    const patients = usePatientStore((state) => state.patients);
    const appointmentTypes = useSettingsStore((state) => state.appointmentTypes);
    const doctors = useSettingsStore((state) => state.doctors);

    const [formData, setFormData] = useState({
        patientId: '',
        appointmentTypeId: '',
        date: '',
        time: '',
        drName: '',
        notes: '',
    });

    // Initialize dates on client side only to avoid hydration errors
    useEffect(() => {
        const now = new Date();
        setCurrentMonth(now);
        setToday(now.toISOString().split('T')[0]);
    }, []);

    const handleDayClick = (date: string) => {
        setSelectedDate(date);
        setEditingAppointmentId(null);
        setFormData({ patientId: '', appointmentTypeId: '', date, time: '', drName: '', notes: '' });
        setIsModalOpen(true);
    };

    const handleAppointmentClick = (appointmentId: string) => {
        const appointment = appointments.find(apt => apt.id === appointmentId);
        if (appointment) {
            setEditingAppointmentId(appointmentId);
            setSelectedDate(appointment.date);
            setFormData({
                patientId: appointment.patientId,
                appointmentTypeId: appointment.appointmentTypeId,
                date: appointment.date,
                time: appointment.time,
                drName: appointment.drName || '',
                notes: appointment.notes || ''
            });
            setIsModalOpen(true);
        }
    };

    const handleSubmit = () => {
        if (formData.patientId && formData.appointmentTypeId && formData.date && formData.time) {
            if (editingAppointmentId) {
                // Update existing appointment
                updateAppointment(editingAppointmentId, formData);
            } else {
                // Add new appointment
                addAppointment({
                    ...formData,
                    status: 'pending',
                });
            }
            setIsModalOpen(false);
            setEditingAppointmentId(null);
            setFormData({ patientId: '', appointmentTypeId: '', date: '', time: '', drName: '', notes: '' });
        }
    };

    const handleDeleteFromModal = () => {
        if (editingAppointmentId) {
            const appointment = appointments.find(apt => apt.id === editingAppointmentId);
            const patient = patients.find(p => p.id === appointment?.patientId);
            const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';

            if (confirm(`Are you sure you want to delete the appointment for ${patientName} at ${appointment?.time}? This action cannot be undone.`)) {
                deleteAppointment(editingAppointmentId);
                setIsModalOpen(false);
                setEditingAppointmentId(null);
                setFormData({ patientId: '', appointmentTypeId: '', date: '', time: '', drName: '', notes: '' });
            }
        }
    };

    const goToToday = () => {
        setCurrentMonth(new Date());
        setShowTodayList(!showTodayList); // Toggle today's list
    };

    const handleDeleteAppointment = (appointmentId: string, patientName: string, time: string) => {
        if (confirm(`Are you sure you want to delete the appointment for ${patientName} at ${time}? This action cannot be undone.`)) {
            deleteAppointment(appointmentId);
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
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // Previous month days
        const prevMonthDays = new Date(year, month, 0).getDate();
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            days.push({ date: prevMonthDays - i, isCurrentMonth: false });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ date: i, isCurrentMonth: true });
        }

        // Next month days
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push({ date: i, isCurrentMonth: false });
        }

        return days;
    };

    const monthName = currentMonth ? currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';

    // Show loading state until client-side hydration is complete
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
                            {doctors.map((doctor) => (
                                <Button
                                    key={doctor}
                                    variant={selectedDoctor === doctor ? 'primary' : 'secondary'}
                                    onClick={() => setSelectedDoctor(doctor)}
                                    size="sm"
                                >
                                    {doctor.replace('Dr. ', '')}
                                </Button>
                            ))}
                        </div>
                        <div style={{ width: '1px', height: '24px', backgroundColor: '#e5e7eb' }} />
                        <Button variant="secondary" onClick={goToToday}>Today</Button>
                        <Button onClick={() => setIsModalOpen(true)}>+ New Appointment</Button>
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
                                .filter(apt => apt.date === today)
                                .sort((a, b) => a.time.localeCompare(b.time))
                                .map((apt) => {
                                    const patient = patients.find(p => p.id === apt.patientId);
                                    const aptType = appointmentTypes.find(t => t.id === apt.appointmentTypeId);
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
                                                    color: aptType?.color || '#3b82f6'
                                                }}>
                                                    {apt.time}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: '500', fontSize: '15px' }}>
                                                        {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                                                    </div>
                                                    <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
                                                        {aptType?.name || 'Unknown Type'}
                                                    </div>
                                                </div>
                                                <div style={{
                                                    fontSize: '14px',
                                                    color: '#6b7280',
                                                    fontWeight: '500'
                                                }}>
                                                    {apt.drName || 'No Doctor Assigned'}
                                                </div>
                                                <div style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: '500',
                                                    backgroundColor: apt.status === 'confirmed' ? '#d1fae5' : apt.status === 'pending' ? '#fef3c7' : '#fee2e2',
                                                    color: apt.status === 'confirmed' ? '#065f46' : apt.status === 'pending' ? '#92400e' : '#991b1b'
                                                }}>
                                                    {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteAppointment(
                                                        apt.id,
                                                        patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient',
                                                        apt.time
                                                    );
                                                }}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: '8px',
                                                    marginLeft: '12px',
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
                            {appointments.filter(apt => apt.date === today).length === 0 && (
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
                    {getDaysInMonth().map((day, index) => {
                        const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + (day.isCurrentMonth ? 1 : day.date > 15 ? 0 : 2)).padStart(2, '0')}-${String(day.date).padStart(2, '0')}`;
                        const dayAppointments = appointments.filter((apt) => {
                            const matchesDate = apt.date === dateStr;
                            const matchesDoctor = !selectedDoctor || apt.drName === selectedDoctor;
                            return matchesDate && matchesDoctor;
                        });
                        const isToday = dateStr === today;

                        return (
                            <div
                                key={index}
                                className={`${styles.calendarDay} ${!day.isCurrentMonth ? styles.otherMonth : ''} ${isToday ? styles.today : ''}`}
                                onClick={() => day.isCurrentMonth && handleDayClick(dateStr)}
                            >
                                <div className={styles.calendarDayNumber}>{day.date}</div>
                                {dayAppointments.slice(0, 3).map((apt) => {
                                    const aptType = appointmentTypes.find((t) => t.id === apt.appointmentTypeId);
                                    return (
                                        <div
                                            key={apt.id}
                                            className={styles.calendarEvent}
                                            style={{ backgroundColor: aptType?.color + '20', color: aptType?.color, cursor: 'pointer' }}
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

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingAppointmentId(null);
                }}
                title={editingAppointmentId ? "Edit Appointment" : "New Appointment"}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => {
                            setIsModalOpen(false);
                            setEditingAppointmentId(null);
                        }}>Cancel</Button>
                        {editingAppointmentId && (
                            <Button variant="danger" onClick={handleDeleteFromModal}>Delete</Button>
                        )}
                        <Button onClick={handleSubmit}>{editingAppointmentId ? 'Update' : 'Create'} Appointment</Button>
                    </>
                }
            >
                <Select
                    label="Patient"
                    options={patients.map((p) => ({ value: p.id, label: `${p.firstName} ${p.lastName} (${p.id})` }))}
                    value={formData.patientId}
                    onChange={(value) => setFormData({ ...formData, patientId: value })}
                    searchable
                    placeholder="Search patient..."
                />
                <Select
                    label="Appointment Type"
                    options={appointmentTypes.map((t) => ({ value: t.id, label: `${t.name} (${t.duration} min)` }))}
                    value={formData.appointmentTypeId}
                    onChange={(value) => setFormData({ ...formData, appointmentTypeId: value })}
                />
                <Input
                    type="date"
                    label="Date"
                    value={formData.date}
                    onChange={(value) => setFormData({ ...formData, date: value })}
                    required
                />
                <Input
                    type="time"
                    label="Time"
                    value={formData.time}
                    onChange={(value) => setFormData({ ...formData, time: value })}
                    required
                />
                <Select
                    label="Doctor Name"
                    options={doctors.map((d) => ({ value: d, label: d }))}
                    value={formData.drName}
                    onChange={(value) => setFormData({ ...formData, drName: value })}
                    placeholder="Select doctor..."
                />
                <Input
                    type="text"
                    label="Notes"
                    placeholder="Any special notes..."
                    value={formData.notes}
                    onChange={(value) => setFormData({ ...formData, notes: value })}
                />
            </Modal>
        </MainLayout>
    );
}

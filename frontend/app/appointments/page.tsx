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

    const appointments = useAppointmentStore((state) => state.appointments);
    const addAppointment = useAppointmentStore((state) => state.addAppointment);
    const patients = usePatientStore((state) => state.patients);
    const appointmentTypes = useSettingsStore((state) => state.appointmentTypes);

    const [formData, setFormData] = useState({
        patientId: '',
        appointmentTypeId: '',
        date: '',
        time: '',
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
        setFormData({ ...formData, date });
        setIsModalOpen(true);
    };

    const handleSubmit = () => {
        if (formData.patientId && formData.appointmentTypeId && formData.date && formData.time) {
            addAppointment({
                ...formData,
                status: 'pending',
            });
            setIsModalOpen(false);
            setFormData({ patientId: '', appointmentTypeId: '', date: '', time: '', notes: '' });
        }
    };

    const goToToday = () => {
        setCurrentMonth(new Date());
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
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Button variant="secondary" onClick={goToToday}>Today</Button>
                        <Button onClick={() => setIsModalOpen(true)}>+ New Appointment</Button>
                    </div>
                </div>

                <div className={styles.calendarGrid}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className={styles.calendarDayHeader}>{day}</div>
                    ))}
                    {getDaysInMonth().map((day, index) => {
                        const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + (day.isCurrentMonth ? 1 : day.date > 15 ? 0 : 2)).padStart(2, '0')}-${String(day.date).padStart(2, '0')}`;
                        const dayAppointments = appointments.filter((apt) => apt.date === dateStr);
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
                                            style={{ backgroundColor: aptType?.color + '20', color: aptType?.color }}
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
                onClose={() => setIsModalOpen(false)}
                title="New Appointment"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit}>Create Appointment</Button>
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

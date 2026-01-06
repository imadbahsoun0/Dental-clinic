'use client';

import React from 'react';
import type { Appointment, Patient } from '@/types';
import { getColorPairFromId } from '@/utils/colorFromId';
import styles from './Calendar.module.css';

interface CalendarDay {
    date: number;
    fullDate: string;
    isCurrentMonth: boolean;
}

interface CalendarProps {
    days: CalendarDay[];
    appointments: Appointment[];
    patients: Patient[];
    selectedDoctor: string;
    today: string;
    calendarView: 'month' | 'day';
    activeDate: string;
    onDayClick: (date: string) => void;
    onAppointmentClick: (appointmentId: string) => void;
}

export const Calendar: React.FC<CalendarProps> = ({
    days,
    appointments,
    patients,
    selectedDoctor,
    today,
    calendarView,
    activeDate,
    onDayClick,
    onAppointmentClick,
}) => {
    const patientsById = new Map(patients.map((p) => [p.id, p] as const));

    const getPatientName = (apt: Appointment): string => {
        if (apt.patient) {
            return `${apt.patient.firstName} ${apt.patient.lastName}`;
        }
        const patient = patientsById.get(apt.patientId);
        if (patient) {
            return `${patient.firstName} ${patient.lastName}`;
        }
        return 'Unknown Patient';
    };

    const getDoctorId = (apt: Appointment): string | undefined => {
        return apt.doctor?.id ?? apt.doctorId;
    };

    const matchesSelectedDoctor = (apt: Appointment): boolean => {
        if (!selectedDoctor) return true;
        return getDoctorId(apt) === selectedDoctor;
    };

    if (calendarView === 'day') {
        const startHour = 7;
        const hours = Array.from({ length: 24 }, (_, i) => (startHour + i) % 24);
        const dayAppointments = appointments
            .filter((apt) => apt.date === activeDate)
            .filter(matchesSelectedDoctor)
            .sort((a, b) => a.time.localeCompare(b.time));

        const appointmentsByHour = new Map<number, Appointment[]>();
        for (const apt of dayAppointments) {
            const hourStr = apt.time.split(':')[0];
            const hour = Number(hourStr);
            if (!Number.isFinite(hour)) continue;
            const existing = appointmentsByHour.get(hour) ?? [];
            existing.push(apt);
            appointmentsByHour.set(hour, existing);
        }

        const formatHourLabel = (hour: number): string => {
            const period = hour >= 12 ? 'PM' : 'AM';
            const hour12 = hour % 12 === 0 ? 12 : hour % 12;
            return `${hour12}:00 ${period}`;
        };

        return (
            <div className={styles.dayGrid}>
                {hours.map((hour) => {
                    const items = appointmentsByHour.get(hour) ?? [];
                    return (
                        <React.Fragment key={hour}>
                            <div className={styles.dayTimeCell}>{formatHourLabel(hour)}</div>
                            <div
                                className={styles.dayAppointmentsCell}
                                onClick={() => onDayClick(activeDate)}
                            >
                                {items.map((apt) => {
                                    const { fg, bg } = getColorPairFromId(getDoctorId(apt));
                                    const patientName = getPatientName(apt);
                                    return (
                                        <div
                                            key={apt.id}
                                            className={styles.dayAppointment}
                                            style={{ backgroundColor: bg, color: fg, borderLeftColor: fg }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onAppointmentClick(apt.id);
                                            }}
                                        >
                                            <div className={styles.dayAppointmentTime}>{apt.time}</div>
                                            <div className={styles.dayAppointmentPatient}>{patientName}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
        );
    }

    return (
        <>
            {/* Desktop month grid */}
            <div className={styles.monthGridWrapper}>
                <div className={styles.calendarGrid}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className={styles.calendarDayHeader}>{day}</div>
                    ))}
                    {days.map((day: CalendarDay, index) => {
                        const dateStr = day.fullDate;
                        const dayAppointments = appointments
                            .filter((apt) => apt.date === dateStr)
                            .filter(matchesSelectedDoctor);
                        const isToday = dateStr === today;

                        return (
                            <div
                                key={index}
                                className={`${styles.calendarDay} ${!day.isCurrentMonth ? styles.otherMonth : ''} ${isToday ? styles.today : ''}`}
                                onClick={() => onDayClick(dateStr)}
                            >
                                <div className={styles.calendarDayNumber}>{day.date}</div>
                                {dayAppointments.slice(0, 3).map((apt) => {
                                    const { fg, bg } = getColorPairFromId(getDoctorId(apt));
                                    const patientName = getPatientName(apt);
                                    return (
                                        <div
                                            key={apt.id}
                                            className={styles.calendarEvent}
                                            style={{ backgroundColor: bg, color: fg, cursor: 'pointer' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onAppointmentClick(apt.id);
                                            }}
                                        >
                                            {apt.time} {patientName}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Mobile month agenda (smart, readable) */}
            <div className={styles.mobileMonthAgenda}>
                {(() => {
                    const currentMonthDays = days.filter((d) => d.isCurrentMonth);

                    const appointmentsByDate = new Map<string, Appointment[]>();
                    for (const apt of appointments) {
                        if (!matchesSelectedDoctor(apt)) continue;
                        const list = appointmentsByDate.get(apt.date) ?? [];
                        list.push(apt);
                        appointmentsByDate.set(apt.date, list);
                    }

                    for (const [date, list] of appointmentsByDate) {
                        list.sort((a, b) => a.time.localeCompare(b.time));
                        appointmentsByDate.set(date, list);
                    }

                    const daysWithAppointments = currentMonthDays.filter(
                        (d) => (appointmentsByDate.get(d.fullDate)?.length ?? 0) > 0,
                    );

                    const agendaDays = daysWithAppointments.length > 0 ? daysWithAppointments : currentMonthDays;

                    const formatDayLabel = (dateStr: string): string => {
                        return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                        });
                    };

                    return agendaDays.map((d) => {
                        const dateStr = d.fullDate;
                        const items = appointmentsByDate.get(dateStr) ?? [];
                        const isToday = dateStr === today;

                        return (
                            <div key={dateStr} className={styles.mobileAgendaDay}>
                                <button
                                    type="button"
                                    className={`${styles.mobileAgendaDayHeader} ${isToday ? styles.mobileAgendaDayHeaderToday : ''}`}
                                    onClick={() => onDayClick(dateStr)}
                                >
                                    <span className={styles.mobileAgendaDayLabel}>{formatDayLabel(dateStr)}</span>
                                    <span className={styles.mobileAgendaCount}>
                                        {items.length > 0 ? `${items.length}` : ''}
                                    </span>
                                </button>

                                {items.length > 0 && (
                                    <div className={styles.mobileAgendaItems}>
                                        {items.map((apt) => {
                                            const { fg, bg } = getColorPairFromId(getDoctorId(apt));
                                            const patientName = getPatientName(apt);
                                            return (
                                                <button
                                                    key={apt.id}
                                                    type="button"
                                                    className={styles.mobileAgendaItem}
                                                    style={{ backgroundColor: bg, color: fg, borderLeftColor: fg }}
                                                    onClick={() => onAppointmentClick(apt.id)}
                                                >
                                                    <span className={styles.mobileAgendaTime}>{apt.time}</span>
                                                    <span className={styles.mobileAgendaPatient}>{patientName}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    });
                })()}
            </div>
        </>
    );
};
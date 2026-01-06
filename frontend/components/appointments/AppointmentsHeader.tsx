'use client';

import React from 'react';
import { Button } from '@/components/common/Button';
import type { UserWithRole } from '@/types';
import { getColorPairFromId } from '@/utils/colorFromId';
import styles from './AppointmentsHeader.module.css';

interface AppointmentsHeaderProps {
    monthName: string;
    calendarView: 'month' | 'day';
    setCalendarView: (view: 'month' | 'day') => void;
    activeDate: string;
    previousDay: () => void;
    nextDay: () => void;
    selectedDoctor: string;
    setSelectedDoctor: (doctorId: string) => void;
    dentists: UserWithRole[];
    onNewAppointment: () => void;
    previousMonth: () => void;
    nextMonth: () => void;
}

export const AppointmentsHeader: React.FC<AppointmentsHeaderProps> = ({
    monthName,
    calendarView,
    setCalendarView,
    activeDate,
    previousDay,
    nextDay,
    selectedDoctor,
    setSelectedDoctor,
    dentists,
    onNewAppointment,
    previousMonth,
    nextMonth,
}) => {
    const dayLabel = activeDate
        ? new Date(`${activeDate}T00:00:00`).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
          })
        : '';

    return (
        <div className={styles.calendarHeader}>
            <div className={styles.calendarNav}>
                {calendarView === 'month' ? (
                    <>
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
                    </>
                ) : (
                    <>
                        <button className={styles.calendarNavBtn} onClick={previousDay}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                        <h2 className={styles.calendarMonth}>{dayLabel}</h2>
                        <button className={styles.calendarNavBtn} onClick={nextDay}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    </>
                )}
            </div>
            <div className={styles.headerActions}>
                {/* Calendar Sub-View Toggle */}
                <div className={styles.viewToggleContainer}>
                    <button
                        className={`${styles.viewToggleBtn} ${calendarView === 'month' ? styles.active : ''}`}
                        onClick={() => setCalendarView('month')}
                        title="Month View"
                    >
                        Month
                    </button>
                    <button
                        className={`${styles.viewToggleBtn} ${calendarView === 'day' ? styles.active : ''}`}
                        onClick={() => setCalendarView('day')}
                        title="Day View"
                    >
                        Day
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
                    {dentists.map((doctor) => (
                        <Button
                            key={doctor.id}
                            variant="secondary"
                            onClick={() => setSelectedDoctor(doctor.id)}
                            size="sm"
                            style={(() => {
                                const { fg, bg } = getColorPairFromId(doctor.id);
                                const isSelected = selectedDoctor === doctor.id;
                                return {
                                    background: bg,
                                    color: fg,
                                    borderColor: fg,
                                    borderWidth: isSelected ? 2 : 1,
                                };
                            })()}
                        >
                            {doctor.name}
                        </Button>
                    ))}
                </div>
                <Button onClick={onNewAppointment}>+ New</Button>
            </div>
        </div>
    );
};
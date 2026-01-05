'use client';

import React, { useMemo } from 'react';
import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import styles from './BigCalendar.module.css';

const localizer = momentLocalizer(moment);

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    appointmentId: string;
    patientName: string;
    doctorName: string;
    status: string;
    color: string;
    time: string;
  };
}

interface BigCalendarProps {
  appointments: Array<{
    id: string;
    date: string;
    time: string;
    status: string;
    patient?: { id: string; firstName?: string; lastName?: string } | string;
    doctor?: { id: string; name: string };
    treatmentType?: { id: string; name: string; color?: string } | string;
  }>;
  patients: Array<{
    id: string;
    firstName: string;
    lastName: string;
  }>;
  treatmentTypes: Array<{
    id: string;
    name: string;
    color?: string;
  }>;
  onSelectEvent: (appointmentId: string) => void;
  onSelectSlot: (date: Date) => void;
  view: View;
  onViewChange: (view: View) => void;
  date: Date;
  onNavigate: (date: Date) => void;
}

export const BigCalendar: React.FC<BigCalendarProps> = ({
  appointments,
  patients,
  treatmentTypes,
  onSelectEvent,
  onSelectSlot,
  view,
  onViewChange,
  date,
  onNavigate,
}) => {
  const events: CalendarEvent[] = useMemo(() => {
    return appointments.map((apt) => {
      const patient = patients.find(
        (p) => p.id === (typeof apt.patient === 'object' ? apt.patient?.id : apt.patient)
      );
      const treatmentType = treatmentTypes.find(
        (t) =>
          t.id ===
          (typeof apt.treatmentType === 'object' ? apt.treatmentType?.id : apt.treatmentType)
      );

      const [hours, minutes] = apt.time.split(':').map(Number);
      const startDate = new Date(apt.date);
      startDate.setHours(hours, minutes, 0);

      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + 30); // Default 30 min appointment

      const patientName = patient
        ? `${patient.firstName} ${patient.lastName}`
        : 'Unknown Patient';

      return {
        id: apt.id,
        title: `${patientName}\n${apt.doctor?.name || 'No Doctor'}`,
        start: startDate,
        end: endDate,
        resource: {
          appointmentId: apt.id,
          patientName,
          doctorName: apt.doctor?.name || 'No Doctor',
          status: apt.status || 'pending',
          color: treatmentType?.color || '#3b82f6',
          time: apt.time,
        },
      };
    });
  }, [appointments, patients, treatmentTypes]);

  const eventStyleGetter = (event: CalendarEvent) => {
    const style = {
      backgroundColor: event.resource.color,
      borderRadius: '4px',
      opacity: 0.9,
      color: 'white',
      border: '0px',
      display: 'block',
      fontSize: '13px',
      padding: '6px 8px',
      minHeight: '60px',
      lineHeight: '1.4',
    };
    return {
      style,
    };
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    onSelectEvent(event.resource.appointmentId);
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date; action: string }) => {
    if (slotInfo.action === 'click' || slotInfo.action === 'select') {
      onSelectSlot(slotInfo.start);
    }
  };

  return (
    <div className={styles.calendarContainer}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 'calc(100vh - 300px)', minHeight: '500px' }}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        view={view}
        onView={onViewChange}
        views={[Views.MONTH, Views.DAY, Views.WEEK, Views.AGENDA]}
        date={date}
        onNavigate={onNavigate}
        eventPropGetter={eventStyleGetter}
        popup
        step={15}
        timeslots={4}
        defaultDate={new Date()}
        messages={{
          next: 'Next',
          previous: 'Previous',
          today: 'Today',
          month: 'Month',
          week: 'Week',
          day: 'Day',
          agenda: 'Agenda',
          date: 'Date',
          time: 'Time',
          event: 'Appointment',
          noEventsInRange: 'No appointments in this range',
          showMore: (total: number) => `+${total} more`,
        }}
      />
    </div>
  );
};

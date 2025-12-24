'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { useAppointmentStore } from '@/store/appointmentStore';
import { usePatientStore } from '@/store/patientStore';
import { useTreatmentStore } from '@/store/treatmentStore';
import { useExpenseStore } from '@/store/expenseStore';
import { useSettingsStore } from '@/store/settingsStore';
import { ExpenseModal } from '@/components/expenses/ExpenseModal';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';

export default function DashboardPage() {
    const router = useRouter();
    const appointments = useAppointmentStore((state) => state.appointments);
    const addAppointment = useAppointmentStore((state) => state.addAppointment);
    const patients = usePatientStore((state) => state.patients);
    const treatments = useTreatmentStore((state) => state.treatments);
    const expenses = useExpenseStore((state) => state.expenses);
    const addExpense = useExpenseStore((state) => state.addExpense);
    const appointmentTypes = useSettingsStore((state) => state.appointmentTypes);
    const doctors = useSettingsStore((state) => state.doctors);
    const [today, setToday] = useState('');
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
    const [appointmentFormData, setAppointmentFormData] = useState({
        patientId: '',
        appointmentTypeId: '',
        date: '',
        time: '',
        drName: '',
        notes: '',
    });

    // Get today's date on client side only to avoid hydration errors
    useEffect(() => {
        setToday(new Date().toISOString().split('T')[0]);
    }, []);

    const todayAppointments = appointments.filter((apt) => apt.date === today);
    const todayTreatments = treatments.filter((t) => t.date === today);
    const todayExpenses = expenses.filter((e) => e.date === today);

    // Calculate stats
    const pendingPayments = 12400; // Dummy value
    const todayIncome = todayTreatments.reduce((sum, t) => sum + t.amountPaid, 0);
    const todayExpensesTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
    const dailyNet = todayIncome - todayExpensesTotal;

    return (
        <MainLayout title="Dashboard">
            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                <div className={`${styles.statCard} ${styles.animateIn}`}>
                    <div className={styles.statHeader}>
                        <div className={`${styles.statIcon} ${styles.teal}`}>📅</div>
                        <span className={`${styles.statTrend} ${styles.up}`}>↑ 12%</span>
                    </div>
                    <div className={styles.statValue}>{todayAppointments.length}</div>
                    <div className={styles.statLabel}>Today's Appointments</div>
                </div>

                <div className={`${styles.statCard} ${styles.animateIn} ${styles.delay1}`}>
                    <div className={styles.statHeader}>
                        <div className={`${styles.statIcon} ${styles.orange}`}>👥</div>
                        <span className={`${styles.statTrend} ${styles.up}`}>↑ 8%</span>
                    </div>
                    <div className={styles.statValue}>{patients.length}</div>
                    <div className={styles.statLabel}>Total Patients</div>
                </div>

                <div className={`${styles.statCard} ${styles.animateIn} ${styles.delay2}`}>
                    <div className={styles.statHeader}>
                        <div className={`${styles.statIcon} ${styles.pink}`}>💰</div>
                        <span className={`${styles.statTrend} ${styles.down}`}>↓ 3%</span>
                    </div>
                    <div className={styles.statValue}>${(pendingPayments / 1000).toFixed(1)}k</div>
                    <div className={styles.statLabel}>Pending Payments</div>
                </div>

                <div className={`${styles.statCard} ${styles.animateIn} ${styles.delay3}`}>
                    <div className={styles.statHeader}>
                        <div className={`${styles.statIcon} ${styles.green}`}>💵</div>
                        <span className={`${styles.statTrend} ${dailyNet >= 0 ? styles.up : styles.down}`}>
                            {dailyNet >= 0 ? '↑' : '↓'} {Math.abs(dailyNet) > 0 ? `$${Math.abs(dailyNet).toFixed(0)}` : '0'}
                        </span>
                    </div>
                    <div className={styles.statValue}>${dailyNet.toFixed(0)}</div>
                    <div className={styles.statLabel}>Daily Net Income</div>
                </div>
            </div>

            {/* Main Grid */}
            <div className={styles.mainGrid}>
                <div>
                    {/* Today's Appointments */}
                    <Card
                        title="Today's Appointments"
                        action={
                            <a href="/appointments" className={styles.cardAction}>
                                View All →
                            </a>
                        }
                        className={styles.marginBottom}
                    >
                        <div className={styles.appointmentList}>
                            {todayAppointments.slice(0, 4).map((apt) => {
                                const patient = patients.find((p) => p.id === apt.patientId);
                                const [hours, minutes] = apt.time.split(':');
                                const hour = parseInt(hours);
                                const period = hour >= 12 ? 'PM' : 'AM';
                                const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;

                                return (
                                    <div key={apt.id} className={styles.appointmentItem}>
                                        <div className={styles.appointmentTime}>
                                            <div className={styles.appointmentHour}>{displayHour}:{minutes}</div>
                                            <div className={styles.appointmentPeriod}>{period}</div>
                                        </div>
                                        <div className={`${styles.appointmentDivider} ${styles[apt.status]}`}></div>
                                        <div className={styles.appointmentDetails}>
                                            <div className={styles.appointmentPatient}>
                                                {patient?.firstName} {patient?.lastName}
                                            </div>
                                            <div className={styles.appointmentType}>Appointment • 30 min</div>
                                        </div>
                                        <Badge variant={apt.status === 'confirmed' ? 'success' : apt.status === 'pending' ? 'warning' : 'danger'}>
                                            {apt.status}
                                        </Badge>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Pending Treatments */}
                    <Card
                        title="⚠️ Pending Treatments"
                        action={<a href="/patients" className={styles.cardAction}>View All →</a>}
                    >
                        {(() => {
                            // Find patients with planned treatments that don't have appointments
                            const pendingTreatments = treatments.filter(
                                (t) => t.status === 'planned' && !t.appointmentId
                            );

                            // Group by patient
                            const patientTreatmentMap = new Map<string, typeof treatments>();
                            pendingTreatments.forEach((treatment) => {
                                const existing = patientTreatmentMap.get(treatment.patientId) || [];
                                patientTreatmentMap.set(treatment.patientId, [...existing, treatment]);
                            });

                            // Get unique patients with pending treatments
                            const patientsWithPending = Array.from(patientTreatmentMap.entries()).map(
                                ([patientId, patientTreatments]) => {
                                    const patient = patients.find((p) => p.id === patientId);
                                    return { patient, treatments: patientTreatments };
                                }
                            ).filter((item) => item.patient);

                            if (patientsWithPending.length === 0) {
                                return (
                                    <div className={styles.emptyPendingState}>
                                        <div className={styles.emptyPendingIcon}>✓</div>
                                        <div className={styles.emptyPendingText}>
                                            All treatments scheduled
                                        </div>
                                        <div className={styles.emptyPendingSubtext}>
                                            No pending treatments waiting for appointments
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div className={styles.pendingTreatmentsList}>
                                    {patientsWithPending.slice(0, 4).map(({ patient, treatments: patientTreatments }) => {
                                        if (!patient) return null;

                                        const appointmentTypes = useSettingsStore.getState().appointmentTypes;
                                        const treatmentNames = patientTreatments
                                            .map((t) => {
                                                const type = appointmentTypes.find((at: { id: string }) => at.id === t.appointmentTypeId);
                                                return type?.name || 'Unknown';
                                            })
                                            .slice(0, 2);

                                        return (
                                            <div key={patient.id} className={styles.pendingTreatmentItem}>
                                                <div className={styles.pendingTreatmentInfo}>
                                                    <div className={styles.patientAvatar}>
                                                        {patient.firstName[0]}{patient.lastName[0]}
                                                    </div>
                                                    <div>
                                                        <div className={styles.pendingPatientName}>
                                                            {patient.firstName} {patient.lastName}
                                                        </div>
                                                        <div className={styles.pendingTreatmentDetails}>
                                                            {treatmentNames.join(', ')}
                                                            {patientTreatments.length > 2 && ` +${patientTreatments.length - 2} more`}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={styles.pendingTreatmentActions}>
                                                    <Badge variant="warning">
                                                        {patientTreatments.length} pending
                                                    </Badge>
                                                    <button
                                                        className={styles.scheduleBtn}
                                                        onClick={() => {
                                                            // Use the first pending treatment's appointment type
                                                            const firstTreatment = patientTreatments[0];
                                                            setAppointmentFormData({
                                                                patientId: patient.id,
                                                                appointmentTypeId: firstTreatment?.appointmentTypeId || '',
                                                                date: '',
                                                                time: '',
                                                                drName: '',
                                                                notes: '',
                                                            });
                                                            setIsAppointmentModalOpen(true);
                                                        }}
                                                        title="Schedule Appointment"
                                                    >
                                                        Schedule
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                    </Card>
                </div>

                {/* Sidebar */}
                <div>
                    {/* Quick Actions */}
                    <Card title="Quick Actions" className={styles.marginBottom}>
                        <div className={styles.quickActions}>
                            <button className={styles.quickActionBtn} onClick={() => router.push('/appointments')}>
                                <div className={styles.quickActionIcon}>📅</div>
                                <span className={styles.quickActionLabel}>New Appointment</span>
                            </button>
                            <button className={styles.quickActionBtn} onClick={() => router.push('/patients')}>
                                <div className={styles.quickActionIcon}>👤</div>
                                <span className={styles.quickActionLabel}>Add Patient</span>
                            </button>
                            <button className={styles.quickActionBtn} onClick={() => setIsExpenseModalOpen(true)}>
                                <div className={styles.quickActionIcon}>💰</div>
                                <span className={styles.quickActionLabel}>New Expense</span>
                            </button>
                        </div>
                    </Card>
                </div>
            </div>

            <ExpenseModal
                isOpen={isExpenseModalOpen}
                onClose={() => setIsExpenseModalOpen(false)}
                onSave={(expenseData) => {
                    addExpense(expenseData);
                    setIsExpenseModalOpen(false);
                }}
                expense={null}
            />

            <Modal
                isOpen={isAppointmentModalOpen}
                onClose={() => {
                    setIsAppointmentModalOpen(false);
                    setAppointmentFormData({
                        patientId: '',
                        appointmentTypeId: '',
                        date: '',
                        time: '',
                        drName: '',
                        notes: '',
                    });
                }}
                title="Schedule Appointment"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => {
                            setIsAppointmentModalOpen(false);
                            setAppointmentFormData({
                                patientId: '',
                                appointmentTypeId: '',
                                date: '',
                                time: '',
                                drName: '',
                                notes: '',
                            });
                        }}>Cancel</Button>
                        <Button onClick={() => {
                            if (appointmentFormData.patientId && appointmentFormData.appointmentTypeId && appointmentFormData.date && appointmentFormData.time) {
                                addAppointment({
                                    ...appointmentFormData,
                                    status: 'pending',
                                });
                                setIsAppointmentModalOpen(false);
                                setAppointmentFormData({
                                    patientId: '',
                                    appointmentTypeId: '',
                                    date: '',
                                    time: '',
                                    drName: '',
                                    notes: '',
                                });
                            }
                        }}>Create Appointment</Button>
                    </>
                }
            >
                <Select
                    label="Patient"
                    options={patients.map((p) => ({ value: p.id, label: `${p.firstName} ${p.lastName} (${p.id})` }))}
                    value={appointmentFormData.patientId}
                    onChange={(value) => setAppointmentFormData({ ...appointmentFormData, patientId: value })}
                    searchable
                    placeholder="Search patient..."
                />
                <Input
                    type="date"
                    label="Date"
                    value={appointmentFormData.date}
                    onChange={(value) => setAppointmentFormData({ ...appointmentFormData, date: value })}
                    required
                />
                <Input
                    type="time"
                    label="Time"
                    value={appointmentFormData.time}
                    onChange={(value) => setAppointmentFormData({ ...appointmentFormData, time: value })}
                    required
                />
                <Select
                    label="Doctor Name"
                    options={doctors.map((d) => ({ value: d, label: d }))}
                    value={appointmentFormData.drName}
                    onChange={(value) => setAppointmentFormData({ ...appointmentFormData, drName: value })}
                    placeholder="Select doctor..."
                />
                <Input
                    type="text"
                    label="Notes"
                    placeholder="Any special notes..."
                    value={appointmentFormData.notes}
                    onChange={(value) => setAppointmentFormData({ ...appointmentFormData, notes: value })}
                />
            </Modal>
        </MainLayout>
    );
}

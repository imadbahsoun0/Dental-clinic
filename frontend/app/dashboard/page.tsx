'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { useAppointmentStore } from '@/store/appointmentStore';
import { usePatientStore } from '@/store/patientStore';
import { ExpenseModal } from '@/components/expenses/ExpenseModal';
import { AppointmentModal } from '@/components/appointments/AppointmentModal';
import { PatientModal } from '@/components/patients/PatientModal';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { formatLocalDate } from '@/utils/dateUtils';
import { api, DashboardStatsDto, PendingTreatmentDto, StandardResponse } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import styles from './dashboard.module.css';

type DashboardStats = DashboardStatsDto;
type PendingTreatment = PendingTreatmentDto;

export default function DashboardPage() {
    const currentOrg = useAuthStore((state) => state.currentOrg);
    const isSecretary = currentOrg?.role === 'secretary';
    const appointments = useAppointmentStore((state) => state.appointments);
    const fetchAppointments = useAppointmentStore((state) => state.fetchAppointments);
    const patients = usePatientStore((state) => state.patients);
    const [today, setToday] = useState('');
    const [stats, setStats] = useState<DashboardStats>({
        todayAppointments: 0,
        totalPatients: 0,
        pendingPayments: 0,
        dailyNetIncome: 0,
    });
    const [pendingTreatments, setPendingTreatments] = useState<PendingTreatment[]>([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingTreatments, setLoadingTreatments] = useState(true);

    // Modals state
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
    const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
    const [appointmentDefaultPatientId, setAppointmentDefaultPatientId] = useState<string | undefined>();
    const [appointmentDefaultTreatmentId, setAppointmentDefaultTreatmentId] = useState<string | undefined>();
    const [cancellingTreatment, setCancellingTreatment] = useState<PendingTreatment | null>(null);

    // Get today's date on client side only to avoid hydration errors
    useEffect(() => {
        setToday(formatLocalDate(new Date()));
    }, []);

    // Fetch dashboard stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoadingStats(true);
                const response = await api.api.dashboardControllerGetStats();
                const data = (response as StandardResponse & { data?: Partial<DashboardStats> }).data;
                setStats({
                    todayAppointments: Number(data?.todayAppointments ?? 0),
                    totalPatients: Number(data?.totalPatients ?? 0),
                    pendingPayments: Number(data?.pendingPayments ?? 0),
                    dailyNetIncome: Number(data?.dailyNetIncome ?? 0),
                });
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
                toast.error('Failed to load dashboard statistics');
            } finally {
                setLoadingStats(false);
            }
        };

        fetchStats();
    }, []);

    // Fetch pending treatments
    useEffect(() => {
        const fetchPending = async () => {
            try {
                setLoadingTreatments(true);
                const response = await api.api.dashboardControllerGetPendingTreatments();
                const data = (response as StandardResponse & { data?: PendingTreatment[] }).data;
                setPendingTreatments(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to fetch pending treatments:', error);
                toast.error('Failed to load pending treatments');
            } finally {
                setLoadingTreatments(false);
            }
        };

        fetchPending();
    }, []);

    // Fetch today's appointments for the list
    useEffect(() => {
        if (today) {
            fetchAppointments(1, 100, today);
        }
    }, [today, fetchAppointments]);

    const todayAppointments = appointments.filter((apt) => apt.date === today);

    const handleCancelTreatment = async (treatment: PendingTreatment) => {
        try {
            await api.api.dashboardControllerCancelPendingTreatment(treatment.id);
            toast.success('Treatment cancelled successfully');
            // Refresh pending treatments
            const response = await api.api.dashboardControllerGetPendingTreatments();
            const data = (response as StandardResponse & { data?: PendingTreatment[] }).data;
            setPendingTreatments(Array.isArray(data) ? data : []);
            // Refresh stats as well
            const statsResponse = await api.api.dashboardControllerGetStats();
            const statsData = (statsResponse as StandardResponse & { data?: Partial<DashboardStats> }).data;
            setStats({
                todayAppointments: Number(statsData?.todayAppointments ?? 0),
                totalPatients: Number(statsData?.totalPatients ?? 0),
                pendingPayments: Number(statsData?.pendingPayments ?? 0),
                dailyNetIncome: Number(statsData?.dailyNetIncome ?? 0),
            });
            setCancellingTreatment(null);
        } catch (error) {
            console.error('Failed to cancel treatment:', error);
            toast.error('Failed to cancel treatment');
        }
    };

    const handleScheduleAppointment = (patientId: string, treatmentId?: string) => {
        setAppointmentDefaultPatientId(patientId);
        setAppointmentDefaultTreatmentId(treatmentId);
        setIsAppointmentModalOpen(true);
    };

    const handleAppointmentCreated = async () => {
        // Refresh appointments and pending treatments
        if (today) {
            await fetchAppointments(1, 100, today);
        }
        const response = await api.api.dashboardControllerGetPendingTreatments();
        const data = (response as StandardResponse & { data?: PendingTreatment[] }).data;
        setPendingTreatments(Array.isArray(data) ? data : []);
        // Refresh stats
        const statsResponse = await api.api.dashboardControllerGetStats();
        const statsData = (statsResponse as StandardResponse & { data?: Partial<DashboardStats> }).data;
        setStats({
            todayAppointments: Number(statsData?.todayAppointments ?? 0),
            totalPatients: Number(statsData?.totalPatients ?? 0),
            pendingPayments: Number(statsData?.pendingPayments ?? 0),
            dailyNetIncome: Number(statsData?.dailyNetIncome ?? 0),
        });
    };

    return (
        <MainLayout title="Dashboard">
            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                <div className={`${styles.statCard} ${styles.animateIn}`}>
                    <div className={styles.statHeader}>
                        <div className={`${styles.statIcon} ${styles.teal}`}>📅</div>
                        <span className={`${styles.statTrend} ${styles.up}`}>Today</span>
                    </div>
                    <div className={styles.statValue}>{loadingStats ? '...' : stats.todayAppointments}</div>
                    <div className={styles.statLabel}>Today&apos;s Appointments</div>
                </div>

                <div className={`${styles.statCard} ${styles.animateIn} ${styles.delay1}`}>
                    <div className={styles.statHeader}>
                        <div className={`${styles.statIcon} ${styles.orange}`}>👥</div>
                        <span className={`${styles.statTrend} ${styles.up}`}>Total</span>
                    </div>
                    <div className={styles.statValue}>{loadingStats ? '...' : stats.totalPatients}</div>
                    <div className={styles.statLabel}>Total Patients</div>
                </div>

                {!isSecretary && (
                    <>
                        <div className={`${styles.statCard} ${styles.animateIn} ${styles.delay2}`}>
                            <div className={styles.statHeader}>
                                <div className={`${styles.statIcon} ${styles.pink}`}>💰</div>
                                <span className={`${styles.statTrend} ${styles.down}`}>Pending</span>
                            </div>
                            <div className={styles.statValue}>
                                {loadingStats ? '...' : `$${(stats.pendingPayments / 1000).toFixed(1)}k`}
                            </div>
                            <div className={styles.statLabel}>Pending Payments</div>
                        </div>

                        <div className={`${styles.statCard} ${styles.animateIn} ${styles.delay3}`}>
                            <div className={styles.statHeader}>
                                <div className={`${styles.statIcon} ${styles.green}`}>💵</div>
                                <span className={`${styles.statTrend} ${stats.dailyNetIncome >= 0 ? styles.up : styles.down}`}>
                                    {stats.dailyNetIncome >= 0 ? '↑' : '↓'} {Math.abs(stats.dailyNetIncome) > 0 ? `$${Math.abs(stats.dailyNetIncome).toFixed(0)}` : '0'}
                                </span>
                            </div>
                            <div className={styles.statValue}>
                                {loadingStats ? '...' : `$${stats.dailyNetIncome.toFixed(0)}`}
                            </div>
                            <div className={styles.statLabel}>Daily Net Income</div>
                        </div>
                    </>
                )}
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
                        {loadingTreatments ? (
                            <div className={styles.emptyPendingState}>
                                <div className={styles.emptyPendingText}>Loading...</div>
                            </div>
                        ) : pendingTreatments.length === 0 ? (
                            <div className={styles.emptyPendingState}>
                                <div className={styles.emptyPendingIcon}>✓</div>
                                <div className={styles.emptyPendingText}>
                                    All treatments scheduled
                                </div>
                                <div className={styles.emptyPendingSubtext}>
                                    No pending treatments waiting for appointments
                                </div>
                            </div>
                        ) : (
                            <div className={styles.pendingTreatmentsList}>
                                {pendingTreatments.slice(0, 4).map((treatment) => {
                                    return (
                                        <div key={treatment.id} className={styles.pendingTreatmentItem}>
                                            <div className={styles.pendingTreatmentInfo}>
                                                <div className={styles.patientAvatar}>
                                                    {treatment.patientFirstName[0]}{treatment.patientLastName[0]}
                                                </div>
                                                <div>
                                                    <div className={styles.pendingPatientName}>
                                                        {treatment.patientFirstName} {treatment.patientLastName}
                                                    </div>
                                                    <div className={styles.pendingTreatmentDetails}>
                                                        {treatment.treatmentTypeName} • ${treatment.totalPrice - treatment.discount}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={styles.pendingTreatmentActions}>
                                                <Badge variant="warning">planned</Badge>
                                                <button
                                                    className={styles.scheduleBtn}
                                                    onClick={() => handleScheduleAppointment(treatment.patientId, treatment.id)}
                                                    title="Schedule Appointment"
                                                >
                                                    Schedule
                                                </button>
                                                <button
                                                    className={styles.cancelBtn}
                                                    onClick={() => setCancellingTreatment(treatment)}
                                                    title="Cancel Treatment"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Sidebar */}
                <div>
                    {/* Quick Actions */}
                    <Card title="Quick Actions" className={styles.marginBottom}>
                        <div className={styles.quickActions}>
                            <button className={styles.quickActionBtn} onClick={() => setIsAppointmentModalOpen(true)}>
                                <div className={styles.quickActionIcon}>📅</div>
                                <span className={styles.quickActionLabel}>New Appointment</span>
                            </button>
                            <button className={styles.quickActionBtn} onClick={() => setIsPatientModalOpen(true)}>
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

            {/* Expense Modal */}
            <ExpenseModal
                isOpen={isExpenseModalOpen}
                onClose={() => setIsExpenseModalOpen(false)}
                onSave={async () => {
                    setIsExpenseModalOpen(false);
                    // Refresh stats
                    const statsResponse = await api.api.dashboardControllerGetStats();
                    const maybeStandard = statsResponse as StandardResponse;
                    const statsData = (maybeStandard.data ?? statsResponse) as DashboardStatsDto;
                    setStats({
                        todayAppointments: statsData?.todayAppointments || 0,
                        totalPatients: statsData?.totalPatients || 0,
                        pendingPayments: statsData?.pendingPayments || 0,
                        dailyNetIncome: statsData?.dailyNetIncome || 0,
                    });
                }}
            />

            {/* Appointment Modal */}
            <AppointmentModal
                isOpen={isAppointmentModalOpen}
                onClose={() => {
                    setIsAppointmentModalOpen(false);
                    setAppointmentDefaultPatientId(undefined);
                    setAppointmentDefaultTreatmentId(undefined);
                    handleAppointmentCreated();
                }}
                defaultPatientId={appointmentDefaultPatientId}
                defaultTreatmentId={appointmentDefaultTreatmentId}
            />

            {/* Patient Modal */}
            <PatientModal
                isOpen={isPatientModalOpen}
                onClose={() => {
                    setIsPatientModalOpen(false);
                }}
            />

            {/* Confirmation Modal for Cancelling Treatment */}
            <ConfirmationModal
                isOpen={!!cancellingTreatment}
                onClose={() => setCancellingTreatment(null)}
                onConfirm={() => {
                    if (cancellingTreatment) {
                        handleCancelTreatment(cancellingTreatment);
                    }
                }}
                title="Cancel Treatment"
                message={`Are you sure you want to cancel the ${cancellingTreatment?.treatmentTypeName} treatment for ${cancellingTreatment?.patientFirstName} ${cancellingTreatment?.patientLastName}?`}
                confirmLabel="Cancel Treatment"
                variant="danger"
            />
        </MainLayout>
    );
}

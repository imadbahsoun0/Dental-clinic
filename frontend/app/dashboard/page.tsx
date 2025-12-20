'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { useAppointmentStore } from '@/store/appointmentStore';
import { usePatientStore } from '@/store/patientStore';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';

export default function DashboardPage() {
    const router = useRouter();
    const appointments = useAppointmentStore((state) => state.appointments);
    const patients = usePatientStore((state) => state.patients);
    const [today, setToday] = useState('');

    // Get today's date on client side only to avoid hydration errors
    useEffect(() => {
        setToday(new Date().toISOString().split('T')[0]);
    }, []);

    const todayAppointments = appointments.filter((apt) => apt.date === today);

    // Calculate stats
    const pendingPayments = 12400; // Dummy value

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

                    {/* Recent Patients */}
                    <Card title="Recent Patients" action={<a href="/patients" className={styles.cardAction}>View All →</a>}>
                        <table className={styles.patientTable}>
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Last Visit</th>
                                    <th>Next Appt</th>
                                    <th>Payment</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patients.slice(0, 3).map((patient) => (
                                    <tr key={patient.id}>
                                        <td>
                                            <div className={styles.patientInfo}>
                                                <div className={styles.patientAvatar}>
                                                    {patient.firstName[0]}{patient.lastName[0]}
                                                </div>
                                                <div>
                                                    <div className={styles.patientName}>
                                                        {patient.firstName} {patient.lastName}
                                                    </div>
                                                    <div className={styles.patientId}>#{patient.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>Dec 10, 2025</td>
                                        <td>Dec 14, 2025</td>
                                        <td>
                                            <Badge variant="success">Paid</Badge>
                                        </td>
                                        <td>
                                            <button className={styles.actionBtn} title="View">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
                        </div>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}

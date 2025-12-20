'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { usePatientStore } from '@/store/patientStore';
import { useRouter } from 'next/navigation';
import styles from './treatments.module.css';

export default function TreatmentsPage() {
    const router = useRouter();
    const patients = usePatientStore((state) => state.patients);

    return (
        <MainLayout title="Treatments">
            <Card title="Select a Patient">
                <p className={styles.description}>
                    Please select a patient to view and manage their treatments.
                </p>
                <div className={styles.patientGrid}>
                    {patients.map((patient) => (
                        <div
                            key={patient.id}
                            className={styles.patientCard}
                            onClick={() => router.push(`/treatments/${patient.id}`)}
                        >
                            <div className={styles.patientAvatar}>
                                {patient.firstName[0]}{patient.lastName[0]}
                            </div>
                            <div className={styles.patientName}>
                                {patient.firstName} {patient.lastName}
                            </div>
                            <div className={styles.patientId}>#{patient.id}</div>
                        </div>
                    ))}
                </div>
            </Card>
        </MainLayout>
    );
}

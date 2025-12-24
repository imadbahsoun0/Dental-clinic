'use client';

import React from 'react';
import { Patient } from '@/types';
import styles from './PatientProfile.module.css';

interface PatientProfileProps {
    patient: Patient;
}

export const PatientProfile: React.FC<PatientProfileProps> = ({ patient }) => {
    return (
        <div className={styles.patientProfile}>
            <div className={styles.row}>
                <div className={styles.field}>
                    <span className={styles.label}>Name:</span>
                    <span className={styles.value}>
                        {patient.firstName} {patient.lastName}
                    </span>
                </div>
                <div className={styles.field}>
                    <span className={styles.label}>ID:</span>
                    <span className={styles.value}>{patient.id}</span>
                </div>
            </div>
            <div className={styles.row}>
                <div className={styles.field}>
                    <span className={styles.label}>Phone:</span>
                    <span className={styles.value}>{patient.phone}</span>
                </div>
                <div className={styles.field}>
                    <span className={styles.label}>Email:</span>
                    <span className={styles.value}>{patient.email}</span>
                </div>
            </div>
            <div className={styles.row}>
                <div className={styles.field}>
                    <span className={styles.label}>Date of Birth:</span>
                    <span className={styles.value}>
                        {new Date(patient.dateOfBirth).toLocaleDateString()}
                    </span>
                </div>
                <div className={styles.field}>
                    <span className={styles.label}>Address:</span>
                    <span className={styles.value}>{patient.address}</span>
                </div>
            </div>
        </div>
    );
};

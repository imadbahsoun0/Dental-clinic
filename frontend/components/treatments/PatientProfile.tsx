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
                    <span className={styles.label}>Phone:</span>
                    <span className={styles.value}>{patient.mobileNumber}</span>
                </div>
            </div>
            <div className={styles.row}>
                <div className={styles.field}>
                    <span className={styles.label}>Email:</span>
                    <span className={styles.value}>{patient.email || '-'}</span>
                </div>
                <div className={styles.field}>
                    <span className={styles.label}>Emergency Contact:</span>
                    <span className={styles.value}>{patient.emergencyContact || patient.medicalHistory?.emergencyContact || '-'}</span>
                </div>
            </div>
            <div className={styles.row}>
                <div className={styles.field}>
                    <span className={styles.label}>Date of Birth:</span>
                    <span className={styles.value}>
                        {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : (patient.medicalHistory?.dateOfBirth ? new Date(patient.medicalHistory.dateOfBirth).toLocaleDateString() : '-')}
                    </span>
                </div>
                <div className={styles.field}>
                    <span className={styles.label}>Blood Type:</span>
                    <span className={styles.value}>{patient.bloodType || patient.medicalHistory?.bloodType || '-'}</span>
                </div>
            </div>
            <div className={styles.row}>
                <div className={styles.field}>
                    <span className={styles.label}>Address:</span>
                    <span className={styles.value}>{patient.address || patient.medicalHistory?.address || '-'}</span>
                </div>
            </div>
        </div>
    );
};

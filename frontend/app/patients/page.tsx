'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { usePatientStore } from '@/store/patientStore';
import styles from './patients.module.css';

export default function PatientsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const patients = usePatientStore((state) => state.patients);
    const addPatient = usePatientStore((state) => state.addPatient);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        mobileNumber: '',
    });

    const handleSubmit = () => {
        if (formData.firstName && formData.lastName && formData.mobileNumber) {
            addPatient(formData);
            setIsModalOpen(false);
            setFormData({ firstName: '', lastName: '', mobileNumber: '' });
            alert('Patient added! Medical history link can be sent via SMS.');
        }
    };

    return (
        <MainLayout title="Patients">
            <div className={styles.pageHeader}>
                <div>
                    <h2 className={styles.pageTitle}>Patient Records</h2>
                    <p className={styles.pageSubtitle}>Manage and view all patient information</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>+ Add New Patient</Button>
            </div>

            <Card className={styles.marginBottom}>
                <div className={styles.filterBar}>
                    <Input
                        type="text"
                        placeholder="Search by name, ID, or phone..."
                        value=""
                        onChange={() => { }}
                    />
                </div>
            </Card>

            <Card>
                <table className={styles.patientTable}>
                    <thead>
                        <tr>
                            <th>Patient</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Date of Birth</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.map((patient) => (
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
                                <td>{patient.mobileNumber}</td>
                                <td>{patient.email || 'N/A'}</td>
                                <td>{patient.dateOfBirth || 'N/A'}</td>
                                <td>
                                    <button className={styles.actionBtn} title="View">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    </button>
                                    <button className={styles.actionBtn} title="Send Medical History Link">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Patient"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit}>Add Patient</Button>
                    </>
                }
            >
                <Input
                    type="text"
                    label="First Name"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={(value) => setFormData({ ...formData, firstName: value })}
                    required
                />
                <Input
                    type="text"
                    label="Last Name"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(value) => setFormData({ ...formData, lastName: value })}
                    required
                />
                <Input
                    type="tel"
                    label="Mobile Number"
                    placeholder="+1 (555) 000-0000"
                    value={formData.mobileNumber}
                    onChange={(value) => setFormData({ ...formData, mobileNumber: value })}
                    required
                />
                <p style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '10px' }}>
                    After adding the patient, you can send them a link to fill out their medical history and date of birth.
                </p>
            </Modal>
        </MainLayout>
    );
}

'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { usePatientStore } from '@/store/patientStore';
import styles from './patients.module.css';

export default function PatientsPage() {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const patients = usePatientStore((state) => state.patients);
    const addPatient = usePatientStore((state) => state.addPatient);
    const updatePatient = usePatientStore((state) => state.updatePatient);
    const deletePatient = usePatientStore((state) => state.deletePatient);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Filter state
    const [searchQuery, setSearchQuery] = useState('');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        mobileNumber: '',
    });

    // Filter and search logic
    const filteredPatients = useMemo(() => {
        return patients.filter((patient) => {
            const searchLower = searchQuery.toLowerCase();
            const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
            const phone = patient.mobileNumber.toLowerCase();
            const email = (patient.email || '').toLowerCase();
            const id = patient.id.toLowerCase();

            return (
                fullName.includes(searchLower) ||
                phone.includes(searchLower) ||
                email.includes(searchLower) ||
                id.includes(searchLower)
            );
        });
    }, [patients, searchQuery]);

    // Pagination logic
    const totalPages = Math.ceil(filteredPatients.length / pageSize);
    const paginatedPatients = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredPatients.slice(startIndex, endIndex);
    }, [filteredPatients, currentPage, pageSize]);

    // Reset to page 1 when filters change
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
    };

    const handlePageSizeChange = (value: string) => {
        setPageSize(parseInt(value));
        setCurrentPage(1);
    };

    const handleViewPatient = (patientId: string) => {
        router.push(`/treatments/${patientId}`);
    };

    const handleDeletePatient = (patientId: string, patientName: string) => {
        if (confirm(`Are you sure you want to delete ${patientName}? This action cannot be undone.`)) {
            deletePatient(patientId);
        }
    };

    const handleTogglePaymentReminders = (patientId: string, currentValue: boolean | undefined, e: React.MouseEvent) => {
        e.stopPropagation();
        updatePatient(patientId, { enablePaymentReminders: !currentValue });
    };

    const handleSubmit = () => {
        if (formData.firstName && formData.lastName && formData.mobileNumber) {
            addPatient(formData);
            setIsModalOpen(false);
            setFormData({ firstName: '', lastName: '', mobileNumber: '' });
            alert('Patient added! Medical history link can be sent via SMS.');
        }
    };

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    return (
        <MainLayout title="Patients">
            <div className={styles.pageHeader}>
                <div>
                    <h2 className={styles.pageTitle}>Patient Records</h2>
                    <p className={styles.pageSubtitle}>
                        {filteredPatients.length} {filteredPatients.length === 1 ? 'patient' : 'patients'} found
                    </p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>+ Add New Patient</Button>
            </div>

            {/* Filters */}
            <Card className={styles.marginBottom}>
                <div className={styles.filterBar}>
                    <div className={styles.searchContainer}>
                        <Input
                            type="text"
                            placeholder="Search by name, ID, phone, or email..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <div className={styles.filterControls}>
                        <div className={styles.pageSizeControl}>
                            <label className={styles.filterLabel}>Show:</label>
                            <Select
                                options={[
                                    { value: '5', label: '5' },
                                    { value: '10', label: '10' },
                                    { value: '25', label: '25' },
                                    { value: '50', label: '50' },
                                    { value: '100', label: '100' },
                                ]}
                                value={String(pageSize)}
                                onChange={handlePageSizeChange}
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Table */}
            <Card>
                {paginatedPatients.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>No patients found matching your search criteria.</p>
                        {searchQuery && (
                            <Button variant="secondary" onClick={() => setSearchQuery('')}>
                                Clear Search
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className={styles.tableWrapper}>
                            <table className={styles.patientTable}>
                                <thead>
                                    <tr>
                                        <th>Patient</th>
                                        <th>Phone</th>
                                        <th>Email</th>
                                        <th>Date of Birth</th>
                                        <th>Payment Reminders</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedPatients.map((patient) => (
                                        <tr
                                            key={patient.id}
                                            onClick={() => handleViewPatient(patient.id)}
                                            className={styles.clickableRow}
                                        >
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
                                                <div
                                                    className={styles.toggleContainer}
                                                    onClick={(e) => handleTogglePaymentReminders(patient.id, patient.enablePaymentReminders, e)}
                                                >
                                                    <div className={`${styles.toggle} ${(patient.enablePaymentReminders ?? true) ? styles.toggleOn : styles.toggleOff}`}>
                                                        <div className={styles.toggleSlider}></div>
                                                    </div>
                                                    <span className={styles.toggleLabel}>
                                                        {(patient.enablePaymentReminders ?? true) ? 'Enabled' : 'Disabled'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.actionButtons}>
                                                    <button
                                                        className={styles.actionBtn}
                                                        title="View Treatments"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewPatient(patient.id);
                                                        }}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                            <circle cx="12" cy="12" r="3" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        className={styles.actionBtn}
                                                        title="Delete Patient"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeletePatient(patient.id, `${patient.firstName} ${patient.lastName}`);
                                                        }}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className={styles.pagination}>
                                <div className={styles.paginationInfo}>
                                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredPatients.length)} of {filteredPatients.length} patients
                                </div>
                                <div className={styles.paginationControls}>
                                    <button
                                        className={styles.paginationBtn}
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </button>
                                    <div className={styles.pageNumbers}>
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }
                                            return (
                                                <button
                                                    key={pageNum}
                                                    className={`${styles.pageNumber} ${currentPage === pageNum ? styles.active : ''}`}
                                                    onClick={() => goToPage(pageNum)}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <button
                                        className={styles.paginationBtn}
                                        onClick={() => goToPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
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

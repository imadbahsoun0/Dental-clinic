'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { usePatientStore } from '@/store/patientStore';
import { PatientModal } from '@/components/patients/PatientModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { MedicalHistoryStatus } from '@/components/patients/MedicalHistoryStatus';
import styles from './patients.module.css';
import toast from 'react-hot-toast';

export default function PatientsPage() {
    const router = useRouter();
    const {
        patients,
        fetchPatients,
        loading,
        total,
        deletePatient,
        updatePatient
    } = usePatientStore();

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPatientId, setEditingPatientId] = useState<string | null>(null);

    // Delete confirmation state
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState<{ id: string; name: string } | null>(null);

    // Pagination & Search state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch patients on mount and when params change
    useEffect(() => {
        // Debounce search could be added here
        const timer = setTimeout(() => {
            fetchPatients(currentPage, pageSize, searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchPatients, currentPage, pageSize, searchQuery]);

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

    const handleViewMedicalHistory = (patientId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        // Get orgId from local storage or auth store if available
        const orgId = localStorage.getItem('dentacare_current_org');
        if (orgId) {
            window.open(`/medical-history/${patientId}?orgId=${orgId}`, '_blank');
        } else {
            toast.error('Organization ID not found');
        }
    };

    const handleAddPatient = () => {
        setEditingPatientId(null);
        setIsModalOpen(true);
    };

    const handleEditPatient = (patientId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingPatientId(patientId);
        setIsModalOpen(true);
    };

    const handleDeletePatient = (patientId: string, patientName: string) => {
        setPatientToDelete({ id: patientId, name: patientName });
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!patientToDelete) return;

        try {
            await deletePatient(patientToDelete.id);
            toast.success('Patient deleted successfully');
            fetchPatients(currentPage, pageSize, searchQuery);
        } catch (e) {
            toast.error('Failed to delete patient');
        } finally {
            setPatientToDelete(null);
        }
    };

    const goToPage = (page: number) => {
        const totalPages = Math.ceil(total / pageSize);
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const totalPages = Math.ceil(total / pageSize);

    return (
        <MainLayout title="Patients">
            <div className={styles.pageHeader}>
                <div>
                    <h2 className={styles.pageTitle}>Patient Records</h2>
                    <p className={styles.pageSubtitle}>
                        {total} {total === 1 ? 'patient' : 'patients'} found
                    </p>
                </div>
                <Button onClick={handleAddPatient}>+ Add New Patient</Button>
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
                {/* Loading State could be added here */}
                {patients.length === 0 && !loading ? (
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
                        {/* Desktop Table View */}
                        <div className={styles.tableWrapper}>
                            <table className={styles.patientTable}>
                                <thead>
                                    <tr>
                                        <th>Patient</th>
                                        <th>Phone</th>
                                        <th>Email</th>
                                        <th>Date of Birth</th>
                                        <th>Medical History</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {patients.map((patient) => (
                                        <tr
                                            key={patient.id}
                                            onClick={() => handleViewPatient(patient.id)}
                                            className={styles.clickableRow}
                                        >
                                            <td>
                                                <div className={styles.patientInfo}>
                                                    <div className={styles.patientAvatar}>
                                                        {patient.firstName?.[0]}{patient.lastName?.[0]}
                                                    </div>
                                                    <div>
                                                        <div className={styles.patientName}>
                                                            {patient.firstName} {patient.lastName}
                                                        </div>
                                                        <div className={styles.patientId}>#{patient.id.slice(0, 8)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{patient.mobileNumber}</td>
                                            <td>{patient.email || 'N/A'}</td>
                                            <td>
                                                {patient.dateOfBirth
                                                    ? new Date(patient.dateOfBirth).toLocaleDateString()
                                                    : 'N/A'}
                                            </td>
                                            <td>
                                                <MedicalHistoryStatus patientId={patient.id} />
                                            </td>
                                            <td>
                                                <div className={styles.actionButtons}>
                                                    <button
                                                        className={styles.actionBtn}
                                                        title="Edit Patient"
                                                        onClick={(e) => handleEditPatient(patient.id, e)}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                        </svg>
                                                    </button>
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
                                                        title="Medical History"
                                                        onClick={(e) => handleViewMedicalHistory(patient.id, e)}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                            <polyline points="14 2 14 8 20 8" />
                                                            <line x1="16" y1="13" x2="8" y2="13" />
                                                            <line x1="16" y1="17" x2="8" y2="17" />
                                                            <polyline points="10 9 9 9 8 9" />
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

                        {/* Mobile Card View */}
                        <div className={styles.mobileCardView}>
                            {patients.map((patient) => (
                                <div
                                    key={patient.id}
                                    className={styles.patientCard}
                                    onClick={() => handleViewPatient(patient.id)}
                                >
                                    <div className={styles.cardHeader}>
                                        <div className={styles.patientInfo}>
                                            <div className={styles.patientAvatar}>
                                                {patient.firstName?.[0]}{patient.lastName?.[0]}
                                            </div>
                                            <div>
                                                <div className={styles.patientName}>
                                                    {patient.firstName} {patient.lastName}
                                                </div>
                                                <div className={styles.patientId}>#{patient.id.slice(0, 8)}</div>
                                            </div>
                                        </div>
                                        <div className={styles.cardActions}>
                                            <button
                                                className={styles.actionBtn}
                                                title="Edit Patient"
                                                onClick={(e) => handleEditPatient(patient.id, e)}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                            </button>
                                            <button
                                                className={styles.actionBtn}
                                                title="Medical History"
                                                onClick={(e) => handleViewMedicalHistory(patient.id, e)}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                    <polyline points="14 2 14 8 20 8" />
                                                    <line x1="16" y1="13" x2="8" y2="13" />
                                                    <line x1="16" y1="17" x2="8" y2="17" />
                                                    <polyline points="10 9 9 9 8 9" />
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
                                    </div>
                                    <div className={styles.cardBody}>
                                        <div className={styles.cardRow}>
                                            <div className={styles.cardLabel}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                                </svg>
                                                Phone
                                            </div>
                                            <div className={styles.cardValue}>{patient.mobileNumber}</div>
                                        </div>
                                        <div className={styles.cardRow}>
                                            <div className={styles.cardLabel}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                                    <polyline points="22,6 12,13 2,6" />
                                                </svg>
                                                Email
                                            </div>
                                            <div className={styles.cardValue}>{patient.email || 'N/A'}</div>
                                        </div>
                                        <div className={styles.cardRow}>
                                            <div className={styles.cardLabel}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                                    <line x1="16" y1="2" x2="16" y2="6" />
                                                    <line x1="8" y1="2" x2="8" y2="6" />
                                                    <line x1="3" y1="10" x2="21" y2="10" />
                                                </svg>
                                                Date of Birth
                                            </div>
                                            <div className={styles.cardValue}>
                                                {patient.dateOfBirth
                                                    ? new Date(patient.dateOfBirth).toLocaleDateString()
                                                    : 'N/A'}
                                            </div>
                                        </div>
                                        <div className={styles.cardRow}>
                                            <div className={styles.cardLabel}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                    <polyline points="14 2 14 8 20 8" />
                                                </svg>
                                                Medical History
                                            </div>
                                            <div className={styles.cardValue}>
                                                <MedicalHistoryStatus patientId={patient.id} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className={styles.pagination}>
                                <div className={styles.paginationInfo}>
                                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, total)} of {total} patients
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

            <PatientModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    // Optional: refresh to get latest data
                    fetchPatients(currentPage, pageSize, searchQuery);
                }}
                patientId={editingPatientId}
            />

            <ConfirmDialog
                isOpen={deleteConfirmOpen}
                onClose={() => {
                    setDeleteConfirmOpen(false);
                    setPatientToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Delete Patient"
                message={`Are you sure you want to delete ${patientToDelete?.name}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                isDestructive={true}
            />
        </MainLayout>
    );
}

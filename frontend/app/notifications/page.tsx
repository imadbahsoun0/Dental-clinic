'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { api } from '@/lib/api';
import { useSettingsStore } from '@/store/settingsStore';
import { MedicalHistoryStatus } from '@/components/patients/MedicalHistoryStatus';
import { Message } from '@/types';
import toast from 'react-hot-toast';
import styles from './notifications.module.css';

interface FollowUpPatient {
    id: string;
    firstName: string;
    lastName: string;
    mobileNumber: string;
    followUpDate: string;
    followUpReason: string;
    followUpStatus: 'pending' | 'completed' | 'cancelled';
}

interface UnpaidPatient {
    id: string;
    firstName: string;
    lastName: string;
    mobileNumber: string;
    totalTreatmentCost: number;
    totalPaid: number;
    remainingBalance: number;
}

interface MissingMedicalHistoryPatient {
    id: string;
    firstName: string;
    lastName: string;
    mobileNumber: string;
    email?: string | null;
    createdAt?: string;
}

type FollowUpStatus = 'pending' | 'completed' | 'cancelled';
type FollowUpStatusFilter = 'all' | FollowUpStatus;

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord => {
    return typeof value === 'object' && value !== null;
};

const getItemsAndTotal = <T,>(response: { success?: boolean; data?: unknown }): { items: T[]; total: number } => {
    if (!response.success) {
        return { items: [], total: 0 };
    }

    const payload = response.data;

    if (Array.isArray(payload)) {
        return { items: payload as unknown as T[], total: payload.length };
    }

    if (isRecord(payload)) {
        const maybeData = payload.data;
        const maybeItems = payload.items;
        const maybeMeta = payload.meta;

        const items = Array.isArray(maybeData)
            ? (maybeData as unknown as T[])
            : Array.isArray(maybeItems)
                ? (maybeItems as unknown as T[])
                : [];

        const total = isRecord(maybeMeta) && typeof maybeMeta.total === 'number'
            ? maybeMeta.total
            : items.length;

        return { items, total };
    }

    return { items: [], total: 0 };
};

export default function NotificationsPage() {
    const [activeTab, setActiveTab] = useState<'follow-ups' | 'unpaid' | 'missing-history'>('follow-ups');
    const [followUps, setFollowUps] = useState<FollowUpPatient[]>([]);
    const [unpaidPatients, setUnpaidPatients] = useState<UnpaidPatient[]>([]);
    const [missingHistoryPatients, setMissingHistoryPatients] = useState<MissingMedicalHistoryPatient[]>([]);
    const [loading, setLoading] = useState(false);
    const [sendingReminder, setSendingReminder] = useState<string | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
    
    const notificationSettings = useSettingsStore((state) => state.notificationSettings);
    
    // Medical history messages
    const [medicalHistoryMessages, setMedicalHistoryMessages] = useState<Message[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<FollowUpStatusFilter>('pending');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        if (activeTab === 'follow-ups') {
            fetchFollowUps();
        } else if (activeTab === 'unpaid') {
            fetchUnpaidPatients();
        } else {
            fetchMissingMedicalHistoryPatients();
        }
    }, [activeTab, searchQuery, statusFilter, startDate, endDate, currentPage, pageSize]);
    
    // Fetch medical history messages when on missing-history tab
    useEffect(() => {
        if (activeTab === 'missing-history' && missingHistoryPatients.length > 0) {
            fetchMedicalHistoryMessages();
        }
    }, [activeTab, missingHistoryPatients.length > 0]);
    
    const fetchMedicalHistoryMessages = async () => {
        try {
            setLoadingMessages(true);
            const response = await api.api.messagesControllerFindAll({
                type: 'medical_history',
            });
            
            if (response.data) {
                const messagesData = (response.data as { data?: Message[] }).data || [];
                setMedicalHistoryMessages(messagesData);
            }
        } catch (error) {
            console.error('Failed to fetch medical history messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    };
    
    const getMessageForPatient = (patientId: string) => {
        return medicalHistoryMessages.find(msg => msg.patientId === patientId);
    };

    const isFollowUpEnabled = notificationSettings.notificationToggles?.follow_up ?? true;
    const isPaymentOverdueEnabled = notificationSettings.notificationToggles?.payment_overdue ?? true;

    const fetchFollowUps = async () => {
        setLoading(true);
        try {
            const query: {
                page: number;
                limit: number;
                search?: string;
                startDate?: string;
                endDate?: string;
                followUpStatus?: FollowUpStatus;
            } = {
                page: currentPage,
                limit: pageSize,
            };

            if (searchQuery.trim() !== '') query.search = searchQuery;
            if (startDate.trim() !== '') query.startDate = startDate;
            if (endDate.trim() !== '') query.endDate = endDate;
            if (statusFilter !== 'all') query.followUpStatus = statusFilter;

            const response = await api.api.patientsControllerGetFollowUps(query);
            const { items, total: totalCount } = getItemsAndTotal<FollowUpPatient>(response);
            setFollowUps(items);
            setTotal(totalCount);
        } catch (error) {
            console.error('Error fetching follow-ups:', error);
            toast.error('Failed to load follow-ups');
            setFollowUps([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnpaidPatients = async () => {
        setLoading(true);
        try {
            const response = await api.api.patientsControllerGetUnpaidPatients({ page: currentPage, limit: pageSize });
            const { items, total: totalCount } = getItemsAndTotal<UnpaidPatient>(response);
            setUnpaidPatients(items);
            setTotal(totalCount);
        } catch (error) {
            console.error('Error fetching unpaid patients:', error);
            toast.error('Failed to load unpaid patients');
            setUnpaidPatients([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    const fetchMissingMedicalHistoryPatients = async () => {
        setLoading(true);
        try {
            const query: { page: number; limit: number; search?: string } = {
                page: currentPage,
                limit: pageSize,
            };
            if (searchQuery.trim() !== '') query.search = searchQuery;

            const response = await api.api.patientsControllerGetPatientsMissingMedicalHistory(query);
            const { items, total: totalCount } = getItemsAndTotal<MissingMedicalHistoryPatient>(response);
            setMissingHistoryPatients(items);
            setTotal(totalCount);
        } catch (error) {
            console.error('Error fetching missing medical history patients:', error);
            toast.error('Failed to load patients missing medical history');
            setMissingHistoryPatients([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    const sendFollowUpReminder = async (patientId: string) => {
        setSendingReminder(patientId);
        try {
            await api.api.patientsControllerSendFollowUpReminder(patientId);
            toast.success('Follow-up reminder sent successfully');
        } catch (error) {
            console.error('Error sending reminder:', error);
            toast.error('Failed to send reminder');
        } finally {
            setSendingReminder(null);
        }
    };

    const sendPaymentReminder = async (patientId: string) => {
        setSendingReminder(patientId);
        try {
            await api.api.patientsControllerSendPaymentOverdueReminder(patientId);
            toast.success('Payment reminder sent successfully');
        } catch (error) {
            console.error('Error sending reminder:', error);
            toast.error('Failed to send reminder');
        } finally {
            setSendingReminder(null);
        }
    };

    const updateFollowUpStatus = async (patientId: string, newStatus: 'pending' | 'completed' | 'cancelled') => {
        setUpdatingStatus(patientId);
        try {
            await api.api.patientsControllerUpdate(patientId, {
                followUpStatus: newStatus,
            });
            toast.success('Follow-up status updated');
            fetchFollowUps(); // Refresh the list
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        } finally {
            setUpdatingStatus(null);
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('pending');
        setStartDate('');
        setEndDate('');
        setCurrentPage(1);
    };

    const handlePageSizeChange = (value: string) => {
        setPageSize(parseInt(value));
        setCurrentPage(1);
    };

    const goToPage = (page: number) => {
        const totalPages = Math.ceil(total / pageSize);
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const totalPages = Math.ceil(total / pageSize);

    // Filter follow-ups client-side (basic filtering since API may not support all filters)
    const filteredFollowUps = followUps.filter((patient) => {
        const matchesSearch = searchQuery === '' || 
            `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            patient.mobileNumber.includes(searchQuery);
        
        return matchesSearch;
    });

    const filteredUnpaidPatients = unpaidPatients.filter((patient) => {
        const matchesSearch = searchQuery === '' || 
            `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            patient.mobileNumber.includes(searchQuery);
        
        return matchesSearch;
    });

    const filteredMissingHistoryPatients = missingHistoryPatients.filter((patient) => {
        const matchesSearch = searchQuery === '' ||
            `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            patient.mobileNumber.includes(searchQuery);

        return matchesSearch;
    });

    return (
        <MainLayout title="Notifications">
            <Card>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'follow-ups' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('follow-ups')}
                    >
                        Follow-ups
                        {activeTab === 'follow-ups' && total > 0 && (
                            <span className={styles.badge}>{total}</span>
                        )}
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'unpaid' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('unpaid')}
                    >
                        Unpaid Patients
                        {activeTab === 'unpaid' && total > 0 && (
                            <span className={styles.badge}>{total}</span>
                        )}
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'missing-history' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('missing-history')}
                    >
                        Medical History Missing
                        {activeTab === 'missing-history' && total > 0 && (
                            <span className={styles.badge}>{total}</span>
                        )}
                    </button>
                </div>

                {/* Filters */}
                <div className={styles.filters}>
                    <div className={styles.filterRow}>
                        <Input
                            type="text"
                            placeholder="Search by name or phone..."
                            value={searchQuery}
                            onChange={setSearchQuery}
                        />
                        
                        {activeTab === 'follow-ups' && (
                            <>
                                <Select
                                    options={[
                                        { value: 'all', label: 'All Statuses' },
                                        { value: 'pending', label: 'Pending' },
                                        { value: 'completed', label: 'Completed' },
                                        { value: 'cancelled', label: 'Cancelled' },
                                    ]}
                                    value={statusFilter}
                                    onChange={(value) => setStatusFilter(value as FollowUpStatusFilter)}
                                />
                                <Input
                                    type="date"
                                    placeholder="Start Date"
                                    value={startDate}
                                    onChange={setStartDate}
                                />
                                <Input
                                    type="date"
                                    placeholder="End Date"
                                    value={endDate}
                                    onChange={setEndDate}
                                />
                            </>
                        )}
                        
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
                        
                        <div className={styles.filterControl}>
                            <Button variant="secondary" onClick={clearFilters}>
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                </div>

                {activeTab === 'follow-ups' && (
                    <div className={styles.tabContent}>
                        {loading ? (
                            <p className={styles.loading}>Loading...</p>
                        ) : filteredFollowUps.length === 0 ? (
                            <p className={styles.emptyState}>No follow-ups found matching your filters</p>
                        ) : (
                            <>
                                {/* Desktop Table View */}
                                <div className={styles.tableContainer}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Patient</th>
                                            <th>Phone</th>
                                            <th>Follow-up Date</th>
                                            <th>Reason</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredFollowUps.map((patient) => (
                                            <tr key={patient.id}>
                                                <td>{`${patient.firstName} ${patient.lastName}`}</td>
                                                <td>{patient.mobileNumber}</td>
                                                <td>
                                                    {patient.followUpDate 
                                                        ? new Date(patient.followUpDate).toLocaleDateString()
                                                        : 'N/A'
                                                    }
                                                </td>
                                                <td>{patient.followUpReason || 'N/A'}</td>
                                                <td>
                                                    <Select
                                                        options={[
                                                            { value: 'pending', label: 'Pending' },
                                                            { value: 'completed', label: 'Completed' },
                                                            { value: 'cancelled', label: 'Cancelled' },
                                                        ]}
                                                        value={patient.followUpStatus}
                                                        onChange={(value) => updateFollowUpStatus(patient.id, value as 'pending' | 'completed' | 'cancelled')}
                                                        disabled={updatingStatus === patient.id}
                                                    />
                                                </td>
                                                <td>
                                                    <Button
                                                        onClick={() => sendFollowUpReminder(patient.id)}
                                                        disabled={sendingReminder === patient.id || !isFollowUpEnabled}
                                                        title={!isFollowUpEnabled ? 'Follow-up notifications are disabled in settings' : undefined}
                                                    >
                                                        {sendingReminder === patient.id ? 'Sending...' : 'Send Reminder'}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className={styles.mobileCardView}>
                                {filteredFollowUps.map((patient) => (
                                    <div key={patient.id} className={styles.notificationCard}>
                                        <div className={styles.notificationCardHeader}>
                                            <div className={styles.notificationCardTitle}>
                                                {`${patient.firstName} ${patient.lastName}`}
                                            </div>
                                        </div>

                                        <div className={styles.notificationCardBody}>
                                            <div className={styles.notificationCardRow}>
                                                <span className={styles.notificationCardLabel}>Phone</span>
                                                <span className={styles.notificationCardValue}>{patient.mobileNumber}</span>
                                            </div>

                                            <div className={styles.notificationCardRow}>
                                                <span className={styles.notificationCardLabel}>Follow-up Date</span>
                                                <span className={styles.notificationCardValue}>
                                                    {patient.followUpDate 
                                                        ? new Date(patient.followUpDate).toLocaleDateString()
                                                        : 'N/A'
                                                    }
                                                </span>
                                            </div>

                                            {patient.followUpReason && (
                                                <div className={styles.notificationCardRow}>
                                                    <span className={styles.notificationCardLabel}>Reason</span>
                                                    <span className={styles.notificationCardValue}>{patient.followUpReason}</span>
                                                </div>
                                            )}

                                            <div className={styles.notificationCardRow}>
                                                <span className={styles.notificationCardLabel}>Status</span>
                                                <Select
                                                    options={[
                                                        { value: 'pending', label: 'Pending' },
                                                        { value: 'completed', label: 'Completed' },
                                                        { value: 'cancelled', label: 'Cancelled' },
                                                    ]}
                                                    value={patient.followUpStatus}
                                                    onChange={(value) => updateFollowUpStatus(patient.id, value as 'pending' | 'completed' | 'cancelled')}
                                                    disabled={updatingStatus === patient.id}
                                                />
                                            </div>
                                        </div>

                                        <div className={styles.notificationCardFooter}>
                                            <Button
                                                onClick={() => sendFollowUpReminder(patient.id)}
                                                disabled={sendingReminder === patient.id || !isFollowUpEnabled}
                                                title={!isFollowUpEnabled ? 'Follow-up notifications are disabled in settings' : undefined}
                                            >
                                                {sendingReminder === patient.id ? 'Sending...' : 'Send Reminder'}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className={styles.pagination}>
                                    <div className={styles.paginationInfo}>
                                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, total)} of {total} follow-ups
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
                    </div>
                )}

                {activeTab === 'unpaid' && (
                    <div className={styles.tabContent}>
                        {loading ? (
                            <p className={styles.loading}>Loading...</p>
                        ) : filteredUnpaidPatients.length === 0 ? (
                            <p className={styles.emptyState}>No unpaid patients found matching your filters</p>
                        ) : (
                            <>
                                {/* Desktop Table View */}
                                <div className={styles.tableContainer}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Patient</th>
                                            <th>Phone</th>
                                            <th>Total Treatment</th>
                                            <th>Total Paid</th>
                                            <th>Remaining</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUnpaidPatients.map((patient) => (
                                            <tr key={patient.id}>
                                                <td>{`${patient.firstName} ${patient.lastName}`}</td>
                                                <td>{patient.mobileNumber}</td>
                                                <td>${patient.totalTreatmentCost?.toFixed(2) || '0.00'}</td>
                                                <td>${patient.totalPaid?.toFixed(2) || '0.00'}</td>
                                                <td className={styles.amount}>
                                                    ${patient.remainingBalance?.toFixed(2) || '0.00'}
                                                </td>
                                                <td>
                                                    <Button
                                                        onClick={() => sendPaymentReminder(patient.id)}
                                                        disabled={sendingReminder === patient.id || !isPaymentOverdueEnabled}
                                                        title={!isPaymentOverdueEnabled ? 'Payment overdue notifications are disabled in settings' : undefined}
                                                    >
                                                        {sendingReminder === patient.id ? 'Sending...' : 'Send Reminder'}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className={styles.mobileCardView}>
                                {filteredUnpaidPatients.map((patient) => (
                                    <div key={patient.id} className={styles.notificationCard}>
                                        <div className={styles.notificationCardHeader}>
                                            <div className={styles.notificationCardTitle}>
                                                {`${patient.firstName} ${patient.lastName}`}
                                            </div>
                                        </div>

                                        <div className={styles.notificationCardBody}>
                                            <div className={styles.notificationCardRow}>
                                                <span className={styles.notificationCardLabel}>Phone</span>
                                                <span className={styles.notificationCardValue}>{patient.mobileNumber}</span>
                                            </div>

                                            <div className={styles.notificationCardRow}>
                                                <span className={styles.notificationCardLabel}>Total Treatment</span>
                                                <span className={styles.notificationCardValue}>
                                                    ${patient.totalTreatmentCost?.toFixed(2) || '0.00'}
                                                </span>
                                            </div>

                                            <div className={styles.notificationCardRow}>
                                                <span className={styles.notificationCardLabel}>Total Paid</span>
                                                <span className={styles.notificationCardValue}>
                                                    ${patient.totalPaid?.toFixed(2) || '0.00'}
                                                </span>
                                            </div>

                                            <div className={styles.notificationCardRow}>
                                                <span className={styles.notificationCardLabel}>Remaining</span>
                                                <span className={`${styles.notificationCardValue} ${styles.amount}`}>
                                                    ${patient.remainingBalance?.toFixed(2) || '0.00'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className={styles.notificationCardFooter}>
                                            <Button
                                                onClick={() => sendPaymentReminder(patient.id)}
                                                disabled={sendingReminder === patient.id || !isPaymentOverdueEnabled}
                                                title={!isPaymentOverdueEnabled ? 'Payment overdue notifications are disabled in settings' : undefined}
                                            >
                                                {sendingReminder === patient.id ? 'Sending...' : 'Send Reminder'}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className={styles.pagination}>
                                    <div className={styles.paginationInfo}>
                                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, total)} of {total} unpaid patients
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
                    </div>
                )}

                {activeTab === 'missing-history' && (
                    <div className={styles.tabContent}>
                        {loading ? (
                            <p className={styles.loading}>Loading...</p>
                        ) : filteredMissingHistoryPatients.length === 0 ? (
                            <p className={styles.emptyState}>No patients found missing medical history</p>
                        ) : (
                            <>
                                {/* Desktop Table View */}
                                <div className={styles.tableContainer}>
                                    <table className={styles.table}>
                                        <thead>
                                            <tr>
                                                <th>Patient</th>
                                                <th>Phone</th>
                                                <th>Email</th>
                                                <th>Reminder</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredMissingHistoryPatients.map((patient) => (
                                                <tr key={patient.id}>
                                                    <td>{`${patient.firstName} ${patient.lastName}`}</td>
                                                    <td>{patient.mobileNumber}</td>
                                                    <td>{patient.email || 'N/A'}</td>
                                                    <td>
                                                        <MedicalHistoryStatus 
                                                            patientId={patient.id}
                                                            message={getMessageForPatient(patient.id)}
                                                            onRefresh={fetchMedicalHistoryMessages}
                                                            loading={loadingMessages}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Card View */}
                                <div className={styles.mobileCardView}>
                                    {filteredMissingHistoryPatients.map((patient) => (
                                        <div key={patient.id} className={styles.notificationCard}>
                                            <div className={styles.notificationCardHeader}>
                                                <div className={styles.notificationCardTitle}>
                                                    {`${patient.firstName} ${patient.lastName}`}
                                                </div>
                                            </div>

                                            <div className={styles.notificationCardBody}>
                                                <div className={styles.notificationCardRow}>
                                                    <span className={styles.notificationCardLabel}>Phone</span>
                                                    <span className={styles.notificationCardValue}>{patient.mobileNumber}</span>
                                                </div>

                                                <div className={styles.notificationCardRow}>
                                                    <span className={styles.notificationCardLabel}>Email</span>
                                                    <span className={styles.notificationCardValue}>{patient.email || 'N/A'}</span>
                                                </div>
                                            </div>

                                            <div className={styles.notificationCardFooter}>
                                                <MedicalHistoryStatus 
                                                    patientId={patient.id}
                                                    message={getMessageForPatient(patient.id)}
                                                    onRefresh={fetchMedicalHistoryMessages}
                                                    loading={loadingMessages}
                                                />
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
                    </div>
                )}
            </Card>
        </MainLayout>
    );
}

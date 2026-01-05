'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { api } from '@/lib/api';
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

export default function NotificationsPage() {
    const [activeTab, setActiveTab] = useState<'follow-ups' | 'unpaid'>('follow-ups');
    const [followUps, setFollowUps] = useState<FollowUpPatient[]>([]);
    const [unpaidPatients, setUnpaidPatients] = useState<UnpaidPatient[]>([]);
    const [loading, setLoading] = useState(false);
    const [sendingReminder, setSendingReminder] = useState<string | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('pending');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        if (activeTab === 'follow-ups') {
            fetchFollowUps();
        } else {
            fetchUnpaidPatients();
        }
    }, [activeTab, searchQuery, statusFilter, startDate, endDate, currentPage, pageSize]);

    const fetchFollowUps = async () => {
        setLoading(true);
        try {
            const response = await api.api.patientsControllerGetFollowUps({ 
                page: currentPage, 
                limit: pageSize, 
                search: searchQuery, 
                startDate, 
                endDate,
                followUpStatus: statusFilter as 'pending' | 'completed' | 'cancelled'
            });
            console.log('Follow-ups API response:', response);
            
            if (response.success) {
                // Check if data is directly an array or nested
                let dataArray: FollowUpPatient[] = [];
                let metaData = { total: 0 };
                
                if (Array.isArray(response.data)) {
                    dataArray = response.data as unknown as FollowUpPatient[];
                } else if (response.data && typeof response.data === 'object') {
                    const dataObj = response.data as any;
                    if (Array.isArray(dataObj.data)) {
                        dataArray = dataObj.data as unknown as FollowUpPatient[];
                        metaData = dataObj.meta || { total: 0 };
                    } else if (Array.isArray(dataObj.items)) {
                        dataArray = dataObj.items as unknown as FollowUpPatient[];
                        metaData = dataObj.meta || { total: 0 };
                    }
                }
                
                console.log('Parsed follow-ups array:', dataArray);
                setFollowUps(dataArray);
                setTotal(metaData.total || 0);
            } else {
                setFollowUps([]);
                setTotal(0);
            }
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
            console.log('Unpaid patients API response:', response);
            
            if (response.success) {
                // Check if data is directly an array or nested
                let dataArray: UnpaidPatient[] = [];
                let metaData = { total: 0 };
                
                if (Array.isArray(response.data)) {
                    dataArray = response.data as unknown as UnpaidPatient[];
                } else if (response.data && typeof response.data === 'object') {
                    // Maybe it's wrapped in another data property
                    const dataObj = response.data as any;
                    if (Array.isArray(dataObj.data)) {
                        dataArray = dataObj.data as unknown as UnpaidPatient[];
                        metaData = dataObj.meta || { total: 0 };
                    } else if (Array.isArray(dataObj.items)) {
                        dataArray = dataObj.items as unknown as UnpaidPatient[];
                        metaData = dataObj.meta || { total: 0 };
                    }
                }
                
                console.log('Parsed unpaid patients array:', dataArray);
                setUnpaidPatients(dataArray);
                setTotal(metaData.total || 0);
            } else {
                setUnpaidPatients([]);
                setTotal(0);
            }
        } catch (error) {
            console.error('Error fetching unpaid patients:', error);
            toast.error('Failed to load unpaid patients');
            setUnpaidPatients([]);
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

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, 'success' | 'warning' | 'danger'> = {
            pending: 'warning',
            completed: 'success',
            cancelled: 'danger',
        };
        return <Badge variant={statusMap[status] || 'warning'}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
    };

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
                                    onChange={setStatusFilter}
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
                                                        disabled={sendingReminder === patient.id}
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
                                                disabled={sendingReminder === patient.id}
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
                                                        disabled={sendingReminder === patient.id}
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
                                                disabled={sendingReminder === patient.id}
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
            </Card>
        </MainLayout>
    );
}

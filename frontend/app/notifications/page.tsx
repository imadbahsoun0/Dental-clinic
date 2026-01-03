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
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        if (activeTab === 'follow-ups') {
            fetchFollowUps();
        } else {
            fetchUnpaidPatients();
        }
    }, [activeTab, searchQuery, statusFilter, startDate, endDate]);

    const fetchFollowUps = async () => {
        setLoading(true);
        try {
            const response = await api.api.patientsControllerGetFollowUps({ page: 1, limit: 100 });
            console.log('Follow-ups API response:', response);
            
            if (response.success) {
                // Check if data is directly an array or nested
                let dataArray: FollowUpPatient[] = [];
                
                if (Array.isArray(response.data)) {
                    dataArray = response.data as unknown as FollowUpPatient[];
                } else if (response.data && typeof response.data === 'object') {
                    // Maybe it's wrapped in another data property
                    const dataObj = response.data as any;
                    if (Array.isArray(dataObj.data)) {
                        dataArray = dataObj.data as unknown as FollowUpPatient[];
                    } else if (Array.isArray(dataObj.items)) {
                        dataArray = dataObj.items as unknown as FollowUpPatient[];
                    }
                }
                
                console.log('Parsed follow-ups array:', dataArray);
                setFollowUps(dataArray);
            } else {
                setFollowUps([]);
            }
        } catch (error) {
            console.error('Error fetching follow-ups:', error);
            toast.error('Failed to load follow-ups');
            setFollowUps([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnpaidPatients = async () => {
        setLoading(true);
        try {
            const response = await api.api.patientsControllerGetUnpaidPatients({ page: 1, limit: 100 });
            console.log('Unpaid patients API response:', response);
            
            if (response.success) {
                // Check if data is directly an array or nested
                let dataArray: UnpaidPatient[] = [];
                
                if (Array.isArray(response.data)) {
                    dataArray = response.data as unknown as UnpaidPatient[];
                } else if (response.data && typeof response.data === 'object') {
                    // Maybe it's wrapped in another data property
                    const dataObj = response.data as any;
                    if (Array.isArray(dataObj.data)) {
                        dataArray = dataObj.data as unknown as UnpaidPatient[];
                    } else if (Array.isArray(dataObj.items)) {
                        dataArray = dataObj.items as unknown as UnpaidPatient[];
                    }
                }
                
                console.log('Parsed unpaid patients array:', dataArray);
                setUnpaidPatients(dataArray);
            } else {
                setUnpaidPatients([]);
            }
        } catch (error) {
            console.error('Error fetching unpaid patients:', error);
            toast.error('Failed to load unpaid patients');
            setUnpaidPatients([]);
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
        setStatusFilter('all');
        setStartDate('');
        setEndDate('');
    };

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
        
        const matchesStatus = statusFilter === 'all' || patient.followUpStatus === statusFilter;
        
        const matchesDateRange = (!startDate || !patient.followUpDate || new Date(patient.followUpDate) >= new Date(startDate)) &&
                                 (!endDate || !patient.followUpDate || new Date(patient.followUpDate) <= new Date(endDate));
        
        return matchesSearch && matchesStatus && matchesDateRange;
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
                        {filteredFollowUps.length > 0 && (
                            <span className={styles.badge}>{filteredFollowUps.length}</span>
                        )}
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'unpaid' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('unpaid')}
                    >
                        Unpaid Patients
                        {filteredUnpaidPatients.length > 0 && (
                            <span className={styles.badge}>{filteredUnpaidPatients.length}</span>
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
                        
                        <Button variant="secondary" onClick={clearFilters}>
                            Clear Filters
                        </Button>
                    </div>
                </div>

                {activeTab === 'follow-ups' && (
                    <div className={styles.tabContent}>
                        {loading ? (
                            <p className={styles.loading}>Loading...</p>
                        ) : filteredFollowUps.length === 0 ? (
                            <p className={styles.emptyState}>No follow-ups found matching your filters</p>
                        ) : (
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
                        )}
                    </div>
                )}
            </Card>
        </MainLayout>
    );
}

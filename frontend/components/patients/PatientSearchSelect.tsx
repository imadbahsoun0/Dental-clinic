import React, { useState, useRef, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import styles from './PatientSearchSelect.module.css';

interface Patient {
    id: string;
    firstName: string;
    lastName: string;
    mobileNumber: string;
}

interface PatientSearchSelectProps {
    value?: string;
    selectedPatient?: Patient | null;
    onChange: (patientId: string, patient: Patient | null) => void;
    error?: string;
    disabled?: boolean;
    required?: boolean;
}

export const PatientSearchSelect: React.FC<PatientSearchSelectProps> = ({
    value,
    selectedPatient,
    onChange,
    error,
    disabled = false,
    required = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(false);
    const [internalSelectedPatient, setInternalSelectedPatient] = useState<Patient | null>(selectedPatient || null);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Sync external selectedPatient prop
    useEffect(() => {
        if (selectedPatient) {
            setInternalSelectedPatient(selectedPatient);
        }
    }, [selectedPatient]);

    // Fetch patient by ID if we have value but no patient details
    useEffect(() => {
        const fetchPatientById = async () => {
            if (value && !internalSelectedPatient) {
                try {
                    const response = await api.api.patientsControllerFindOne(value);
                    const patientData = (response as any).data || response;
                    if (patientData) {
                        setInternalSelectedPatient(patientData);
                    }
                } catch (err) {
                    console.error('Failed to fetch patient:', err);
                }
            }
        };
        fetchPatientById();
    }, [value, internalSelectedPatient]);

    // Search patients with debounce
    const searchPatients = useCallback(async (query: string) => {
        if (!query || query.length < 2) {
            setPatients([]);
            return;
        }

        setLoading(true);
        try {
            const response = await api.api.patientsControllerSearch({ q: query });
            const data = (response as any).data || [];
            setPatients(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to search patients:', err);
            setPatients([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Handle search input change with debounce
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchTerm(query);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            searchPatients(query);
        }, 300);
    };

    // Handle patient selection
    const handleSelect = (patient: Patient) => {
        setInternalSelectedPatient(patient);
        onChange(patient.id, patient);
        setIsOpen(false);
        setSearchTerm('');
        setPatients([]);
    };

    // Handle clear selection
    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setInternalSelectedPatient(null);
        onChange('', null);
        setSearchTerm('');
        setPatients([]);
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus input when dropdown opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    const displayValue = internalSelectedPatient
        ? `${internalSelectedPatient.firstName} ${internalSelectedPatient.lastName}`
        : '';

    return (
        <div className={styles.container} ref={containerRef}>
            <label className={styles.label}>
                Patient {required && <span className={styles.required}>*</span>}
            </label>

            {/* Selected patient display / trigger */}
            <div
                className={`${styles.trigger} ${error ? styles.triggerError : ''} ${disabled ? styles.disabled : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                {internalSelectedPatient ? (
                    <div className={styles.selectedPatient}>
                        <div className={styles.patientInfo}>
                            <span className={styles.patientName}>
                                {internalSelectedPatient.firstName} {internalSelectedPatient.lastName}
                            </span>
                            <span className={styles.patientPhone}>
                                {internalSelectedPatient.mobileNumber}
                            </span>
                        </div>
                        {!disabled && (
                            <button
                                type="button"
                                className={styles.clearButton}
                                onClick={handleClear}
                                aria-label="Clear selection"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className={styles.placeholder}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <span>Search by name or phone...</span>
                    </div>
                )}
                <svg
                    className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.searchBox}>
                        <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            ref={inputRef}
                            type="text"
                            className={styles.searchInput}
                            placeholder="Type name or phone number..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    <div className={styles.results}>
                        {loading ? (
                            <div className={styles.loading}>
                                <div className={styles.spinner}></div>
                                <span>Searching...</span>
                            </div>
                        ) : searchTerm.length < 2 ? (
                            <div className={styles.hint}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="16" x2="12" y2="12"></line>
                                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                </svg>
                                <span>Type at least 2 characters to search</span>
                            </div>
                        ) : patients.length === 0 ? (
                            <div className={styles.noResults}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="8" y1="12" x2="16" y2="12"></line>
                                </svg>
                                <span>No patients found</span>
                                <span className={styles.noResultsHint}>Try a different name or phone number</span>
                            </div>
                        ) : (
                            <div className={styles.patientList}>
                                {patients.map((patient) => (
                                    <div
                                        key={patient.id}
                                        className={`${styles.patientOption} ${patient.id === value ? styles.selected : ''}`}
                                        onClick={() => handleSelect(patient)}
                                    >
                                        <div className={styles.patientAvatar}>
                                            {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                                        </div>
                                        <div className={styles.patientDetails}>
                                            <span className={styles.patientOptionName}>
                                                {patient.firstName} {patient.lastName}
                                            </span>
                                            <span className={styles.patientOptionPhone}>
                                                {patient.mobileNumber}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {error && <span className={styles.error}>{error}</span>}
        </div>
    );
};

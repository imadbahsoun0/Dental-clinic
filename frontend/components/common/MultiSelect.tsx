'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './MultiSelect.module.css';

export interface MultiSelectOption {
    value: number | string;
    label: string;
    group?: string;
}

interface MultiSelectProps {
    label?: string;
    options: MultiSelectOption[];
    value: (number | string)[];
    onChange: (value: (number | string)[]) => void;
    placeholder?: string;
    groupBy?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
    label,
    options,
    value,
    onChange,
    placeholder = 'Select...',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value.toString().includes(searchTerm)
    );

    const handleToggle = (optionValue: number | string) => {
        if (value.includes(optionValue)) {
            onChange(value.filter(v => v !== optionValue));
        } else {
            onChange([...value, optionValue]);
        }
    };

    const handleRemove = (optionValue: number | string) => {
        onChange(value.filter(v => v !== optionValue));
    };

    const getSelectedLabels = () => {
        return value.map(v => {
            const option = options.find(opt => opt.value === v);
            return option?.label || v.toString();
        });
    };

    return (
        <div className={styles.container} ref={containerRef}>
            {label && <label className={styles.label}>{label}</label>}

            <div className={styles.selectBox} onClick={() => setIsOpen(!isOpen)}>
                <div className={styles.selectedItems}>
                    {value.length === 0 ? (
                        <span className={styles.placeholder}>{placeholder}</span>
                    ) : (
                        <div className={styles.tags}>
                            {value.map(v => {
                                const option = options.find(opt => opt.value === v);
                                return (
                                    <span key={v} className={styles.tag}>
                                        {option?.value || v}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemove(v);
                                            }}
                                            className={styles.tagRemove}
                                        >
                                            ×
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    )}
                </div>
                <span className={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
            </div>

            {isOpen && (
                <div className={styles.dropdown}>
                    <input
                        type="text"
                        className={styles.search}
                        placeholder="Search teeth..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className={styles.options}>
                        {filteredOptions.length === 0 ? (
                            <div className={styles.noResults}>No teeth found</div>
                        ) : (
                            filteredOptions.map(option => (
                                <div
                                    key={option.value}
                                    className={`${styles.option} ${value.includes(option.value) ? styles.selected : ''}`}
                                    onClick={() => handleToggle(option.value)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={value.includes(option.value)}
                                        onChange={() => { }}
                                        className={styles.checkbox}
                                    />
                                    <span>{option.label}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

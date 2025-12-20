import React, { useState, useRef, useEffect } from 'react';
import { SelectProps } from '@/types';
import styles from './Select.module.css';

export const Select: React.FC<SelectProps> = ({
    options,
    value,
    onChange,
    label,
    placeholder = 'Select...',
    searchable = false,
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const selectRef = useRef<HTMLDivElement>(null);

    const filteredOptions = searchable
        ? options.filter((option) =>
            option.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : options;

    const selectedOption = options.find((opt) => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className={styles.selectContainer} ref={selectRef}>
            {label && <label className={styles.selectLabel}>{label}</label>}
            <div
                className={`${styles.selectTrigger} ${className}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={selectedOption ? styles.selectedValue : styles.placeholder}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
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
            {isOpen && (
                <div className={styles.dropdown}>
                    {searchable && (
                        <div className={styles.searchBox}>
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    )}
                    <div className={styles.optionsList}>
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className={`${styles.option} ${option.value === value ? styles.optionSelected : ''
                                        }`}
                                    onClick={() => handleSelect(option.value)}
                                >
                                    {option.label}
                                </div>
                            ))
                        ) : (
                            <div className={styles.noOptions}>No options found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

import React from 'react';
import { InputProps } from '@/types';
import styles from './Input.module.css';

export const Input: React.FC<InputProps> = ({
    type = 'text',
    placeholder,
    value,
    onChange,
    label,
    required = false,
    error,
    className = '',
}) => {
    return (
        <div className={styles.formGroup}>
            {label && (
                <label className={styles.formLabel}>
                    {label}
                    {required && <span className={styles.required}>*</span>}
                </label>
            )}
            <input
                type={type}
                className={`${styles.formInput} ${error ? styles.error : ''} ${className}`}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
            />
            {error && <span className={styles.errorMessage}>{error}</span>}
        </div>
    );
};

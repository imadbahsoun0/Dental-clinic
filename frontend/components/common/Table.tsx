'use client';

import React from 'react';
import { Button } from './Button';
import styles from './Table.module.css';

export interface TableColumn<T> {
    key: string;
    label: string;
    render?: (item: T) => React.ReactNode;
}

export interface TableAction<T> {
    label: string | ((item: T) => React.ReactNode);
    onClick: (item: T) => void;
    variant?: 'primary' | 'secondary' | 'danger' | ((item: T) => 'primary' | 'secondary' | 'danger');
}

interface TableProps<T> {
    columns: TableColumn<T>[];
    data: T[];
    actions?: TableAction<T>[];
    emptyMessage?: string;
}

export function Table<T extends Record<string, any>>({
    columns,
    data,
    actions,
    emptyMessage = 'No data available'
}: TableProps<T>) {
    return (
        <div className={styles.tableContainer}>
            {data.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>{emptyMessage}</p>
                </div>
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            {columns.map((column) => (
                                <th key={column.key}>{column.label}</th>
                            ))}
                            {actions && actions.length > 0 && (
                                <th className={styles.actionsHeader}>Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={item.id || index}>
                                {columns.map((column) => (
                                    <td key={column.key}>
                                        {column.render
                                            ? column.render(item)
                                            : item[column.key]
                                        }
                                    </td>
                                ))}
                                {actions && actions.length > 0 && (
                                    <td className={styles.actionsCell}>
                                        <div className={styles.actions}>
                                            {actions.map((action, actionIndex) => {
                                                const variant = typeof action.variant === 'function' ? action.variant(item) : (action.variant || 'secondary');
                                                const label = typeof action.label === 'function' ? action.label(item) : action.label;
                                                return (
                                                    <Button
                                                        key={actionIndex}
                                                        variant={variant}
                                                        size="sm"
                                                        onClick={() => action.onClick(item)}
                                                    >
                                                        {label}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

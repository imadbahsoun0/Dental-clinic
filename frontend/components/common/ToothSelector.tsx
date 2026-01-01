'use client';

import React, { useState } from 'react';
import styles from './ToothSelector.module.css';

interface ToothSelectorProps {
    selectedTeeth: number[];
    onChange: (teeth: number[]) => void;
    label?: string;
}

// FDI notation quadrants (permanent)
const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11]; // Quadrant 1
const UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28]; // Quadrant 2
const LOWER_LEFT = [38, 37, 36, 35, 34, 33, 32, 31]; // Quadrant 3
const LOWER_RIGHT = [41, 42, 43, 44, 45, 46, 47, 48]; // Quadrant 4

// Primary/deciduous dentition (FDI 5-8 x 1-5)
const UPPER_RIGHT_CHILD = [55, 54, 53, 52, 51]; // Quadrant 5
const UPPER_LEFT_CHILD = [61, 62, 63, 64, 65]; // Quadrant 6
const LOWER_LEFT_CHILD = [75, 74, 73, 72, 71]; // Quadrant 7
const LOWER_RIGHT_CHILD = [81, 82, 83, 84, 85]; // Quadrant 8

const getToothType = (toothNumber: number): string => {
    const quadrant = Math.floor(toothNumber / 10);
    const pos = toothNumber % 10;
    // Primary dentition (positions 1-5)
    if (quadrant >= 5) {
        if (pos === 1 || pos === 2) return 'incisor';
        if (pos === 3) return 'canine';
        return 'molar';
    }

    // Permanent dentition
    if (pos === 1 || pos === 2) return 'incisor';
    if (pos === 3) return 'canine';
    if (pos === 4 || pos === 5) return 'premolar';
    if (pos === 6 || pos === 7) return 'molar';
    if (pos === 8) return 'wisdom';
    return 'molar';
};

const getToothName = (toothNumber: number): string => {
    const quadrant = Math.floor(toothNumber / 10);
    const position = toothNumber % 10;

    const quadrantNames: { [key: number]: string } = {
        1: 'Upper Right',
        2: 'Upper Left',
        3: 'Lower Left',
        4: 'Lower Right',
        5: 'Upper Right (Primary)',
        6: 'Upper Left (Primary)',
        7: 'Lower Left (Primary)',
        8: 'Lower Right (Primary)',
    };

    const permanentNames: { [key: number]: string } = {
        1: 'Central Incisor',
        2: 'Lateral Incisor',
        3: 'Canine',
        4: 'First Premolar',
        5: 'Second Premolar',
        6: 'First Molar',
        7: 'Second Molar',
        8: 'Third Molar (Wisdom)',
    };

    const primaryNames: { [key: number]: string } = {
        1: 'Central Incisor',
        2: 'Lateral Incisor',
        3: 'Canine',
        4: 'First Molar (Primary)',
        5: 'Second Molar (Primary)',
    };

    const name = quadrant >= 5 ? (primaryNames[position] || '') : (permanentNames[position] || '');
    return `${toothNumber} - ${quadrantNames[quadrant] || 'Tooth'} ${name}`;
};

export const ToothSelector: React.FC<ToothSelectorProps> = ({
    selectedTeeth,
    onChange,
    label = 'Select Teeth',
}) => {
    const [hoveredTooth, setHoveredTooth] = useState<number | null>(null);
    const [dentition, setDentition] = useState<'adult' | 'child'>('adult');

    const toggleTooth = (toothNumber: number) => {
        if (selectedTeeth.includes(toothNumber)) {
            onChange(selectedTeeth.filter(t => t !== toothNumber));
        } else {
            onChange([...selectedTeeth, toothNumber]);
        }
    };

    const selectQuadrant = (quadrant: number[]) => {
        const allSelected = quadrant.every(tooth => selectedTeeth.includes(tooth));
        if (allSelected) {
            // Deselect all in quadrant
            onChange(selectedTeeth.filter(t => !quadrant.includes(t)));
        } else {
            // Select all in quadrant
            const newSelection = [...selectedTeeth];
            quadrant.forEach(tooth => {
                if (!newSelection.includes(tooth)) {
                    newSelection.push(tooth);
                }
            });
            onChange(newSelection);
        }
    };

    const selectAll = () => {
        const allTeeth = dentition === 'adult'
            ? [...UPPER_RIGHT, ...UPPER_LEFT, ...LOWER_LEFT, ...LOWER_RIGHT]
            : [...UPPER_RIGHT_CHILD, ...UPPER_LEFT_CHILD, ...LOWER_LEFT_CHILD, ...LOWER_RIGHT_CHILD];
        const allSet = allTeeth.every(t => selectedTeeth.includes(t));
        if (allSet) onChange([]);
        else {
            // Remove any selected teeth not in current dentition
            const newSelection = Array.from(new Set([...selectedTeeth.filter(t => allTeeth.includes(t)), ...allTeeth]));
            onChange(newSelection);
        }
    };

    const renderTooth = (toothNumber: number) => {
        const isSelected = selectedTeeth.includes(toothNumber);
        const isHovered = hoveredTooth === toothNumber;
        const toothType = getToothType(toothNumber);
        
        return (
            <button
                key={toothNumber}
                type="button"
                className={`${styles.tooth} ${styles[toothType]} ${isSelected ? styles.selected : ''} ${isHovered ? styles.hovered : ''}`}
                onClick={() => toggleTooth(toothNumber)}
                onMouseEnter={() => setHoveredTooth(toothNumber)}
                onMouseLeave={() => setHoveredTooth(null)}
                title={getToothName(toothNumber)}
            >
                <span className={styles.toothNumber}>{toothNumber}</span>
            </button>
        );
    };

    return (
        <div className={`${styles.toothSelectorContainer} ${dentition === 'child' ? styles.childDentition : ''}`}>
            <div className={styles.header}>
                <label className={styles.label}>{label}</label>
                <div className={styles.dentitionToggle} role="tablist">
                    <button
                        type="button"
                        className={`${styles.toggleButton} ${dentition === 'adult' ? styles.activeToggle : ''}`}
                        onClick={() => setDentition('adult')}
                        aria-pressed={dentition === 'adult'}
                    >
                        Adult
                    </button>
                    <button
                        type="button"
                        className={`${styles.toggleButton} ${dentition === 'child' ? styles.activeToggle : ''}`}
                        onClick={() => setDentition('child')}
                        aria-pressed={dentition === 'child'}
                    >
                        Child
                    </button>
                </div>
                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.actionButton}
                        onClick={selectAll}
                    >
                        { /* dynamic label based on dentition */ }
                        {dentition === 'adult' ? (selectedTeeth.filter(t => t >= 11 && t <= 48).length === 32 ? 'Deselect All' : 'Select All') : (selectedTeeth.filter(t => String(t).startsWith('5') || String(t).startsWith('6') || String(t).startsWith('7') || String(t).startsWith('8')).length === 20 ? 'Deselect All' : 'Select All')}
                    </button>
                    {selectedTeeth.length > 0 && (
                        <button
                            type="button"
                            className={styles.clearButton}
                            onClick={() => onChange([])}
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.dentalChart}>
                {/* Upper Jaw */}
                <div className={styles.upperJaw}>
                    <div className={styles.quadrant}>
                        <button
                            type="button"
                            className={styles.quadrantLabel}
                            onClick={() => selectQuadrant(dentition === 'adult' ? UPPER_RIGHT : UPPER_RIGHT_CHILD)}
                            title="Click to select/deselect entire quadrant"
                        >
                            Upper Right
                        </button>
                        <div className={styles.teethRow}>
                            {(dentition === 'adult' ? UPPER_RIGHT : UPPER_RIGHT_CHILD).map(renderTooth)}
                        </div>
                    </div>
                    <div className={styles.centerLine}></div>
                    <div className={styles.quadrant}>
                        <button
                            type="button"
                            className={styles.quadrantLabel}
                            onClick={() => selectQuadrant(dentition === 'adult' ? UPPER_LEFT : UPPER_LEFT_CHILD)}
                            title="Click to select/deselect entire quadrant"
                        >
                            Upper Left
                        </button>
                        <div className={styles.teethRow}>
                            {(dentition === 'adult' ? UPPER_LEFT : UPPER_LEFT_CHILD).map(renderTooth)}
                        </div>
                    </div>
                </div>

                {/* Jaw Separator */}
                <div className={styles.jawSeparator}></div>

                {/* Lower Jaw */}
                <div className={styles.lowerJaw}>
                    <div className={styles.quadrant}>
                        <div className={styles.teethRow}>
                            {(dentition === 'adult' ? LOWER_RIGHT : LOWER_RIGHT_CHILD).map(renderTooth)}
                        </div>
                        <button
                            type="button"
                            className={styles.quadrantLabel}
                            onClick={() => selectQuadrant(dentition === 'adult' ? LOWER_RIGHT : LOWER_RIGHT_CHILD)}
                            title="Click to select/deselect entire quadrant"
                        >
                            Lower Right
                        </button>
                    </div>
                    <div className={styles.centerLine}></div>
                    <div className={styles.quadrant}>
                        <div className={styles.teethRow}>
                            {(dentition === 'adult' ? LOWER_LEFT : LOWER_LEFT_CHILD).map(renderTooth)}
                        </div>
                        <button
                            type="button"
                            className={styles.quadrantLabel}
                            onClick={() => selectQuadrant(dentition === 'adult' ? LOWER_LEFT : LOWER_LEFT_CHILD)}
                            title="Click to select/deselect entire quadrant"
                        >
                            Lower Left
                        </button>
                    </div>
                </div>
            </div>

            {/* Tooltip for hovered tooth */}
            {hoveredTooth && (
                <div className={styles.tooltip}>
                    {getToothName(hoveredTooth)}
                </div>
            )}

            {/* Selected teeth summary */}
            {selectedTeeth.length > 0 && (
                <div className={styles.summary}>
                    <strong>{selectedTeeth.length}</strong> {selectedTeeth.length === 1 ? 'tooth' : 'teeth'} selected:
                    <span className={styles.selectedList}>
                        {selectedTeeth.sort((a, b) => a - b).join(', ')}
                    </span>
                </div>
            )}
        </div>
    );
};

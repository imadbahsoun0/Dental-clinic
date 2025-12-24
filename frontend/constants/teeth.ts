// Teeth numbering systems and constants

export interface ToothOption {
    value: number;
    label: string;
    type: 'adult' | 'child';
}

// Adult teeth (Permanent dentition) - FDI notation (11-48)
// Quadrants: 1 (upper right), 2 (upper left), 3 (lower left), 4 (lower right)
export const ADULT_TEETH: ToothOption[] = [
    // Upper Right (Quadrant 1)
    { value: 11, label: '11 - Upper Right Central Incisor', type: 'adult' },
    { value: 12, label: '12 - Upper Right Lateral Incisor', type: 'adult' },
    { value: 13, label: '13 - Upper Right Canine', type: 'adult' },
    { value: 14, label: '14 - Upper Right First Premolar', type: 'adult' },
    { value: 15, label: '15 - Upper Right Second Premolar', type: 'adult' },
    { value: 16, label: '16 - Upper Right First Molar', type: 'adult' },
    { value: 17, label: '17 - Upper Right Second Molar', type: 'adult' },
    { value: 18, label: '18 - Upper Right Third Molar (Wisdom)', type: 'adult' },

    // Upper Left (Quadrant 2)
    { value: 21, label: '21 - Upper Left Central Incisor', type: 'adult' },
    { value: 22, label: '22 - Upper Left Lateral Incisor', type: 'adult' },
    { value: 23, label: '23 - Upper Left Canine', type: 'adult' },
    { value: 24, label: '24 - Upper Left First Premolar', type: 'adult' },
    { value: 25, label: '25 - Upper Left Second Premolar', type: 'adult' },
    { value: 26, label: '26 - Upper Left First Molar', type: 'adult' },
    { value: 27, label: '27 - Upper Left Second Molar', type: 'adult' },
    { value: 28, label: '28 - Upper Left Third Molar (Wisdom)', type: 'adult' },

    // Lower Left (Quadrant 3)
    { value: 31, label: '31 - Lower Left Central Incisor', type: 'adult' },
    { value: 32, label: '32 - Lower Left Lateral Incisor', type: 'adult' },
    { value: 33, label: '33 - Lower Left Canine', type: 'adult' },
    { value: 34, label: '34 - Lower Left First Premolar', type: 'adult' },
    { value: 35, label: '35 - Lower Left Second Premolar', type: 'adult' },
    { value: 36, label: '36 - Lower Left First Molar', type: 'adult' },
    { value: 37, label: '37 - Lower Left Second Molar', type: 'adult' },
    { value: 38, label: '38 - Lower Left Third Molar (Wisdom)', type: 'adult' },

    // Lower Right (Quadrant 4)
    { value: 41, label: '41 - Lower Right Central Incisor', type: 'adult' },
    { value: 42, label: '42 - Lower Right Lateral Incisor', type: 'adult' },
    { value: 43, label: '43 - Lower Right Canine', type: 'adult' },
    { value: 44, label: '44 - Lower Right First Premolar', type: 'adult' },
    { value: 45, label: '45 - Lower Right Second Premolar', type: 'adult' },
    { value: 46, label: '46 - Lower Right First Molar', type: 'adult' },
    { value: 47, label: '47 - Lower Right Second Molar', type: 'adult' },
    { value: 48, label: '48 - Lower Right Third Molar (Wisdom)', type: 'adult' },
];

// Child teeth (Primary/Deciduous dentition) - FDI notation (51-85)
// Quadrants: 5 (upper right), 6 (upper left), 7 (lower left), 8 (lower right)
export const CHILD_TEETH: ToothOption[] = [
    // Upper Right (Quadrant 5)
    { value: 51, label: '51 - Upper Right Central Incisor (Baby)', type: 'child' },
    { value: 52, label: '52 - Upper Right Lateral Incisor (Baby)', type: 'child' },
    { value: 53, label: '53 - Upper Right Canine (Baby)', type: 'child' },
    { value: 54, label: '54 - Upper Right First Molar (Baby)', type: 'child' },
    { value: 55, label: '55 - Upper Right Second Molar (Baby)', type: 'child' },

    // Upper Left (Quadrant 6)
    { value: 61, label: '61 - Upper Left Central Incisor (Baby)', type: 'child' },
    { value: 62, label: '62 - Upper Left Lateral Incisor (Baby)', type: 'child' },
    { value: 63, label: '63 - Upper Left Canine (Baby)', type: 'child' },
    { value: 64, label: '64 - Upper Left First Molar (Baby)', type: 'child' },
    { value: 65, label: '65 - Upper Left Second Molar (Baby)', type: 'child' },

    // Lower Left (Quadrant 7)
    { value: 71, label: '71 - Lower Left Central Incisor (Baby)', type: 'child' },
    { value: 72, label: '72 - Lower Left Lateral Incisor (Baby)', type: 'child' },
    { value: 73, label: '73 - Lower Left Canine (Baby)', type: 'child' },
    { value: 74, label: '74 - Lower Left First Molar (Baby)', type: 'child' },
    { value: 75, label: '75 - Lower Left Second Molar (Baby)', type: 'child' },

    // Lower Right (Quadrant 8)
    { value: 81, label: '81 - Lower Right Central Incisor (Baby)', type: 'child' },
    { value: 82, label: '82 - Lower Right Lateral Incisor (Baby)', type: 'child' },
    { value: 83, label: '83 - Lower Right Canine (Baby)', type: 'child' },
    { value: 84, label: '84 - Lower Right First Molar (Baby)', type: 'child' },
    { value: 85, label: '85 - Lower Right Second Molar (Baby)', type: 'child' },
];

// All teeth combined
export const ALL_TEETH: ToothOption[] = [...ADULT_TEETH, ...CHILD_TEETH];

// Helper to get tooth label by number
export const getToothLabel = (toothNumber: number): string => {
    const tooth = ALL_TEETH.find(t => t.value === toothNumber);
    return tooth?.label || `Tooth ${toothNumber}`;
};

// Helper to format tooth numbers for display
export const formatToothNumbers = (numbers: number[]): string => {
    if (numbers.length === 0) return '';
    if (numbers.length === 1) return numbers[0].toString();

    // Sort numbers
    const sorted = [...numbers].sort((a, b) => a - b);

    // Group consecutive numbers into ranges
    const ranges: string[] = [];
    let rangeStart = sorted[0];
    let rangeEnd = sorted[0];

    for (let i = 1; i <= sorted.length; i++) {
        if (i < sorted.length && sorted[i] === rangeEnd + 1) {
            rangeEnd = sorted[i];
        } else {
            if (rangeStart === rangeEnd) {
                ranges.push(rangeStart.toString());
            } else if (rangeEnd === rangeStart + 1) {
                ranges.push(`${rangeStart}, ${rangeEnd}`);
            } else {
                ranges.push(`${rangeStart}-${rangeEnd}`);
            }
            if (i < sorted.length) {
                rangeStart = sorted[i];
                rangeEnd = sorted[i];
            }
        }
    }

    return ranges.join(', ');
};

// Dental tooth number to name mapping (FDI notation)
export const toothMapping: Record<number, string> = {
    // Upper Right Quadrant (1)
    18: 'Upper Right Third Molar (Wisdom)',
    17: 'Upper Right Second Molar',
    16: 'Upper Right First Molar',
    15: 'Upper Right Second Premolar',
    14: 'Upper Right First Premolar',
    13: 'Upper Right Canine',
    12: 'Upper Right Lateral Incisor',
    11: 'Upper Right Central Incisor',

    // Upper Left Quadrant (2)
    21: 'Upper Left Central Incisor',
    22: 'Upper Left Lateral Incisor',
    23: 'Upper Left Canine',
    24: 'Upper Left First Premolar',
    25: 'Upper Left Second Premolar',
    26: 'Upper Left First Molar',
    27: 'Upper Left Second Molar',
    28: 'Upper Left Third Molar (Wisdom)',

    // Lower Left Quadrant (3)
    38: 'Lower Left Third Molar (Wisdom)',
    37: 'Lower Left Second Molar',
    36: 'Lower Left First Molar',
    35: 'Lower Left Second Premolar',
    34: 'Lower Left First Premolar',
    33: 'Lower Left Canine',
    32: 'Lower Left Lateral Incisor',
    31: 'Lower Left Central Incisor',

    // Lower Right Quadrant (4)
    41: 'Lower Right Central Incisor',
    42: 'Lower Right Lateral Incisor',
    43: 'Lower Right Canine',
    44: 'Lower Right First Premolar',
    45: 'Lower Right Second Premolar',
    46: 'Lower Right First Molar',
    47: 'Lower Right Second Molar',
    48: 'Lower Right Third Molar (Wisdom)',
};

// Reverse mapping (name to number)
export const toothNameToNumber: Record<string, number> = Object.entries(toothMapping).reduce(
    (acc, [num, name]) => {
        acc[name] = parseInt(num);
        return acc;
    },
    {} as Record<string, number>
);

// Get tooth name by number
export const getToothName = (toothNumber: number): string => {
    return toothMapping[toothNumber] || '';
};

// Get tooth number by name
export const getToothNumber = (toothName: string): number | null => {
    return toothNameToNumber[toothName] || null;
};

// Get all tooth options for dropdown
export const getToothOptions = () => {
    return Object.entries(toothMapping).map(([num, name]) => ({
        value: num,
        label: `#${num} - ${name}`,
    }));
};

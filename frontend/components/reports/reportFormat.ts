export type IncomeGroupBy = 'day' | 'month';

export type BarDatum = {
    label: string;
    value: number;
};

export const asNumber = (value: unknown): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const n = Number(value);
        return Number.isFinite(n) ? n : 0;
    }
    return 0;
};

export const currency = (value: number): string => {
    const rounded = Math.round(value * 100) / 100;
    return `$${rounded.toFixed(2)}`;
};

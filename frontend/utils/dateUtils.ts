/**
 * Format a date as YYYY-MM-DD in local timezone
 */
export const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Parse a date string (YYYY-MM-DD) and return Date object at local midnight
 */
export const parseLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

/**
 * Normalize any date input to YYYY-MM-DD local format
 */
export const normalizeDate = (date: string | Date): string => {
    if (typeof date === 'string') {
        // If it's already YYYY-MM-DD format, return as is
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date;
        }
        // If it's ISO string, parse and format locally
        const parsed = new Date(date);
        return formatLocalDate(parsed);
    }
    return formatLocalDate(date);
};
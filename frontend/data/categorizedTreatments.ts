import { TreatmentCategory, AppointmentType, PriceVariant } from '@/types';

export const treatmentCategories: TreatmentCategory[] = [
    { id: 'cat-1', name: 'Preventive Dentistry', icon: '🦷', order: 1 },
    { id: 'cat-2', name: 'Restorative Dentistry', icon: '🪥', order: 2 },
    { id: 'cat-3', name: 'Endodontics (Root Canal Treatments)', icon: '🦷', order: 3 },
    { id: 'cat-4', name: 'Prosthodontics (Replacing Missing Teeth)', icon: '😁', order: 4 },
    { id: 'cat-5', name: 'Periodontics (Gum Treatments)', icon: '🦷', order: 5 },
    { id: 'cat-6', name: 'Orthodontics (Teeth Alignment)', icon: '😬', order: 6 },
    { id: 'cat-7', name: 'Cosmetic Dentistry', icon: '😄', order: 7 },
    { id: 'cat-8', name: 'Oral & Maxillofacial Surgery', icon: '🦷', order: 8 },
    { id: 'cat-9', name: 'Pediatric Dentistry (Children)', icon: '🧒', order: 9 },
    { id: 'cat-10', name: 'Dental Implants', icon: '🦷', order: 10 },
    { id: 'cat-11', name: 'Emergency Dentistry', icon: '😷', order: 11 },
    { id: 'cat-12', name: 'Diagnostic & Supportive Procedures', icon: '🧪', order: 12 },
];

// Helper function to create a simple single-price variant
const createSinglePriceVariant = (price: number): PriceVariant[] => [{
    id: `var-${Date.now()}-${Math.random()}`,
    toothSpec: '1-32',
    toothNumbers: Array.from({ length: 32 }, (_, i) => i + 1),
    price,
    label: 'All teeth'
}];

// Helper function to create tooth-range variants
const createToothRangeVariants = (ranges: { spec: string; numbers: number[]; price: number; label: string }[]): PriceVariant[] =>
    ranges.map((r, i) => ({
        id: `var-${Date.now()}-${i}`,
        toothSpec: r.spec,
        toothNumbers: r.numbers,
        price: r.price,
        label: r.label
    }));

export const categorizedAppointmentTypes: AppointmentType[] = [
    // Preventive Dentistry
    { id: 'apt-1', categoryId: 'cat-1', name: 'Dental examination / oral check-up', priceVariants: createSinglePriceVariant(50), duration: 30, color: '#3b82f6' },
    { id: 'apt-2', categoryId: 'cat-1', name: 'Professional teeth cleaning (scaling & polishing)', priceVariants: createSinglePriceVariant(100), duration: 45, color: '#3b82f6' },
    { id: 'apt-3', categoryId: 'cat-1', name: 'Fluoride treatment', priceVariants: createSinglePriceVariant(40), duration: 20, color: '#3b82f6' },
    { id: 'apt-4', categoryId: 'cat-1', name: 'Dental sealants', priceVariants: createSinglePriceVariant(60), duration: 30, color: '#3b82f6' },
    { id: 'apt-5', categoryId: 'cat-1', name: 'Oral hygiene instruction', priceVariants: createSinglePriceVariant(30), duration: 20, color: '#3b82f6' },
    { id: 'apt-6', categoryId: 'cat-1', name: 'X-rays (bitewing, periapical, panoramic)', priceVariants: createSinglePriceVariant(80), duration: 15, color: '#3b82f6' },

    // Restorative Dentistry - with tooth-based pricing
    {
        id: 'apt-7',
        categoryId: 'cat-2',
        name: 'Dental filling (composite / amalgam / glass ionomer)',
        priceVariants: createToothRangeVariants([
            { spec: '1-8', numbers: [1, 2, 3, 4, 5, 6, 7, 8], price: 100, label: 'Front teeth (Incisors)' },
            { spec: '9-16', numbers: [9, 10, 11, 12, 13, 14, 15, 16], price: 120, label: 'Canines & Premolars' },
            { spec: '17-32', numbers: [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32], price: 150, label: 'Molars' }
        ]),
        duration: 45,
        color: '#10b981'
    },
    { id: 'apt-8', categoryId: 'cat-2', name: 'Temporary filling', priceVariants: createSinglePriceVariant(50), duration: 20, color: '#10b981' },
    { id: 'apt-9', categoryId: 'cat-2', name: 'Inlay', priceVariants: createSinglePriceVariant(300), duration: 60, color: '#10b981' },
    { id: 'apt-10', categoryId: 'cat-2', name: 'Onlay', priceVariants: createSinglePriceVariant(350), duration: 60, color: '#10b981' },
    { id: 'apt-11', categoryId: 'cat-2', name: 'Core build-up', priceVariants: createSinglePriceVariant(150), duration: 45, color: '#10b981' },
    { id: 'apt-12', categoryId: 'cat-2', name: 'Tooth-colored restoration', priceVariants: createSinglePriceVariant(140), duration: 45, color: '#10b981' },

    // Endodontics - Root canal with tooth-based pricing
    {
        id: 'apt-13',
        categoryId: 'cat-3',
        name: 'Root canal treatment (RCT)',
        priceVariants: createToothRangeVariants([
            { spec: '1-8', numbers: [1, 2, 3, 4, 5, 6, 7, 8], price: 500, label: 'Front teeth (Incisors)' },
            { spec: '9-16', numbers: [9, 10, 11, 12, 13, 14, 15, 16], price: 700, label: 'Canines & Premolars' },
            { spec: '17-32', numbers: [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32], price: 900, label: 'Molars' }
        ]),
        duration: 90,
        color: '#f59e0b'
    },
    { id: 'apt-14', categoryId: 'cat-3', name: 'Single-visit RCT', priceVariants: createSinglePriceVariant(900), duration: 120, color: '#f59e0b' },
    { id: 'apt-15', categoryId: 'cat-3', name: 'Re-root canal treatment', priceVariants: createSinglePriceVariant(1000), duration: 120, color: '#f59e0b' },
    { id: 'apt-16', categoryId: 'cat-3', name: 'Pulpotomy', priceVariants: createSinglePriceVariant(200), duration: 45, color: '#f59e0b' },
    { id: 'apt-17', categoryId: 'cat-3', name: 'Pulpectomy', priceVariants: createSinglePriceVariant(250), duration: 60, color: '#f59e0b' },
    { id: 'apt-18', categoryId: 'cat-3', name: 'Apexification', priceVariants: createSinglePriceVariant(600), duration: 90, color: '#f59e0b' },
    { id: 'apt-19', categoryId: 'cat-3', name: 'Post and core', priceVariants: createSinglePriceVariant(300), duration: 60, color: '#f59e0b' },

    // Prosthodontics - Crown with tooth-based pricing
    {
        id: 'apt-20',
        categoryId: 'cat-4',
        name: 'Dental crown',
        priceVariants: createToothRangeVariants([
            { spec: '1-8', numbers: [1, 2, 3, 4, 5, 6, 7, 8], price: 500, label: 'Front teeth' },
            { spec: '9-16', numbers: [9, 10, 11, 12, 13, 14, 15, 16], price: 600, label: 'Premolars' },
            { spec: '17-32', numbers: [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32], price: 700, label: 'Molars' }
        ]),
        duration: 90,
        color: '#8b5cf6'
    },
    { id: 'apt-21', categoryId: 'cat-4', name: 'Dental bridge', priceVariants: createSinglePriceVariant(1500), duration: 120, color: '#8b5cf6' },
    { id: 'apt-22', categoryId: 'cat-4', name: 'Partial denture (removable)', priceVariants: createSinglePriceVariant(800), duration: 90, color: '#8b5cf6' },
    { id: 'apt-23', categoryId: 'cat-4', name: 'Complete denture', priceVariants: createSinglePriceVariant(1200), duration: 120, color: '#8b5cf6' },
    { id: 'apt-24', categoryId: 'cat-4', name: 'Overdenture', priceVariants: createSinglePriceVariant(1400), duration: 120, color: '#8b5cf6' },
    { id: 'apt-25', categoryId: 'cat-4', name: 'Implant-supported crown', priceVariants: createSinglePriceVariant(2000), duration: 90, color: '#8b5cf6' },
    { id: 'apt-26', categoryId: 'cat-4', name: 'Implant-supported denture', priceVariants: createSinglePriceVariant(3500), duration: 150, color: '#8b5cf6' },

    // Periodontics
    { id: 'apt-27', categoryId: 'cat-5', name: 'Scaling and root planing (deep cleaning)', priceVariants: createSinglePriceVariant(300), duration: 90, color: '#ec4899' },
    { id: 'apt-28', categoryId: 'cat-5', name: 'Gum disease treatment', priceVariants: createSinglePriceVariant(400), duration: 90, color: '#ec4899' },
    { id: 'apt-29', categoryId: 'cat-5', name: 'Periodontal surgery', priceVariants: createSinglePriceVariant(1200), duration: 120, color: '#ec4899' },
    { id: 'apt-30', categoryId: 'cat-5', name: 'Gingivectomy', priceVariants: createSinglePriceVariant(500), duration: 60, color: '#ec4899' },
    { id: 'apt-31', categoryId: 'cat-5', name: 'Flap surgery', priceVariants: createSinglePriceVariant(1000), duration: 120, color: '#ec4899' },
    { id: 'apt-32', categoryId: 'cat-5', name: 'Bone grafting', priceVariants: createSinglePriceVariant(1500), duration: 120, color: '#ec4899' },
    { id: 'apt-33', categoryId: 'cat-5', name: 'Gum grafting', priceVariants: createSinglePriceVariant(1200), duration: 120, color: '#ec4899' },

    // Orthodontics
    { id: 'apt-34', categoryId: 'cat-6', name: 'Metal braces', priceVariants: createSinglePriceVariant(3000), duration: 60, color: '#06b6d4' },
    { id: 'apt-35', categoryId: 'cat-6', name: 'Ceramic braces', priceVariants: createSinglePriceVariant(4000), duration: 60, color: '#06b6d4' },
    { id: 'apt-36', categoryId: 'cat-6', name: 'Lingual braces', priceVariants: createSinglePriceVariant(5000), duration: 60, color: '#06b6d4' },
    { id: 'apt-37', categoryId: 'cat-6', name: 'Clear aligners (e.g., Invisalign)', priceVariants: createSinglePriceVariant(4500), duration: 45, color: '#06b6d4' },
    { id: 'apt-38', categoryId: 'cat-6', name: 'Retainers', priceVariants: createSinglePriceVariant(300), duration: 30, color: '#06b6d4' },
    { id: 'apt-39', categoryId: 'cat-6', name: 'Space maintainers', priceVariants: createSinglePriceVariant(250), duration: 30, color: '#06b6d4' },

    // Cosmetic Dentistry
    { id: 'apt-40', categoryId: 'cat-7', name: 'Teeth whitening / bleaching', priceVariants: createSinglePriceVariant(400), duration: 60, color: '#f97316' },
    {
        id: 'apt-41',
        categoryId: 'cat-7',
        name: 'Dental veneers',
        priceVariants: createToothRangeVariants([
            { spec: '1-8', numbers: [1, 2, 3, 4, 5, 6, 7, 8], price: 800, label: 'Front teeth' },
            { spec: '9-16', numbers: [9, 10, 11, 12, 13, 14, 15, 16], price: 900, label: 'Premolars' }
        ]),
        duration: 90,
        color: '#f97316'
    },
    { id: 'apt-42', categoryId: 'cat-7', name: 'Smile makeover', priceVariants: createSinglePriceVariant(5000), duration: 180, color: '#f97316' },
    { id: 'apt-43', categoryId: 'cat-7', name: 'Tooth reshaping (enameloplasty)', priceVariants: createSinglePriceVariant(200), duration: 45, color: '#f97316' },
    { id: 'apt-44', categoryId: 'cat-7', name: 'Composite bonding', priceVariants: createSinglePriceVariant(300), duration: 60, color: '#f97316' },
    { id: 'apt-45', categoryId: 'cat-7', name: 'Gum contouring', priceVariants: createSinglePriceVariant(600), duration: 60, color: '#f97316' },

    // Oral & Maxillofacial Surgery - Extraction with tooth-based pricing
    {
        id: 'apt-46',
        categoryId: 'cat-8',
        name: 'Tooth extraction',
        priceVariants: createToothRangeVariants([
            { spec: '1-8', numbers: [1, 2, 3, 4, 5, 6, 7, 8], price: 100, label: 'Front teeth' },
            { spec: '9-16', numbers: [9, 10, 11, 12, 13, 14, 15, 16], price: 150, label: 'Premolars' },
            { spec: '17-32', numbers: [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32], price: 200, label: 'Molars' }
        ]),
        duration: 30,
        color: '#ef4444'
    },
    { id: 'apt-47', categoryId: 'cat-8', name: 'Surgical extraction', priceVariants: createSinglePriceVariant(300), duration: 60, color: '#ef4444' },
    { id: 'apt-48', categoryId: 'cat-8', name: 'Wisdom tooth removal', priceVariants: createSinglePriceVariant(400), duration: 60, color: '#ef4444' },
    { id: 'apt-49', categoryId: 'cat-8', name: 'Impacted tooth surgery', priceVariants: createSinglePriceVariant(600), duration: 90, color: '#ef4444' },
    { id: 'apt-50', categoryId: 'cat-8', name: 'Jaw surgery', priceVariants: createSinglePriceVariant(5000), duration: 240, color: '#ef4444' },
    { id: 'apt-51', categoryId: 'cat-8', name: 'Cyst removal', priceVariants: createSinglePriceVariant(800), duration: 90, color: '#ef4444' },
    { id: 'apt-52', categoryId: 'cat-8', name: 'Abscess drainage', priceVariants: createSinglePriceVariant(200), duration: 30, color: '#ef4444' },
    { id: 'apt-53', categoryId: 'cat-8', name: 'Biopsy', priceVariants: createSinglePriceVariant(300), duration: 45, color: '#ef4444' },

    // Pediatric Dentistry
    { id: 'apt-54', categoryId: 'cat-9', name: 'Pediatric dental exam', priceVariants: createSinglePriceVariant(40), duration: 30, color: '#14b8a6' },
    { id: 'apt-55', categoryId: 'cat-9', name: 'Fluoride application', priceVariants: createSinglePriceVariant(35), duration: 15, color: '#14b8a6' },
    { id: 'apt-56', categoryId: 'cat-9', name: 'Sealants for kids', priceVariants: createSinglePriceVariant(50), duration: 30, color: '#14b8a6' },
    { id: 'apt-57', categoryId: 'cat-9', name: 'Space maintainers', priceVariants: createSinglePriceVariant(200), duration: 30, color: '#14b8a6' },
    { id: 'apt-58', categoryId: 'cat-9', name: 'Stainless steel crowns', priceVariants: createSinglePriceVariant(250), duration: 45, color: '#14b8a6' },
    { id: 'apt-59', categoryId: 'cat-9', name: 'Pulpotomy (baby teeth)', priceVariants: createSinglePriceVariant(180), duration: 45, color: '#14b8a6' },
    { id: 'apt-60', categoryId: 'cat-9', name: 'Habit-breaking appliances', priceVariants: createSinglePriceVariant(300), duration: 30, color: '#14b8a6' },

    // Dental Implants
    { id: 'apt-61', categoryId: 'cat-10', name: 'Dental implant placement', priceVariants: createSinglePriceVariant(2500), duration: 120, color: '#6366f1' },
    { id: 'apt-62', categoryId: 'cat-10', name: 'Bone grafting', priceVariants: createSinglePriceVariant(1000), duration: 90, color: '#6366f1' },
    { id: 'apt-63', categoryId: 'cat-10', name: 'Sinus lift', priceVariants: createSinglePriceVariant(1500), duration: 120, color: '#6366f1' },
    { id: 'apt-64', categoryId: 'cat-10', name: 'Implant restoration', priceVariants: createSinglePriceVariant(1500), duration: 60, color: '#6366f1' },
    { id: 'apt-65', categoryId: 'cat-10', name: 'Mini implants', priceVariants: createSinglePriceVariant(1800), duration: 90, color: '#6366f1' },

    // Emergency Dentistry
    { id: 'apt-66', categoryId: 'cat-11', name: 'Toothache treatment', priceVariants: createSinglePriceVariant(100), duration: 30, color: '#dc2626' },
    { id: 'apt-67', categoryId: 'cat-11', name: 'Broken tooth repair', priceVariants: createSinglePriceVariant(200), duration: 45, color: '#dc2626' },
    { id: 'apt-68', categoryId: 'cat-11', name: 'Lost filling/crown repair', priceVariants: createSinglePriceVariant(150), duration: 30, color: '#dc2626' },
    { id: 'apt-69', categoryId: 'cat-11', name: 'Dental trauma management', priceVariants: createSinglePriceVariant(300), duration: 60, color: '#dc2626' },
    { id: 'apt-70', categoryId: 'cat-11', name: 'Infection treatment', priceVariants: createSinglePriceVariant(250), duration: 45, color: '#dc2626' },

    // Diagnostic & Supportive Procedures
    { id: 'apt-71', categoryId: 'cat-12', name: 'Digital X-rays', priceVariants: createSinglePriceVariant(60), duration: 15, color: '#a855f7' },
    { id: 'apt-72', categoryId: 'cat-12', name: 'CBCT scan', priceVariants: createSinglePriceVariant(300), duration: 30, color: '#a855f7' },
    { id: 'apt-73', categoryId: 'cat-12', name: 'Oral cancer screening', priceVariants: createSinglePriceVariant(80), duration: 20, color: '#a855f7' },
    { id: 'apt-74', categoryId: 'cat-12', name: 'Bite analysis', priceVariants: createSinglePriceVariant(100), duration: 30, color: '#a855f7' },
    { id: 'apt-75', categoryId: 'cat-12', name: 'TMJ disorder treatment', priceVariants: createSinglePriceVariant(500), duration: 60, color: '#a855f7' },
];

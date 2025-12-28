import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/core';
import { TreatmentCategory } from '../common/entities/treatment-category.entity';
import { TreatmentType } from '../common/entities/treatment-type.entity';
import { Organization } from '../common/entities/organization.entity';

const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';

export class TreatmentSeeder extends Seeder {
    async run(em: EntityManager): Promise<void> {
        const org = await em.findOne(Organization, { name: 'Main Clinic' });
        if (!org) {
            console.log('Skipping Treatment seeding - Organization not found');
            return;
        }

        const categories = [
            { name: 'General Dentistry', color: '#10B981', icon: 'tooth', order: 1 },
            { name: 'Orthodontics', color: '#3B82F6', icon: 'braces', order: 2 },
            { name: 'Surgery', color: '#EF4444', icon: 'scalpel', order: 3 },
            { name: 'Cosmetic', color: '#F59E0B', icon: 'sparkles', order: 4 },
            { name: 'Endodontics', color: '#8B5CF6', icon: 'root', order: 5 }
        ];

        const categoryMap = new Map();

        for (const cat of categories) {
            let category = await em.findOne(TreatmentCategory, { name: cat.name, orgId: org.id });
            if (!category) {
                // Exclude 'color' from creation payload as it's not in the entity
                category = em.create(TreatmentCategory, {
                    name: cat.name,
                    icon: cat.icon,
                    order: cat.order,
                    orgId: org.id,
                    createdBy: SYSTEM_USER_ID,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                await em.persistAndFlush(category);
            }
            categoryMap.set(cat.name, category);
        }

        const types = [
            { name: 'Consultation', cost: 50, duration: 30, category: 'General Dentistry' },
            { name: 'Cleaning', cost: 80, duration: 45, category: 'General Dentistry' },
            { name: 'Composite Filling', cost: 120, duration: 45, category: 'General Dentistry' },
            { name: 'Root Canal (Molar)', cost: 800, duration: 90, category: 'Endodontics' },
            { name: 'Simple Extraction', cost: 150, duration: 30, category: 'Surgery' },
            { name: 'Surgical Extraction', cost: 300, duration: 60, category: 'Surgery' },
            { name: 'Braces Install', cost: 3000, duration: 120, category: 'Orthodontics' },
            { name: 'Braces Adjustment', cost: 100, duration: 30, category: 'Orthodontics' },
            { name: 'Teeth Whitening', cost: 250, duration: 60, category: 'Cosmetic' },
            { name: 'Veneer', cost: 500, duration: 90, category: 'Cosmetic' }
        ];

        for (const t of types) {
            const category = categoryMap.get(t.category);
            if (!category) continue;

            const exists = await em.findOne(TreatmentType, { name: t.name, orgId: org.id });
            if (!exists) {
                const sourceCat = categories.find(c => c.name === t.category);
                em.create(TreatmentType, {
                    name: t.name,
                    duration: t.duration,
                    category: category,
                    orgId: org.id,
                    createdBy: SYSTEM_USER_ID,
                    color: sourceCat?.color || '#000000',
                    priceVariants: [{ name: 'Standard', price: t.cost, currency: 'USD' }],
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
        }
    }
}

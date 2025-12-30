import { Entity, Property, ManyToOne, Index } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { TreatmentCategory } from './treatment-category.entity';

export interface PriceVariant {
    name: string;
    price: number;
    currency?: string;
    toothNumbers?: number[]; // Array of tooth numbers this variant applies to
    isDefault?: boolean;
}

@Entity({ tableName: 'treatment_types' })
@Index({ properties: ['orgId'] })
export class TreatmentType extends BaseEntity {
    @Property({ length: 255 })
    name!: string;

    @ManyToOne(() => TreatmentCategory, { nullable: true })
    category?: TreatmentCategory;

    @Property({ type: 'jsonb' })
    priceVariants!: PriceVariant[];

    @Property({ type: 'integer' })
    duration!: number; // in minutes

    @Property({ length: 7 })
    color!: string; // hex color code
}

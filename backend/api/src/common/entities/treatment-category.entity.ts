import { Entity, Property, Index } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';

@Entity({ tableName: 'treatment_categories' })
@Index({ properties: ['orgId'] })
export class TreatmentCategory extends BaseEntity {
    @Property({ length: 255 })
    name!: string;

    @Property({ length: 10 })
    icon!: string; // emoji

    @Property({ type: 'integer' })
    order!: number;
}

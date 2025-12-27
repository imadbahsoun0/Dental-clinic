import { PrimaryKey, Property, BaseEntity as MikroBaseEntity } from '@mikro-orm/core';
import { v4 } from 'uuid';

export abstract class BaseEntity extends MikroBaseEntity {
    @PrimaryKey({ type: 'uuid' })
    id: string = v4();

    @Property()
    createdAt: Date = new Date();

    @Property({ onUpdate: () => new Date() })
    updatedAt: Date = new Date();

    @Property({ type: 'uuid', nullable: true })
    createdBy?: string;

    @Property({ type: 'uuid', nullable: true, onUpdate: () => null })
    updatedBy?: string;

    @Property({ type: 'uuid' })
    orgId!: string; // Multi-tenancy: All entities belong to an organization
}

import { Entity, Property, OneToOne } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Attachment } from './attachment.entity';

@Entity({ tableName: 'organizations' })
export class Organization extends BaseEntity {
    @Property({ length: 255 })
    name!: string;

    @Property({ type: 'text', nullable: true })
    location?: string;

    @Property({ length: 50, nullable: true })
    phone?: string;

    @Property({ length: 255, nullable: true })
    email?: string;

    @Property({ length: 255, nullable: true })
    website?: string;

    @Property({ type: 'text', nullable: true })
    logo?: string; // base64 or URL

    @Property({ default: true })
    isActive: boolean = true;

    constructor(name: string) {
        super();
        this.name = name;
        // For Organization, orgId references itself
        this.orgId = this.id;
    }
}

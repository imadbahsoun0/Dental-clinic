import { Entity, Property, Index } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';

@Entity({ tableName: 'attachments' })
@Index({ properties: ['orgId'] })
export class Attachment extends BaseEntity {
    @Property({ length: 255 })
    filename!: string;

    @Property({ length: 1024 })
    s3Key!: string;

    @Property({ length: 255 })
    bucket!: string;

    @Property({ length: 255 })
    mimeType!: string;

    @Property({ type: 'integer' })
    size!: number; // in bytes

    constructor(filename: string, s3Key: string, bucket: string, mimeType: string, size: number) {
        super();
        this.filename = filename;
        this.s3Key = s3Key;
        this.bucket = bucket;
        this.mimeType = mimeType;
        this.size = size;
    }
}

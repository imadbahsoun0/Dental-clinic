import { Entity, Property, Unique } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';

@Entity({ tableName: 'notification_settings' })
@Unique({ properties: ['orgId'] })
export class NotificationSettings extends BaseEntity {
    @Property({ type: 'jsonb' })
    appointmentReminder!: {
        enabled: boolean;
        timing: number;
        timingUnit: 'hours' | 'days';
        messageTemplate: string;
    };

    @Property({ type: 'jsonb' })
    paymentReminder!: {
        enabled: boolean;
        timing: number;
        timingUnit: 'hours' | 'days';
        messageTemplate: string;
    };
}

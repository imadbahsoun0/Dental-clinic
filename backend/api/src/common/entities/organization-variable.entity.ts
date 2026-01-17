import { Entity, Index, Property, Unique } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';

export enum OrganizationVariableKey {
  WAHA_API_URL = 'waha.apiUrl',
  WAHA_API_KEY = 'waha.apiKey',
  DEFAULT_DOCTOR_ID = 'appointments.defaultDoctorId',
}

@Entity({ tableName: 'organization_variables' })
@Unique({ properties: ['orgId', 'key'] })
@Index({ properties: ['orgId', 'key'] })
export class OrganizationVariable extends BaseEntity {
  @Property({ length: 255 })
  key!: OrganizationVariableKey;

  @Property({ type: 'text', nullable: true })
  value?: string;
}

import { Entity, Property, ManyToOne, Enum, Index, Unique } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Organization } from './organization.entity';
import { UserRole } from '../decorators/roles.decorator';

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

@Entity({ tableName: 'user_organizations' })
@Unique({ properties: ['user', 'orgId'] })
@Index({ properties: ['orgId'] })
export class UserOrganization extends BaseEntity {
    @ManyToOne(() => User)
    user!: User;

    @ManyToOne(() => Organization)
    organization!: Organization;

    @Enum(() => UserRole)
    role!: UserRole;

    @Enum(() => UserStatus)
    status: UserStatus = UserStatus.ACTIVE;

    @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    wallet?: number; // For dentists only - wallet per organization

    @Property({ type: 'integer', nullable: true })
    percentage?: number; // Commission percentage for dentists - per organization

    constructor(user: User, orgId: string, role: UserRole) {
        super();
        this.user = user;
        this.orgId = orgId;
        this.role = role;
    }
}

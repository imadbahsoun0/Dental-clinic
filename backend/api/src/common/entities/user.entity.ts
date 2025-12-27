import { Entity, Property, Collection, OneToMany, Unique } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { UserOrganization } from './user-organization.entity';

@Entity({ tableName: 'users' })
@Unique({ properties: ['email'] })
export class User extends BaseEntity {
    @Property({ length: 255 })
    name!: string;

    @Property({ length: 255 })
    email!: string;

    @Property({ length: 255 })
    password!: string; // Will be hashed

    @Property({ length: 50, nullable: true })
    phone?: string;

    @Property({ type: 'text', nullable: true })
    refreshToken?: string; // For token revocation

    @Property({ nullable: true })
    refreshTokenExpiresAt?: Date;

    @OneToMany(() => UserOrganization, userOrg => userOrg.user)
    organizations = new Collection<UserOrganization>(this);

    constructor(name: string, email: string, password: string) {
        super();
        this.name = name;
        this.email = email;
        this.password = password;
        // User entity doesn't have orgId since they can belong to multiple orgs
        // We'll set it to a default value and override in BaseEntity
    }
}

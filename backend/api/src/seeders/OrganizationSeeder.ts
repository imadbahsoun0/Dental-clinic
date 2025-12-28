import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../common/entities/user.entity';
import { Organization } from '../common/entities/organization.entity';
import { UserOrganization, UserStatus } from '../common/entities/user-organization.entity';
import { UserRole } from '../common/decorators/roles.decorator';
import * as bcrypt from 'bcrypt';

const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';

export class OrganizationSeeder extends Seeder {
    async run(em: EntityManager): Promise<void> {
        // 1. Create Main Organization
        let org = await em.findOne(Organization, { name: 'Main Clinic' });
        if (!org) {
            org = new Organization('Main Clinic');
            org.email = 'info@mainclinic.com';
            org.location = '123 Main St';
            org.createdBy = SYSTEM_USER_ID;
            em.persist(org);
            await em.flush();
        }

        // 2. Create Secondary Organization
        let org2 = await em.findOne(Organization, { name: 'Secondary Clinic' });
        if (!org2) {
            org2 = new Organization('Secondary Clinic');
            org2.email = 'info@secondaryclinic.com';
            org2.location = '456 Second St';
            org2.createdBy = SYSTEM_USER_ID;
            em.persist(org2);
            await em.flush();
        }

        const password = await bcrypt.hash('password123', 10);

        const users = [
            { name: 'System Admin', email: 'admin@dentalclinic.com', role: UserRole.ADMIN },
            { name: 'Dr. Smith', email: 'dentist@dentalclinic.com', role: UserRole.DENTIST },
            { name: 'Sarah Jones', email: 'secretary@dentalclinic.com', role: UserRole.SECRETARY },
            { name: 'Ali Morsel', email: 'alimorselllll@gmail.com', role: UserRole.ADMIN }
        ];

        for (const u of users) {
            let user = await em.findOne(User, { email: u.email });
            if (!user) {
                user = new User(u.name, u.email, password);
                user.createdBy = SYSTEM_USER_ID;
                user.orgId = org.id; // Default active org
                em.persist(user);
                await em.flush();
            }

            // Link to Main Clinic
            let userOrg = await em.findOne(UserOrganization, { user, orgId: org.id });
            if (!userOrg) {
                const linkage = new UserOrganization(user, org.id, u.role);
                linkage.organization = org;
                linkage.status = UserStatus.ACTIVE;
                linkage.createdBy = SYSTEM_USER_ID;
                if (u.role === UserRole.DENTIST) {
                    linkage.percentage = 40;
                    linkage.wallet = 0;
                }
                em.persist(linkage);
            }

            // Link Admin to Secondary Clinic as well
            if (u.role === UserRole.ADMIN) {
                let userOrg2 = await em.findOne(UserOrganization, { user, orgId: org2.id });
                if (!userOrg2) {
                    const linkage2 = new UserOrganization(user, org2.id, u.role);
                    linkage2.organization = org2;
                    linkage2.status = UserStatus.ACTIVE;
                    linkage2.createdBy = SYSTEM_USER_ID;
                    em.persist(linkage2);
                }
            }
        }
    }
}

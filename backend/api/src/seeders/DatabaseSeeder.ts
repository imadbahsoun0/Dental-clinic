import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/core';
import { ToothSeeder } from './ToothSeeder';
import { TreatmentSeeder } from './TreatmentSeeder';
import { OrganizationSeeder } from './OrganizationSeeder';

export class DatabaseSeeder extends Seeder {
    async run(em: EntityManager): Promise<void> {
        return this.call(em, [
            ToothSeeder,
            OrganizationSeeder,
            TreatmentSeeder,
        ]);
    }
}

import { Options } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import { SeedManager } from '@mikro-orm/seeder';

const config: Options = {
    driver: PostgreSqlDriver,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    dbName: process.env.DB_NAME || 'dental_clinic',
    entities: ['dist/common/entities/**/*.entity.js'],
    entitiesTs: ['src/common/entities/**/*.entity.ts'],
    discovery: {
        warnWhenNoEntities: false,
        requireEntitiesArray: false,
    },
    migrations: {
        path: 'dist/common/migrations',
        pathTs: 'src/common/migrations',
        snapshot: false,
        disableForeignKeys: false,
    },
    extensions: [Migrator, SeedManager],
    seeder: {
        path: 'dist/seeders',
        pathTs: 'src/seeders',
        defaultSeeder: 'DatabaseSeeder',
        glob: '!(*.d).{js,ts}',
        emit: 'ts',
        fileName: (className: string) => className,
    },
    debug: false,
    allowGlobalContext: true,
};

export default config;

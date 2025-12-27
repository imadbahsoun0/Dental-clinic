import { Options } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';

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
    extensions: [Migrator],
    debug: process.env.NODE_ENV !== 'production',
    allowGlobalContext: true,
};

export default config;

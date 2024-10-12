import {Kysely, PostgresDialect} from 'kysely';
import pg from 'pg';
import {DATABASE_URL} from '$env/static/private';
import type Database from './gen/Database';

export const kysely = new Kysely<Database>({
    dialect: new PostgresDialect({
        pool: new pg.Pool({
            connectionString: DATABASE_URL,
        }),
    }),
});

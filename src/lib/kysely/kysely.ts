import {Kysely, PostgresDialect} from 'kysely';
import pg from 'pg';
import {DATABASE_URL} from '$env/static/private';
import type Database from './gen/Database';

pg.types.setTypeParser(pg.types.builtins.INT8, val => Number(val));

export const kysely = new Kysely<Database>({
    dialect: new PostgresDialect({
        pool: new pg.Pool({
            connectionString: DATABASE_URL,
        }),
    }),
});

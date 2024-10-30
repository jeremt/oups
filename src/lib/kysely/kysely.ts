import pg from 'pg';
import {CamelCasePlugin, Kysely, PostgresDialect, sql, type RawBuilder} from 'kysely';
import {DATABASE_URL} from '$env/static/private';
import type {Database} from './gen/Database';

pg.types.setTypeParser(pg.types.builtins.INT8, val => Number(val));

export const kysely = new Kysely<Database>({
    dialect: new PostgresDialect({
        pool: new pg.Pool({
            connectionString: DATABASE_URL,
        }),
    }),
    plugins: [new CamelCasePlugin()],
});

export function jsonValue<T>(value: T): RawBuilder<T> {
    return sql`cast(${JSON.stringify(value)} as jsonb)`;
}

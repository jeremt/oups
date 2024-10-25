import {Kysely} from 'kysely';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('clients')
        .addColumn('company_id', 'int8', col => col.references('companies.id').notNull())
        .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable('clients').dropColumn('company_id').execute();
}

import {Kysely} from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
    await db.schema
        .alterTable('documents')
        .addColumn('discountPrice', 'int8', col => col.notNull().defaultTo(0))
        .addColumn('depositPercent', 'int8', col => col.notNull().defaultTo(0))
        .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
    await db.schema.alterTable('documents').dropColumn('discountPrice').dropColumn('depositPercent').execute();
}

import {Kysely, sql} from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
    await db.schema
        .createTable('companies')
        .ifNotExists()
        .addColumn('id', 'int8', col => col.generatedAlwaysAsIdentity().primaryKey())
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`now()`).notNull())
        .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`now()`).notNull())
        .addColumn('name', 'text', col => col.notNull())
        .addColumn('logo_url', 'text')
        .addColumn('address', 'text', col => col.notNull())
        .addColumn('bic', 'text', col => col.notNull())
        .addColumn('iban', 'text', col => col.notNull())
        .addColumn('siren', 'text', col => col.notNull())
        .addColumn('quote_sequence', 'int8', col => col.notNull().defaultTo(1))
        .addColumn('invoice_sequence', 'int8', col => col.notNull().defaultTo(1))
        .execute();

    await db.schema
        .alterTable('users')
        .addColumn('company_id', 'int8', col => col.references('companies.id'))
        .execute();

    await db.schema
        .createTable('organizations')
        .ifNotExists()
        .addColumn('id', 'int8', col => col.generatedAlwaysAsIdentity().primaryKey())
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`now()`).notNull())
        .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`now()`).notNull())
        .addColumn('name', 'text', col => col.notNull())
        .addColumn('logo_url', 'text')
        .execute();

    await db.schema
        .createTable('users_organizations')
        .ifNotExists()
        .addColumn('user_id', 'int8', col => col.references('users.id').notNull())
        .addColumn('organization_id', 'int8', col => col.references('organizations.id').notNull())
        .execute();

    await db.schema
        .createTable('clients')
        .ifNotExists()
        .addColumn('id', 'int8', col => col.generatedAlwaysAsIdentity().primaryKey())
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`now()`).notNull())
        .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`now()`).notNull())
        .addColumn('name', 'text', col => col.notNull())
        .addColumn('address', 'text', col => col.notNull())
        .addColumn('email', 'text')
        .addColumn('logo_url', 'text')
        .execute();

    await db.executeQuery(sql`create type document_type as enum ('invoice', 'quote')`.compile(db));
    await db.executeQuery(sql`create type document_status as enum ('generated', 'sent', 'accepted', 'declined', 'payed', 'declared')`.compile(db));

    await db.schema
        .createTable('documents')
        .ifNotExists()
        .addColumn('id', 'int8', col => col.generatedAlwaysAsIdentity().primaryKey())
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`now()`).notNull())
        .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`now()`).notNull())
        .addColumn('name', 'text', col => col.notNull())
        .addColumn('type', sql`document_type`, col => col.notNull())
        .addColumn('status', sql`document_status`, col =>
            col
                .notNull()
                .check(sql`type = 'invoice' and status in ('generated', 'sent', 'payed', 'declared') or type = 'quote' and status in ('generated','sent','accepted','declined')`),
        )
        .addColumn('client_id', 'int8', col => col.references('clients.id').notNull().onDelete('cascade'))
        .addColumn('company_id', 'int8', col => col.references('companies.id').notNull().onDelete('cascade'))
        .addColumn('organization_id', 'int8', col => col.references('organizations.id').notNull().onDelete('cascade'))
        .addColumn('emitted_at', 'timestamptz', col => col.notNull())
        .addColumn('lines', 'jsonb', col => col.notNull())
        .addColumn('number', 'int8', col => col.notNull())
        .addColumn('quantity_base', 'int4', col => col.notNull())
        .addColumn('quantity_label', 'text', col => col.notNull())
        .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
    await db.schema.dropTable('documents').ifExists().execute();
    await db.executeQuery(sql`drop type document_type`.compile(db));
    await db.executeQuery(sql`drop type document_status`.compile(db));

    await db.schema.dropTable('clients').ifExists().execute();
    await db.schema.dropTable('user_organizations').ifExists().execute();
    await db.schema.dropTable('organisations').ifExists().execute();
    await db.schema.alterTable('users').dropColumn('company_id').execute();
    await db.schema.dropTable('companies').ifExists().execute();
}

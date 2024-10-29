import {Kysely, sql} from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
    await db.schema
        .createTable('companies')
        .ifNotExists()
        .addColumn('id', 'int8', col => col.generatedAlwaysAsIdentity().primaryKey())
        .addColumn('createdAt', 'timestamptz', col => col.defaultTo(sql`now()`).notNull())
        .addColumn('updatedAt', 'timestamptz', col => col.defaultTo(sql`now()`).notNull())
        .addColumn('name', 'text', col => col.notNull())
        .addColumn('logoUrl', 'text')
        .addColumn('address', 'text', col => col.notNull())
        .addColumn('bic', 'text', col => col.notNull())
        .addColumn('iban', 'text', col => col.notNull())
        .addColumn('siren', 'text', col => col.notNull())
        .addColumn('email', 'text', col => col.notNull())
        .addColumn('phone', 'text', col => col)
        .addColumn('quoteSequence', 'int8', col => col.notNull().defaultTo(1))
        .addColumn('invoiceSequence', 'int8', col => col.notNull().defaultTo(1))
        .execute();

    await db.schema
        .alterTable('users')
        .addColumn('companyId', 'int8', col => col.references('companies.id').onDelete('cascade'))
        .execute();

    await db.schema
        .createTable('organizations')
        .ifNotExists()
        .addColumn('id', 'int8', col => col.generatedAlwaysAsIdentity().primaryKey())
        .addColumn('createdAt', 'timestamptz', col => col.defaultTo(sql`now()`).notNull())
        .addColumn('updatedAt', 'timestamptz', col => col.defaultTo(sql`now()`).notNull())
        .addColumn('name', 'text', col => col.notNull())
        .addColumn('logoUrl', 'text')
        .addColumn('companyId', 'int8', col => col.references('companies.id').onDelete('cascade'))
        .execute();

    await db.schema
        .createTable('usersOrganizations')
        .ifNotExists()
        .addColumn('userId', 'int8', col => col.references('users.id').notNull().onDelete('cascade'))
        .addColumn('organizationId', 'int8', col => col.references('organizations.id').notNull().onDelete('cascade'))
        .execute();

    await db.schema
        .createTable('clients')
        .ifNotExists()
        .addColumn('id', 'int8', col => col.generatedAlwaysAsIdentity().primaryKey())
        .addColumn('createdAt', 'timestamptz', col => col.defaultTo(sql`now()`).notNull())
        .addColumn('updatedAt', 'timestamptz', col => col.defaultTo(sql`now()`).notNull())
        .addColumn('name', 'text', col => col.notNull())
        .addColumn('address', 'text', col => col.notNull())
        .addColumn('email', 'text')
        .addColumn('logoUrl', 'text')
        .addColumn('companyId', 'int8', col => col.references('companies.id').notNull())
        .execute();

    await db.executeQuery(sql`create type document_type as enum ('invoice', 'quote')`.compile(db));
    await db.executeQuery(sql`create type document_status as enum ('generated', 'sent', 'accepted', 'declined', 'paid', 'declared')`.compile(db));

    await db.schema
        .createTable('documents')
        .ifNotExists()
        .addColumn('id', 'int8', col => col.generatedAlwaysAsIdentity().primaryKey())
        .addColumn('createdAt', 'timestamptz', col => col.defaultTo(sql`now()`).notNull())
        .addColumn('updatedAt', 'timestamptz', col => col.defaultTo(sql`now()`).notNull())
        .addColumn('name', 'text', col => col.notNull())
        .addColumn('type', sql`document_type`, col => col.notNull())
        .addColumn('status', sql`document_status`, col =>
            col
                .notNull()
                .check(sql`type = 'invoice' and status in ('generated', 'sent', 'paid', 'declared') or type = 'quote' and status in ('generated','sent','accepted','declined')`),
        )
        .addColumn('clientId', 'int8', col => col.references('clients.id').notNull().onDelete('cascade'))
        .addColumn('companyId', 'int8', col => col.references('companies.id').notNull().onDelete('cascade'))
        .addColumn('organizationId', 'int8', col => col.references('organizations.id').onDelete('cascade'))
        .addColumn('emittedAt', 'timestamptz', col => col.notNull())
        .addColumn('lines', 'jsonb', col => col.notNull())
        .addColumn('number', 'int8', col => col.notNull())
        .addColumn('note', 'text')
        .addColumn('quantityBase', 'int4', col => col.notNull())
        .addColumn('quantityLabel', 'text', col => col.notNull())
        .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
    await db.schema.dropTable('documents').ifExists().execute();
    await db.executeQuery(sql`drop type document_type`.compile(db));
    await db.executeQuery(sql`drop type document_status`.compile(db));

    await db.schema.dropTable('clients').ifExists().execute();
    await db.schema.dropTable('usersOrganizations').ifExists().execute();
    await db.schema.dropTable('organizations').ifExists().execute();
    await db.schema.alterTable('users').dropColumn('companyId').execute();
    await db.schema.dropTable('companies').ifExists().execute();
}

import {Kysely, sql} from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
    await db.schema
        .createTable('users')
        .ifNotExists()
        .addColumn('id', 'int8', col => col.generatedAlwaysAsIdentity().primaryKey())
        .addColumn('createdAt', 'timestamptz', col => col.defaultTo(sql`now()`).notNull())
        .addColumn('updatedAt', 'timestamptz', col => col.defaultTo(sql`now()`).notNull())
        .addColumn('userId', 'uuid', col => col.references('auth.users.id').onDelete('cascade'))
        .execute();

    await db.executeQuery(sql`create extension if not exists pg_cron;`.compile(db));
    const janitorQuery = `delete
  from
    users
    left join auth.users on users.user_id = auth.users.id
  where
    auth.users.id is null and users.updated_at + interval '1 month' < now();
  `;
    await db.executeQuery(sql`select cron.schedule('users_janitor', '0 0 * * *', ${janitorQuery})`.compile(db));
}

export async function down(db: Kysely<unknown>): Promise<void> {
    await db.schema.dropTable('users').ifExists().execute();
    await db.executeQuery(sql`select cron.unschedule('users_janitor')`.compile(db));
}

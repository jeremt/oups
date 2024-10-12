import {Kysely, sql} from 'kysely';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
    await db.executeQuery(sql`insert into "storage"."buckets" values ('users_avatars', 'users_avatars', null, now(), now(), true)`.compile(db));
    await db.executeQuery(sql`create policy "Allow insert for users_avatars bucket" on "storage"."objects" for insert with check (bucket_id = 'users_avatars')`.compile(db));
    await db.executeQuery(sql`create policy "Allow select for users_avatars bucket" on "storage"."objects" for select using (bucket_id = 'users_avatars')`.compile(db));
    await db.executeQuery(sql`create policy "Allow update for users_avatars bucket" on "storage"."objects" for update using (bucket_id = 'users_avatars')`.compile(db));
    await db.executeQuery(sql`create policy "Allow delete for users_avatars bucket" on "storage"."objects" for delete using (bucket_id = 'users_avatars')`.compile(db));

    await db.executeQuery(sql`insert into "storage"."buckets" values ('clients_logos', 'clients_logos', null, now(), now(), true)`.compile(db));
    await db.executeQuery(sql`create policy "Allow insert for clients_logos bucket" on "storage"."objects" for insert with check (bucket_id = 'users_avatars')`.compile(db));
    await db.executeQuery(sql`create policy "Allow select for clients_logos bucket" on "storage"."objects" for select using (bucket_id = 'users_avatars')`.compile(db));
    await db.executeQuery(sql`create policy "Allow update for clients_logos bucket" on "storage"."objects" for update using (bucket_id = 'users_avatars')`.compile(db));
    await db.executeQuery(sql`create policy "Allow delete for clients_logos bucket" on "storage"."objects" for delete using (bucket_id = 'users_avatars')`.compile(db));

    await db.executeQuery(sql`insert into "storage"."buckets" values ('companies_logos', 'companies_logos', null, now(), now(), true)`.compile(db));
    await db.executeQuery(sql`create policy "Allow insert for companies_logos bucket" on "storage"."objects" for insert with check (bucket_id = 'users_avatars')`.compile(db));
    await db.executeQuery(sql`create policy "Allow select for companies_logos bucket" on "storage"."objects" for select using (bucket_id = 'users_avatars')`.compile(db));
    await db.executeQuery(sql`create policy "Allow update for companies_logos bucket" on "storage"."objects" for update using (bucket_id = 'users_avatars')`.compile(db));
    await db.executeQuery(sql`create policy "Allow delete for companies_logos bucket" on "storage"."objects" for delete using (bucket_id = 'users_avatars')`.compile(db));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
    await db.executeQuery(sql`drop policy "Allow insert for users_avatars bucket" on "storage"."objects"`.compile(db));
    await db.executeQuery(sql`drop policy "Allow select for users_avatars bucket" on "storage"."objects"`.compile(db));
    await db.executeQuery(sql`drop policy "Allow update for users_avatars bucket" on "storage"."objects"`.compile(db));
    await db.executeQuery(sql`drop policy "Allow delete for users_avatars bucket" on "storage"."objects"`.compile(db));
    await db.executeQuery(sql`delete from "storage"."objects" where "bucket_id" = 'users_avatars'`.compile(db));
    await db.executeQuery(sql`delete from "storage"."buckets" where "id" = 'users_avatars'`.compile(db));

    await db.executeQuery(sql`drop policy "Allow insert for clients_logos bucket" on "storage"."objects"`.compile(db));
    await db.executeQuery(sql`drop policy "Allow select for clients_logos bucket" on "storage"."objects"`.compile(db));
    await db.executeQuery(sql`drop policy "Allow update for clients_logos bucket" on "storage"."objects"`.compile(db));
    await db.executeQuery(sql`drop policy "Allow delete for clients_logos bucket" on "storage"."objects"`.compile(db));
    await db.executeQuery(sql`delete from "storage"."objects" where "bucket_id" = 'clients_logos'`.compile(db));
    await db.executeQuery(sql`delete from "storage"."buckets" where "id" = 'clients_logos'`.compile(db));

    await db.executeQuery(sql`drop policy "Allow insert for companies_logos bucket" on "storage"."objects"`.compile(db));
    await db.executeQuery(sql`drop policy "Allow select for companies_logos bucket" on "storage"."objects"`.compile(db));
    await db.executeQuery(sql`drop policy "Allow update for companies_logos bucket" on "storage"."objects"`.compile(db));
    await db.executeQuery(sql`drop policy "Allow delete for companies_logos bucket" on "storage"."objects"`.compile(db));
    await db.executeQuery(sql`delete from "storage"."objects" where "bucket_id" = 'companies_logos'`.compile(db));
    await db.executeQuery(sql`delete from "storage"."buckets" where "id" = 'companies_logos'`.compile(db));
}

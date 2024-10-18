import {Kysely, sql} from 'kysely';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
    await db.executeQuery(
        sql`create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (user_id)
  values (new.id);
  return new;
end;
$$;`.compile(db),
    );

    await db.executeQuery(
        sql`create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();`.compile(db),
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.executeQuery(sql`drop trigger if exists on_auth_user_created on auth.users;`.compile(db));
  await db.executeQuery(sql`drop function if exists public.handle_new_user();`.compile(db));
}

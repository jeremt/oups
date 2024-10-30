import type {Clients} from '$lib/kysely/gen/public/Clients';
import {kysely} from '$lib/kysely/kysely';
import {error, json} from '@sveltejs/kit';
import {sql} from 'kysely';

export async function GET({locals}) {
    const user = await locals.getUser();
    if (user.type === 'anon') {
        throw error(401, 'Connected buddy');
    }

    const companyData = await kysely
        .selectFrom('public.companies')
        .leftJoin('public.users', 'public.users.companyId', 'public.companies.id')
        .leftJoin('public.usersOrganizations', 'public.usersOrganizations.userId', 'public.users.id')
        .leftJoin('public.clients', 'public.clients.companyId', 'public.companies.id')
        .select(['public.companies.id', 'public.companies.invoiceSequence', 'public.companies.quoteSequence', sql<Clients>`json_agg(clients)->0`.as('client')])
        .where('public.users.id', '=', user.id)
        .groupBy('public.companies.id')
        .executeTakeFirst();

    return json(companyData);
}

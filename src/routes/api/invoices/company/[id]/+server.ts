import {kysely} from '$lib/kysely/kysely.js';
import {json} from '@sveltejs/kit';

export async function GET({params}) {
    const invoices = await kysely.selectFrom('public.documents').selectAll().where('companyId', '=', parseInt(params.id)).orderBy('number', 'desc').execute();
    return json(invoices);
}

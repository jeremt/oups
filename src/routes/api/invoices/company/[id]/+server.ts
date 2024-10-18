import {CompaniesId} from '$lib/kysely/gen/public/Companies.js';
import {kysely} from '$lib/kysely/kysely.js';
import {json} from '@sveltejs/kit';

export async function GET({params}) {
    const invoices = await kysely
        .selectFrom('documents')
        .selectAll()
        .where('company_id', '=', parseInt(params.id) as CompaniesId)
        .orderBy('number', 'desc')
        .execute();

    return json(invoices);
}

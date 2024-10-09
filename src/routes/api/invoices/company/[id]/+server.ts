import {json} from '@sveltejs/kit';

export async function GET({locals, params}) {
    return json(
        await locals.pbAdmin.collection('invoices').getFullList({
            filter: `company_id='${params.id}'`,
            expand: 'company_id,client_id,organization_id',
        }),
    );
}

import {json} from '@sveltejs/kit';

export async function GET({params, locals}) {
    return json(
        await locals.pb_admin.collection('invoices').getFullList({
            filter: `company_id='${params.id}'`,
            expand: 'company_id,client_id,organization_id',
        }),
    );
}

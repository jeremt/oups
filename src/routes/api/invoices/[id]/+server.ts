import {error, json} from '@sveltejs/kit';
import {verifyUpdateInvoice} from '../schema.js';

export async function PATCH({params, request, locals}) {
    const data = (await request.json()) as Record<string, unknown>;
    if (!verifyUpdateInvoice(data)) {
        throw error(400, verifyUpdateInvoice.errors?.join('  '));
    }
    return json(await locals.pb_admin.collection('invoices').update(params.id, data, {expand: 'company_id,client_id,organization_id'}));
}

export async function DELETE({params, locals}) {
    const deleted = await locals.pb_admin.collection('invoices').delete(params.id);
    return json({deleted});
}

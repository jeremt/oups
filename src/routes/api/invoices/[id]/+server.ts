import {json} from '@sveltejs/kit';
import {verifyUpdateInvoice} from '../schema.js';

export async function PATCH({locals, params, request}) {
    const data = (await request.json()) as Record<string, unknown>;
    if (!verifyUpdateInvoice(data)) {
        return json({error: verifyUpdateInvoice.errors}, {status: 400});
    }
    return json(await locals.pbAdmin.collection('invoices').update(params.id, data, {expand: 'company_id,client_id,organization_id'}));
}

export async function DELETE({locals, params}) {
    const deleted = await locals.pbAdmin.collection('invoices').delete(params.id);
    return json({deleted});
}

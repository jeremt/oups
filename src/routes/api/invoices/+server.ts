import {json} from '@sveltejs/kit';
import {verifyAddInvoice} from './schema.js';
import {type Invoice} from '$lib/pocketbase/pocketbase.js';

export async function POST({locals, request}) {
    const contentType = request.headers.get('content-type');
    if (request.headers.get('content-type') !== 'application/json') {
        return json({error: `Content-Type: ${contentType} not handled, use "application/json" instead`}, {status: 400});
    }
    const data = (await request.json()) as Omit<Invoice, 'status' | 'created' | 'updated' | 'id' | 'expand' | 'number'>;
    if (!verifyAddInvoice(data)) {
        return json({error: verifyAddInvoice.errors}, {status: 400});
    }
    const {current_invoice_number} = await locals.pbAdmin.collection('companies').getOne(data.company_id);

    const invoice = await locals.pbAdmin.collection('invoices').create(
        {
            ...data,
            number: current_invoice_number + 1,
            status: 'generated',
        },
        {expand: 'company_id,client_id,organization_id'},
    );
    await locals.pbAdmin.collection('companies').update(data.company_id, {
        current_invoice_number: current_invoice_number + 1,
    });
    return json({invoice});
}

import {error, json} from '@sveltejs/kit';
import {verifyAddInvoice} from './schema.js';
import {type Invoice} from '$lib/pocketbase/pocketbase.js';

export async function POST({request, locals}) {
    const data = (await request.json()) as Omit<Invoice, 'status' | 'created' | 'updated' | 'id' | 'expand' | 'number'>;
    if (!verifyAddInvoice(data)) {
        throw error(400, verifyAddInvoice.errors?.join('  '));
    }
    const {current_invoice_number} = await locals.pb_admin.collection('companies').getOne(data.company_id);

    const invoice = await locals.pb_admin.collection('invoices').create(
        {
            ...data,
            number: current_invoice_number + 1,
            status: 'generated',
        },
        {expand: 'company_id,client_id,organization_id'},
    );
    await locals.pb_admin.collection('companies').update(data.company_id, {
        current_invoice_number: current_invoice_number + 1,
    });
    return json({invoice});
}

import {json} from '@sveltejs/kit';
import {verifyAddInvoice} from './schema.js';
import {kysely} from '$lib/kysely/kysely.js';
import {NewDocuments} from '$lib/kysely/gen/public/Documents.js';

export async function POST({request}) {
    const contentType = request.headers.get('content-type');
    if (request.headers.get('content-type') !== 'application/json') {
        return json({error: `Content-Type: ${contentType} not handled, use "application/json" instead`}, {status: 400});
    }
    const data = (await request.json()) as Omit<NewDocuments, 'number' | 'status' | 'invoice'>;
    if (!verifyAddInvoice(data)) {
        return json({error: verifyAddInvoice.errors}, {status: 400});
    }

    const invoice = await kysely.transaction().execute(async trx => {
        const {invoice_sequence} = await trx
            .updateTable('companies')
            .set(eb => ({invoice_sequence: eb('invoice_sequence', '+', 1)}))
            .where('id', '=', data.company_id)
            .returning('invoice_sequence')
            .executeTakeFirstOrThrow();
        return await trx
            .insertInto('documents')
            .values({
                ...data,
                type: 'invoice',
                number: invoice_sequence,
                status: 'generated',
            })
            .returningAll()
            .executeTakeFirstOrThrow();
    });
    return json(invoice);
}

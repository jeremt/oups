import {json} from '@sveltejs/kit';
import {verifyUpdateInvoice} from '../schema.js';
import {kysely} from '$lib/kysely/kysely.js';
import type {DocumentsId, DocumentsUpdate} from '$lib/kysely/gen/public/Documents.js';

export async function PATCH({params, request}) {
    const data = (await request.json()) as DocumentsUpdate;
    if (!verifyUpdateInvoice(data)) {
        return json({error: verifyUpdateInvoice.errors}, {status: 400});
    }
    const invoice = await kysely
        .updateTable('documents')
        .set(data)
        .where('id', '=', parseInt(params.id) as DocumentsId)
        .returningAll()
        .executeTakeFirst();

    return json(invoice);
}

export async function DELETE({params}) {
    await kysely
        .deleteFrom('documents')
        .where('id', '=', parseInt(params.id) as DocumentsId)
        .execute();
    return json({});
}

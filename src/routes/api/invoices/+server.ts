import {json} from '@sveltejs/kit';
import {kysely} from '$lib/kysely/kysely';
import {NewDocuments} from '$lib/kysely/gen/public/Documents';
import {createValidator} from '$lib/schema/validate';

const validatePOST = createValidator({
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    additionalProperties: false,
    properties: {
        name: {type: 'string'},
        clientId: {type: 'string'},
        companyId: {type: 'string'},
        emittedAt: {type: 'string'},
        lines: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    description: {type: 'string'},
                    price: {
                        type: 'number',
                    },
                },
                required: ['description', 'price'],
            },
        },
        organisationId: {type: 'string'},
        quantity_label: {type: 'string'},
    },
    required: ['clientId', 'companyId', 'emittedAt', 'lines', 'name', 'organisationId', 'quantity_label'],
});

export async function POST({request}) {
    const contentType = request.headers.get('content-type');
    if (request.headers.get('content-type') !== 'application/json') {
        return json({error: `Content-Type: ${contentType} not handled, use "application/json" instead`}, {status: 400});
    }
    const data = (await request.json()) as Omit<NewDocuments, 'number' | 'status' | 'invoice'>;
    if (!validatePOST(data)) {
        return json({error: validatePOST.errors}, {status: 400});
    }

    const invoice = await kysely.transaction().execute(async trx => {
        const {invoiceSequence} = await trx
            .updateTable('public.companies')
            .set(eb => ({invoiceSequence: eb('public.companies.invoiceSequence', '+', 1)}))
            .where('id', '=', data.companyId)
            .returning('invoiceSequence')
            .executeTakeFirstOrThrow();
        return await trx
            .insertInto('public.documents')
            .values({
                ...data,
                type: 'invoice',
                number: invoiceSequence,
                status: 'generated',
            })
            .returningAll()
            .executeTakeFirstOrThrow();
    });
    return json(invoice);
}

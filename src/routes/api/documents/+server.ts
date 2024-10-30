import {json} from '@sveltejs/kit';
import {kysely} from '$lib/kysely/kysely';
import {createValidator} from '$lib/schema/validate';

const validatePOST = createValidator({
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    additionalProperties: false,
    properties: {
        name: {type: 'string'},
        note: {type: 'string'},
        clientId: {type: 'number'},
        companyId: {type: 'number'},
        emittedAt: {type: 'string'},
        lines: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    description: {type: 'string'},
                    price: {type: 'number'},
                },
                required: ['description', 'price'],
            },
        },
        organisationId: {type: 'number'},
        quantityLabel: {type: 'string'},
        quantityBase: {type: 'number'},
    },
    required: ['clientId', 'companyId', 'emittedAt', 'lines', 'name', 'quantityLabel', 'quantityBase'],
});

export async function POST({request}) {
    const data = await request.json();
    if (!validatePOST(data)) {
        return json({error: validatePOST.errors}, {status: 400});
    }
    const {id} = await kysely.transaction().execute(async trx => {
        const {quoteSequence} = await trx
            .updateTable('public.companies')
            .set(eb => ({quoteSequence: eb('public.companies.quoteSequence', '+', 1)}))
            .where('id', '=', data.companyId)
            .returning('quoteSequence')
            .executeTakeFirstOrThrow();
        return await trx
            .insertInto('public.documents')
            .values({
                ...data,
                lines: JSON.stringify(data.lines),
                type: 'quote',
                number: quoteSequence - 1,
                status: 'generated',
            })
            .returning('public.documents.id')
            .executeTakeFirstOrThrow();
    });
    return json({id});
}

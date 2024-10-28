import {json} from '@sveltejs/kit';
import {kysely} from '$lib/kysely/kysely.js';
import type {DocumentsId, DocumentsUpdate} from '$lib/kysely/gen/public/Documents.js';
import Ajv from 'ajv';

const ajv = new Ajv({removeAdditional: true});

const validatePATCH = ajv.compile({
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    additionalProperties: false,
    properties: {
        status: {type: 'string', enum: ['generated', 'sent', 'paid', 'declared']},
        company_id: {type: 'string'},
        client_id: {type: 'string'},
        organization_id: {type: 'string'},
        emission_date: {type: 'string'},
        name: {type: 'string'},
        lines: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    description: {
                        type: 'string',
                    },
                    price: {
                        type: 'number',
                    },
                },
                required: ['description', 'price'],
            },
        },
        quantity_label: {type: 'string'},
    },
});

export async function PATCH({params, request}) {
    const data = (await request.json()) as DocumentsUpdate;
    if (!validatePATCH(data)) {
        return json({error: validatePATCH.errors}, {status: 400});
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

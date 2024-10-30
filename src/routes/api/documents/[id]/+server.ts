import {json} from '@sveltejs/kit';
import {kysely} from '$lib/kysely/kysely';
import {createValidator} from '$lib/schema/validate';

const validatePATCH = createValidator({
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    additionalProperties: false,
    properties: {
        status: {type: 'string', enum: ['generated', 'sent', 'paid', 'declared'] as const},
        companyId: {type: 'number'},
        clientId: {type: 'number'},
        organizationId: {type: 'number'},
        emittedAt: {type: 'string'},
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
    required: ['name', 'status', 'emittedAt'],
});

export async function PATCH({params, request}) {
    const data = await request.json(); // cast in necessary because status enum is not properly infered
    if (!validatePATCH(data)) {
        return json({error: validatePATCH.errors}, {status: 400});
    }
    const invoice = await kysely.updateTable('public.documents').set(data).where('id', '=', parseInt(params.id)).returningAll().executeTakeFirst();

    return json(invoice);
}

export async function DELETE({params}) {
    await kysely.deleteFrom('public.documents').where('id', '=', parseInt(params.id)).execute();
    return json({});
}

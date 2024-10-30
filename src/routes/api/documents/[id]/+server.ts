import {json} from '@sveltejs/kit';
import {kysely} from '$lib/kysely/kysely';
import {createValidator} from '$lib/schema/validate';
import {Companies} from '$lib/kysely/gen/public/Companies';
import {sql} from 'kysely';
import {Clients} from '$lib/kysely/gen/public/Clients';

const validatePUT = createValidator({
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    additionalProperties: false,
    properties: {
        status: {type: 'string', enum: ['generated', 'sent', 'paid', 'declared'] as const},
        companyId: {type: 'number'},
        clientId: {type: 'number'},
        organizationId: {anyOf: [{type: 'number'}, {type: 'null'}]},
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
        quantityLabel: {type: 'string'},
        quantityBase: {type: 'number'},
        depositPercent: {type: 'number'},
        discountPrice: {type: 'number'},
    },
    required: ['name', 'status', 'emittedAt'],
});

export async function PUT({params, request}) {
    const data = await request.json();
    if (!validatePUT(data)) {
        return json({error: validatePUT.errors}, {status: 400});
    }
    const invoice = await kysely
        .updateTable('public.documents')
        .set({...data, lines: JSON.stringify(data.lines)})
        .where('id', '=', parseInt(params.id))
        .returningAll()
        .executeTakeFirst();

    return json(invoice);
}

export async function DELETE({params}) {
    await kysely.deleteFrom('public.documents').where('id', '=', parseInt(params.id)).execute();
    return json({});
}

export async function GET({params}) {
    const document = await kysely
        .selectFrom('public.documents')
        .select([
            'public.documents.id',
            'public.documents.status',
            'public.documents.lines',
            'public.documents.name',
            'public.documents.note',
            'public.documents.number',
            'public.documents.emittedAt',
            'public.documents.quantityBase',
            'public.documents.quantityLabel',
            'public.documents.organizationId',
            'public.documents.type',
            'public.documents.createdAt',
            'public.documents.updatedAt',
            'public.documents.companyId',
            'public.documents.clientId',
            sql<Companies>`json_agg(companies)->0`.as('company'),
            sql<Clients>`json_agg(clients)->0`.as('client'),
        ])
        .leftJoin('public.companies', 'public.companies.id', 'public.documents.companyId')
        .leftJoin('public.clients', 'public.clients.id', 'public.documents.clientId')
        .where('public.documents.id', '=', parseInt(params.id))
        .groupBy('public.documents.id')
        .executeTakeFirst();

    return json(document);
}

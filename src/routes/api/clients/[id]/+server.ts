import Ajv from 'ajv';
import {error, json} from '@sveltejs/kit';
import {kysely} from '$lib/kysely/kysely.js';
import type {ClientsUpdate} from '$lib/kysely/gen/public/Clients.js';

const ajv = new Ajv({removeAdditional: true});

const validatePATCH = ajv.compile({
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    additionalProperties: false,
    properties: {
        name: {type: 'string'},
        address: {type: 'string'},
        email: {type: 'string'},
        companyId: {type: 'number'},
    },
    required: ['name', 'address', 'companyId'],
});

export async function PATCH({params, request}) {
    const id = parseInt(params.id);

    const data = (await request.json()) as ClientsUpdate;
    if (!validatePATCH(data)) {
        return error(400, validatePATCH.errors?.map(e => e.message).join('\n'));
    }
    const client = await kysely.updateTable('public.clients').set(data).where('id', '=', id).returningAll().executeTakeFirstOrThrow();

    return json(client);
}

export async function DELETE({params}) {
    const id = parseInt(params.id);

    await kysely.deleteFrom('public.clients').where('id', '=', id).execute();
    return json({});
}

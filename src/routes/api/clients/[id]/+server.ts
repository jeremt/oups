import Ajv from 'ajv';
import {error, json} from '@sveltejs/kit';
import {kysely} from '$lib/kysely/kysely.js';
import type {ClientsId, ClientsUpdate} from '$lib/kysely/gen/public/Clients.js';

const ajv = new Ajv({removeAdditional: true});

const validatePATCH = ajv.compile({
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    additionalProperties: false,
    properties: {
        name: {type: 'string'},
        address: {type: 'string'},
        email: {type: 'string'},
        company_id: {type: 'number'},
    },
    required: ['name', 'address', 'company_id'],
});

export async function PATCH({params, request}) {
    const id = parseInt(params.id);

    const data = (await request.json()) as ClientsUpdate;
    if (!validatePATCH(data)) {
        return error(400, validatePATCH.errors?.map(e => e.message).join('\n'));
    }
    const client = await kysely
        .updateTable('clients')
        .set(data)
        .where('id', '=', id as ClientsId)
        .returningAll()
        .executeTakeFirstOrThrow();

    return json(client);
}

export async function DELETE({params}) {
    const id = parseInt(params.id);

    await kysely
        .deleteFrom('clients')
        .where('id', '=', id as ClientsId)
        .execute();
    return json({});
}

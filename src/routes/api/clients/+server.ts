import {error, json} from '@sveltejs/kit';
import {kysely} from '$lib/kysely/kysely.js';
import type {NewClients} from '$lib/kysely/gen/public/Clients.js';
import Ajv from 'ajv';

const ajv = new Ajv({removeAdditional: true});

export async function GET() {
    const clients = await kysely.selectFrom('public.clients').selectAll().execute();
    return json(clients);
}

const validatePOST = ajv.compile({
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

export async function POST({request}) {
    const data = (await request.json()) as NewClients;
    if (!validatePOST(data)) {
        throw error(400, validatePOST.errors?.map(e => e.message).join('\n'));
    }
    return json(await kysely.insertInto('public.clients').values(data).returningAll().executeTakeFirst());
}

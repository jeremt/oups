import {kysely} from '$lib/kysely/kysely';
import {error, json} from '@sveltejs/kit';
import {createValidator} from '$lib/schema/validate';

const validatePATCH = createValidator({
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    additionalProperties: false,
    properties: {
        name: {type: 'string'},
        address: {type: 'string'},
        bic: {type: 'string'},
        iban: {type: 'string'},
        siren: {type: 'string'},
        email: {type: 'string'},
    },
    required: ['name', 'address', 'bic', 'iban', 'siren', 'email'],
});

export async function PATCH({params, request}) {
    const id = parseInt(params.id);

    const data = await request.json();
    if (!validatePATCH(data)) {
        return error(400, validatePATCH.errors?.map(e => e.message).join('\n'));
    }
    const client = await kysely.updateTable('public.companies').set(data).where('id', '=', id).returningAll().executeTakeFirstOrThrow();

    return json(client);
}

export async function DELETE({params}) {
    const id = parseInt(params.id);

    await kysely.deleteFrom('public.companies').where('id', '=', id).execute();
    return json({});
}

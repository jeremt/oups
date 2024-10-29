import {kysely} from '$lib/kysely/kysely';
import {getCompanies} from '$lib/kysely/queries';
import {createValidator} from '$lib/schema/validate';
import {error, json} from '@sveltejs/kit';

export async function GET({locals}) {
    const user = await locals.getUser();
    if (user.type === 'anon') {
        throw error(401, 'You need to be connected');
    }
    const companies = await getCompanies(user);
    return json(companies);
}

const validatePOST = createValidator({
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

export async function POST({request, locals}) {
    const user = await locals.getUser();
    const data = await request.json();
    if (!validatePOST(data)) {
        throw error(400, validatePOST.errors?.map(e => e.message).join('\n'));
    }
    const company = await kysely.insertInto('public.companies').values(data).returningAll().executeTakeFirst();
    if (!company) {
        throw error(500, `Failed to create company`);
    }
    // TODO: handle organisations, for now the company automatically become the connected user company
    await kysely.updateTable('public.users').set({companyId: company?.id}).where('id', '=', user.id).execute();
    return json(company);
}

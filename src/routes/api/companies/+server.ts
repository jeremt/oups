import {getCompanies} from '$lib/api/api';
import {error, json} from '@sveltejs/kit';

export async function GET({locals}) {
    const user = await locals.getUser();
    if (user.type === 'anon') {
        throw error(401, 'You need to be connected');
    }
    const companies = await getCompanies(user);
    return json(companies);
}

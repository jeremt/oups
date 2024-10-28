import {getCompanies, getDocuments} from '$lib/kysely/queries';
import {redirect} from '@sveltejs/kit';

export async function load({locals}) {
    const user = await locals.getUser();
    if (user.type === 'anon') throw redirect(302, '/');

    const companies = await getCompanies(user);

    return {
        companies,
        documents: await getDocuments(
            companies.map(c => c.id as number),
            'invoice',
        ),
    };
}

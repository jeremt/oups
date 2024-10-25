import {getCompanies, getInvoices} from '$lib/api/api';
import {redirect} from '@sveltejs/kit';

export async function load({locals}) {
    const user = await locals.getUser();
    if (user.type === 'anon') throw redirect(302, '/');

    const companies = await getCompanies(user);

    return {
        companies,
        invoices: await getInvoices(companies.map(c => c.id as number)),
    };
}

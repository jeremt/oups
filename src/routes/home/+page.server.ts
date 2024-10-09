import {redirect} from '@sveltejs/kit';

export async function load({locals}) {
    const user = await locals.getUser();
    if (!user) throw redirect(302, '/');

    const invoices = await locals.pbAdmin.collection('invoices').getFullList({expand: 'company_id,client_id,organization_id'});
    const companies = await locals.pbAdmin.collection('companies').getFullList();

    return {
        company: companies[0],
        invoices,
    };
}

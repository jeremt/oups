export async function load({locals}) {
    const companies = await locals.pb.collection('companies').getFullList();
    const invoices = await locals.pb.collection('invoices').getFullList({expand: 'company_id,client_id,organization_id'});

    return {
        invoices,
        company: companies[0],
    };
}

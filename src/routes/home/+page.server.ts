import { pb } from '$lib/pocketbase/pocketbase';

export async function load() {
	const invoices = await pb
		.collection('invoices')
		.getFullList({ expand: 'company_id,client_id,organization_id' });
	return {
		invoices
	};
}

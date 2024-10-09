import { pb } from '$lib/pocketbase/pocketbase.js';
import { json } from '@sveltejs/kit';

export async function GET({ params }) {
	return json(
		await pb.collection('invoices').getFullList({
			filter: `company_id='${params.id}'`,
			expand: 'company_id,client_id,organization_id'
		})
	);
}

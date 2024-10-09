import { json } from '@sveltejs/kit';
import { verifyUpdateInvoice } from '../schema.js';
import { pb } from '$lib/pocketbase/pocketbase.js';

export async function PATCH({ params, request }) {
	const contentType = request.headers.get('content-type');
	if (request.headers.get('content-type') !== 'application/json') {
		return json(
			{ error: `Content-Type: ${contentType} not handled, use "application/json" instead` },
			{ status: 400 }
		);
	}
	const data = (await request.json()) as Record<string, unknown>;
	if (!verifyUpdateInvoice(data)) {
		return json({ error: verifyUpdateInvoice.errors }, { status: 400 });
	}
	return json(
		await pb
			.collection('invoices')
			.update(params.id, data, { expand: 'company_id,client_id,organization_id' })
	);
}

export async function DELETE({ params }) {
	const deleted = await pb.collection('invoices').delete(params.id);
	return json({ deleted });
}

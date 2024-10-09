import {error, json} from '@sveltejs/kit';
import {verifyUpdateClient} from '../schema.js';

export async function PATCH({params, request, locals}) {
    const data = (await request.json()) as Record<string, unknown>;
    if (!verifyUpdateClient(data)) {
        return error(400, verifyUpdateClient.errors?.join('  '));
    }
    const client = await locals.pb_admin.collection('clients').update(params.id, data);
    return json(client);
}

export async function DELETE({params, locals}) {
    const deleted = await locals.pb_admin.collection('clients').delete(params.id);
    return json({deleted});
}

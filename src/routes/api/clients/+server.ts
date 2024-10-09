import {error, json} from '@sveltejs/kit';
import {verifyAddClient} from './schema.js';
import type {Client} from '$lib/pocketbase/pocketbase.js';

export async function GET({locals}) {
    return json(await locals.pbAdmin.collection('clients').getFullList());
}

export async function POST({request, locals}) {
    const data = (await request.json()) as Omit<Client, 'id' | 'created' | 'updated'>;
    if (!verifyAddClient(data)) {
        throw error(400, verifyAddClient.errors?.join('  '));
    }
    return json(await locals.pbAdmin.collection('clients').create(data));
}

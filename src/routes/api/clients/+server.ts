import {error, json} from '@sveltejs/kit';
import {verifyAddClient} from './schema.js';
import {kysely} from '$lib/kysely/kysely.js';
import type {NewClients} from '$lib/kysely/gen/public/Clients.js';

export async function GET() {
    const clients = await kysely.selectFrom('clients').selectAll().execute();
    return json(clients);
}

export async function POST({request}) {
    const data = (await request.json()) as NewClients;
    if (!verifyAddClient(data)) {
        throw error(400, verifyAddClient.errors?.join('  '));
    }
    return json(await kysely.insertInto('clients').values(data).returningAll().executeTakeFirst());
}

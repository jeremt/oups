import {error, json} from '@sveltejs/kit';
import {verifyUpdateClient} from '../schema.js';
import {kysely} from '$lib/kysely/kysely.js';
import type {ClientsId, ClientsUpdate} from '$lib/kysely/gen/public/Clients.js';

export async function PATCH({params, request}) {
    const id = parseInt(params.id);

    const data = (await request.json()) as ClientsUpdate;
    if (!verifyUpdateClient(data)) {
        return error(400, verifyUpdateClient.errors?.map(e => e.message).join('\n'));
    }
    const client = await kysely
        .updateTable('clients')
        .set(data)
        .where('id', '=', id as ClientsId)
        .returningAll()
        .executeTakeFirstOrThrow();

    return json(client);
}

export async function DELETE({params}) {
    const id = parseInt(params.id);

    await kysely
        .deleteFrom('clients')
        .where('id', '=', id as ClientsId)
        .execute();
    return json({});
}

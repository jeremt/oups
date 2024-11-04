import {DocumentStatus} from '$lib/kysely/gen/public/DocumentStatus';
import {kysely} from '$lib/kysely/kysely';
import {json} from '@sveltejs/kit';

const getStatus = (): DocumentStatus => 'accepted';

export async function GET() {
    return json({
        age: 42,
        email: '',
        isAdmin: false,
        status: getStatus(),
        arr: [23, 'salut'],
        clients: await kysely.selectFrom('public.clients').selectAll().execute(),
    });
}

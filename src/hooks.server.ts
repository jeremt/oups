import {pb, pb_admin} from '$lib/pocketbase/pocketbase';
import type {Handle} from '@sveltejs/kit';

export const handle: Handle = async ({event, resolve}) => {
    event.locals.pb = await pb();
    event.locals.pb_admin = await pb_admin();
    return resolve(event);
};

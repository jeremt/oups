import type {Handle} from '@sveltejs/kit';
import {createServerClient} from '$lib/supabase/client';

const cookieName = 'oups_session';

export const handle: Handle = async ({event, resolve}) => {
    const {supabase, getUser} = createServerClient(cookieName, event.cookies);

    event.locals.supabase = supabase;
    event.locals.getUser = getUser;

    return resolve(event);
};

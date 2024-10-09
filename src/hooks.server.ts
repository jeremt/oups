import {pb, pb_admin, type User} from '$lib/pocketbase/pocketbase';
import {AsyncAuthStore} from 'pocketbase';
import type {Handle} from '@sveltejs/kit';

const cookieName = 'oups_session';

export const handle: Handle = async ({event, resolve}) => {
    event.locals.pb = await pb(
        new AsyncAuthStore({
            async save(token) {
                event.cookies.set(cookieName, token, {
                    path: '/',
                    maxAge: 3600 * 24 * 30,
                    secure: import.meta.env.NODE_ENV === 'production',
                    httpOnly: true,
                    sameSite: 'strict',
                });
            },
            async clear() {
                event.cookies.delete(cookieName, {
                    path: '/',
                    maxAge: 3600 * 24 * 30,
                    secure: import.meta.env.NODE_ENV === 'production',
                    httpOnly: true,
                    sameSite: 'strict',
                });
            },
            initial: event.cookies.get(cookieName),
        }),
    );
    event.locals.pbAdmin = await pb_admin();

    event.locals.getUser = async () => {
        try {
            if (event.locals.pb.authStore.isValid) {
                const user = await event.locals.pb.collection('users').authRefresh();
                return user.record as unknown as User;
            }
        } catch (error) {
            console.error('getUser failed: ', {error});
            event.locals.pb.authStore.clear();
            return undefined;
        }
    };

    return resolve(event);
};

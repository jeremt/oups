import {createClient, type Session, type User as SupabaseUser} from '@supabase/supabase-js';
import type {Cookies} from '@sveltejs/kit';
import type {ConnectedUser, User} from './user';
import {SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL} from '$env/static/private';
import {combineChunk, createChunks, destroyChunks} from './cookieChunker';
import {kysely} from '$lib/kysely/kysely';

const adminEmails = ['20cent.neel@gmail.com', 'taboada.jeremie@gmail.com', 'jonathan.picques@gmail.com'];

export function createServerClient(storageKey: string, cookies: Cookies) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            flowType: 'pkce',
            storageKey,
            persistSession: true,
            autoRefreshToken: false,
            detectSessionInUrl: false,
            storage: {
                isServer: true,
                getItem(key) {
                    return combineChunk(key, cookies.get) ?? null;
                },
                removeItem(key) {
                    destroyChunks(key, cookies.get, name => {
                        cookies.delete(name, {path: '/', httpOnly: true, sameSite: 'lax'});
                    });
                },
                setItem(key, value) {
                    try {
                        const chunks = createChunks(key, value, 2500);
                        for (const chunk of chunks) {
                            cookies.set(chunk.name, chunk.value, {
                                path: '/',
                                maxAge: 365 * 60 * 60 * 24 * 1000,
                                secure: process.env.NODE_ENV === 'production',
                                httpOnly: true,
                                sameSite: 'lax',
                            });
                        }
                    } catch (err) {
                        // do not kill server
                        console.warn("Can't set auth cookies:", err);
                    }
                },
            },
        },
    });
    return {
        supabase,
        // TODO: optimize to remove buildUser when not necessary
        getUser: async () => {
            const sessionCookie = combineChunk(storageKey, cookies.get);
            if (sessionCookie) {
                try {
                    const session: Session = JSON.parse(decodeURIComponent(sessionCookie));
                    if (session?.user && session?.expires_at && session.expires_at * 1000 > new Date().getTime()) {
                        // Warning: this can lead to a lot of weird stuff (delay or bugs)
                        // console.log(`set Session`);
                        // await supabase.auth.setSession(session);
                        return buildUser(session.user);
                    }
                } catch (_) {
                    console.error(_);
                    // Ignore catch, cookie has been tampered and we must get the user from supabase
                }
            }
            const authUser = await supabase.auth.getUser();
            if (authUser.data.user !== null) {
                return buildUser(authUser.data.user);
            }
            const anonId = cookies.get('anon_id');

            // No anonId, so we just create one
            if (anonId === undefined) {
                const anonUser = await kysely.insertInto('public.users').defaultValues().returning('id').executeTakeFirstOrThrow();
                cookies.set('anon_id', anonUser.id.toString(), {
                    path: '/',
                    maxAge: 60 * 60 * 24 * 30, // one month
                    secure: process.env.NODE_ENV === 'production',
                    httpOnly: true,
                    sameSite: 'strict',
                });
                return {type: 'anon', id: anonUser.id} satisfies User;
            } else {
                // anonId is specified so try to fetch him
                const anonUser = await kysely.selectFrom('public.users').select('id').executeTakeFirst();
                // if the cookie has been tampered with (anonUser does not exist), we still have to create one
                if (!anonUser) {
                    const anonUser = await kysely.insertInto('public.users').defaultValues().returning('id').executeTakeFirstOrThrow();
                    cookies.set('anon_id', anonUser.id.toString(), {
                        path: '/',
                        maxAge: 60 * 60 * 24 * 30, // one month
                        secure: process.env.NODE_ENV === 'production',
                        httpOnly: true,
                        sameSite: 'strict',
                    });
                    return {type: 'anon', id: anonUser.id} satisfies User;
                } else {
                    return {type: 'anon', id: anonUser.id} satisfies User;
                }
            }
        },
    };
}

/**
 * Fetch all additional info to create the user from the
 * supabase user.
 */
async function buildUser(supabaseUser: SupabaseUser): Promise<ConnectedUser> {
    const {id} = await kysely.selectFrom('public.users').select(['public.users.id']).where('public.users.userId', '=', supabaseUser.id).executeTakeFirstOrThrow();
    return {
        id,
        name: supabaseUser.user_metadata.name,
        type: 'connected',
        admin: adminEmails.includes(supabaseUser.email!) ? true : undefined,
        email: supabaseUser.email!,
        avatar_url: supabaseUser.user_metadata.avatar_url ?? '',
    };
}

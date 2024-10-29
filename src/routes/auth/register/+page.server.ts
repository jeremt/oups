import {kysely} from '$lib/kysely/kysely';
import {fail, redirect} from '@sveltejs/kit';

export const actions = {
    default: async ({locals, request, cookies}) => {
        const form = await request.formData();
        const email = form.get('email')?.toString();
        const password = form.get('password')?.toString();

        if (!email || !password) {
            return fail(400, {email, status: 'invalid', message: ''});
        }

        const user = await locals.getUser(); // needs to be called before signup

        const {data, error} = await locals.supabase.auth.signUp({email, password});
        if (error || data.user === null) {
            return fail(403, {email, status: 'login_failed', message: error ? error?.message : 'User is null'});
        }

        await kysely.updateTable('public.users').set({userId: data.user.id}).where('id', '=', user.id).execute();

        cookies.delete('anon_id', {path: '/', httpOnly: true, sameSite: 'lax'});

        throw redirect(302, '/home');
    },
};

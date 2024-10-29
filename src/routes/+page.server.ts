import {fail, redirect} from '@sveltejs/kit';

export async function load({locals}) {
    const user = await locals.getUser();

    if (user.type !== 'anon') {
        throw redirect(302, '/home');
    }
}

export const actions = {
    default: async ({locals, request, cookies}) => {
        const form = await request.formData();
        const email = form.get('email')?.toString();
        const password = form.get('password')?.toString();

        if (!email || !password) {
            return fail(400, {email, status: 'invalid', message: ''});
        }

        const {error} = await locals.supabase.auth.signInWithPassword({email, password});
        if (error) {
            return fail(403, {email, status: 'login_failed', message: error?.message});
        }

        cookies.delete('anon_id', {path: '/', httpOnly: true, sameSite: 'lax'});

        throw redirect(302, '/home');
    },
};

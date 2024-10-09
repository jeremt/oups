import {fail, redirect} from '@sveltejs/kit';

export const actions = {
    default: async ({locals, request}) => {
        const form = await request.formData();
        const email = form.get('email')?.toString();
        const password = form.get('password')?.toString();

        if (!email || !password) {
            return fail(400, {email, status: 'invalid', message: ''});
        }

        try {
            await locals.pb.collection('users').authWithPassword(email, password);
        } catch (e: unknown) {
            return fail(403, {email, status: 'login_failed', message: (e as object).toString()});
        }

        throw redirect(302, '/home');
    },
};

import {fail, redirect} from '@sveltejs/kit';

export const actions = {
    default: async ({locals, request}) => {
        const form = await request.formData();
        const email = form.get('email')?.toString();
        const password = form.get('password')?.toString();

        if (!email || !password) {
            return fail(400, {email, invalid: true});
        }

        try {
            const user = await locals.pb.collection('users').authWithPassword(email, password);
            if (user.token) {
                throw redirect(302, '/home');
            }
        } catch (e: unknown) {
            return fail(403, {email, failed: true, message: (e as object).toString()});
        }
    },
};

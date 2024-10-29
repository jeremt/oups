import {error, redirect} from '@sveltejs/kit';

export async function POST({locals: {supabase}}) {
    const {error: err} = await supabase.auth.signOut();

    if (err !== null) {
        console.error(err);
        throw error(500, err.message);
    }
    throw redirect(303, '/');
}

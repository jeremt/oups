// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type {User} from '$lib/supabase/user';
import type {SupabaseClient} from '@supabase/supabase-js';

declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            supabase: SupabaseClient;
            //
            getUser: () => Promise<User>;
        }
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }
}

export {};

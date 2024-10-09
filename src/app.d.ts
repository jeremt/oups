// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type {User, TypedPocketBase} from '$lib/pocketbase/pocketbase';

declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            pb: TypedPocketBase;
            pbAdmin: TypedPocketBase;
            //
            getUser: () => Promise<User | undefined>;
        }
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }
}

export {};

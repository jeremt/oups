// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type {TypedPocketBase} from '$lib/pocketbase/pocketbase';

declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            pb: TypedPocketBase;
            pb_admin: TypedPocketBase;
        }
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }
}

export {};

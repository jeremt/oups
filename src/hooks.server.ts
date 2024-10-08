import { POCKETBASE_ADMIN_EMAIL, POCKETBASE_ADMIN_PASSWORD } from '$env/static/private';
import { pb } from '$lib/pocketbase/pocketbase';
import type { Handle } from '@sveltejs/kit';

let isPocketBaseInitialized = false;

export const handle: Handle = async ({ event, resolve }) => {
	if (!isPocketBaseInitialized) {
		isPocketBaseInitialized = true;
		await pb.admins.authWithPassword(POCKETBASE_ADMIN_EMAIL, POCKETBASE_ADMIN_PASSWORD);
	}
	return resolve(event);
};

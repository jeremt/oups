export const actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const email = form.get('email')?.toString();
		const password = form.get('password')?.toString();

		// TODO: check email/password
		return { email };
	}
};

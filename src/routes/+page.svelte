<script lang="ts">
	let { form } = $props();
</script>

<main>
	<h1>Oups.</h1>
	<h4>Simple bill generator/manager<br />to try not to make mistakes 😬</h4>
	<form method="post">
		<label for="email">Email</label>
		<input id="email" name="email" type="email" autocomplete="email" value={form?.email} />
		<label for="password">Password</label>
		<input id="password" name="password" type="password" autocomplete="current-password" />
		<button type="submit">Login</button>
	</form>
</main>

<style>
</style>

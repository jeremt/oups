<script lang="ts">
	import { navigating } from '$app/stores';
	import { onNavigate } from '$app/navigation';
	import '../app.css';
	import { setColorScheme } from '$lib/color-scheme/color-scheme.svelte';

	setColorScheme();

	let loader = $state(false);
	let { children } = $props();
	$effect(() => {
		if ($navigating) {
			const timeout = setTimeout(() => {
				loader = true;
			}, 500);
			return () => {
				loader = false;
				clearTimeout(timeout);
			};
		} else {
			loader = false;
		}
	});
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

{@render children()}
{#if loader}
	<div class="loader"></div>
{/if}

<style>
	.loader {
		left: 0;
		right: 0;
		bottom: 0;
		height: 0.5rem;
		position: fixed;
		background: linear-gradient(
				90deg,
				var(--color-indigo) 0%,
				var(--color-cyan) 20%,
				var(--color-lime) 40%,
				var(--color-yellow) 60%,
				var(--color-pink) 80%,
				var(--color-purple) 100%
			)
			var(--color-indigo);
		background-size: 300% 100%;
		animation: loader 1s infinite linear;
	}
	@keyframes loader {
		0% {
			background-position: right;
		}
	}
</style>

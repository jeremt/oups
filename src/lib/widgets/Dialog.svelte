<script lang="ts">
	import { type Snippet } from 'svelte';

	let {
		isOpen = false,
		children,
		onrequestclose
	}: { isOpen: boolean; children: Snippet; onrequestclose?: () => void } = $props();

	let dialog: HTMLDialogElement;

	function handleClose(event: Event) {
		event.preventDefault();
		onrequestclose?.();
	}
	function handleAnimationEnd() {
		if (!isOpen) {
			dialog.close();
		}
	}

	$effect(() => {
		if (isOpen) {
			dialog.showModal();
		}
	});
</script>

<dialog
	bind:this={dialog}
	class:closing={!isOpen}
	onclose={handleClose}
	onanimationend={handleAnimationEnd}
>
	{#if children}
		{@render children()}
	{/if}
</dialog>

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	@keyframes fade-out {
		from {
			opacity: 1;
		}
		to {
			opacity: 0;
		}
	}
	@keyframes slide-in {
		from {
			translate: 50% 0;
			opacity: 0;
		}
		to {
			translate: 0;
			opacity: 1;
		}
	}
	@keyframes slide-out {
		from {
			translate: 0;
			opacity: 1;
		}
		to {
			translate: 50% 0;
			opacity: 0;
		}
	}
	dialog {
		color: var(--color-fg);
		border: none;
		overflow: auto;
		width: 70%;
		height: 100vh;
		max-height: 100vh;
		margin: 0 0 0 auto;
		background-color: var(--color-bg);
	}
	dialog[open] {
		display: flex;
		flex-direction: column;
		animation: slide-in 0.3s cubic-bezier(0.25, 0, 0.3, 1) normal;
	}
	dialog[open].closing {
		animation: slide-out 0.3s cubic-bezier(0.25, 0, 0.3, 1) normal;
	}

	dialog::backdrop {
		backdrop-filter: blur(5px) saturate(0.5) brightness(0.5);
		background-color: rgba(180, 178, 216, 0.13);
	}
	dialog[open]::backdrop {
		animation: fade-in 0.3s cubic-bezier(0.25, 0, 0.3, 1) normal;
	}
	dialog[open].closing::backdrop {
		animation: fade-out 0.3s cubic-bezier(0.25, 0, 0.3, 1) normal;
	}
</style>

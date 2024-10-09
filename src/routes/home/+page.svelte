<script lang="ts">
	import { getColorScheme } from '$lib/color-scheme/color-scheme.svelte.js';
	import type { Client } from '$lib/pocketbase/pocketbase.js';
	import Dialog from '$lib/widgets/Dialog.svelte';

	let { data } = $props();

	let colorScheme = getColorScheme();

	$inspect(colorScheme.value);

	let isOpen = $state(false);

	const client: Client = {
		id: 'salutlol',
		name: 'Ada Tech School',
		created: new Date().toString(),
		address: `11 rue de Pommard
75012 Paris
France`
	};

	function formatDate(date: Date) {
		return '22/08/2024';
	}
</script>

<main>
	<header>
		<div class="logo">Oups.</div>
		<a href="#invoices">Factures</a>
		<a href="#quotes" style:margin-right="auto">Devis</a>
		<button onclick={() => (isOpen = true)}> Nouvelle facture </button>
		<button onclick={colorScheme.toggle}>
			{colorScheme.value}
		</button>
		<a href="/logout" data-sveltekit-reload> Se déconnecter </a>
	</header>
	<table>
		<thead>
			<tr>
				<th>Nom</th>
				<th>Organisation</th>
				<th>Statut</th>
				<th>Crée le</th>
				<th>Editée le</th>
				<th>Prix</th>
				<th>Notes</th>
			</tr>
		</thead>
		<tbody>
			{#each data.invoices as invoice}
				<tr>
					<td>{invoice.name} nº{invoice.id}</td>
					<td>{invoice.expand?.company_id.name}</td>
					<td>{invoice.status}</td>
					<td>{invoice.created}</td>
					<td>{invoice.emission_date}</td>
					<td>{invoice.lines.reduce((total, l) => total + l.price, 0)}</td>
					<td>+134 €</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<Dialog {isOpen} onrequestclose={() => (isOpen = false)}>
		<div class="invoice-editor">
			<header>
				<button aria-label="Back" onclick={() => (isOpen = false)}>
					<svg
						width="9"
						height="16"
						viewBox="0 0 9 16"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fill-rule="evenodd"
							clip-rule="evenodd"
							d="M8.77848 0.214981C8.48311 -0.0716602 8.00423 -0.0716602 7.70886 0.21498L0.238016 7.46512C0.232456 7.47021 0.226957 7.47539 0.221519 7.48066C0.0616633 7.6358 -0.0116771 7.84309 0.00149882 8.04609C0.012571 8.21833 0.08592 8.3875 0.221547 8.51912C0.226664 8.52409 0.231836 8.52897 0.237061 8.53376L7.70883 15.7848C8.0042 16.0714 8.48308 16.0714 8.77845 15.7848C9.07381 15.4982 9.07381 15.0334 8.77845 14.7468L1.82618 7.99991L8.77848 1.253C9.07384 0.966358 9.07384 0.501621 8.77848 0.214981Z"
							fill="var(--color-bg)"
						/>
					</svg>
				</button>
				<button>Sauvegarder</button>
			</header>
			<div class="invoice">
				<div class="company">
					{#if data.company.name}<div class="company-name">{data.company.name}</div>{/if}
					{#if data.company.address}<div class="company-address">{data.company.address}</div>{/if}
					{#if data.company.phone}<div>{data.company.phone}</div>{/if}
					{#if data.company.email}<div>{data.company.email}</div>{/if}
					{#if data.company.siren}<div>SIREN : {data.company.siren}</div>{/if}
					<div class="company-date">Date d'émission : {formatDate(new Date())}</div>
				</div>
				<div class="client">
					{#if client.name}<div>{client.name}</div>{/if}
					{#if client.email}<div>{client.email}</div>{/if}
					{#if client.address}<div>{client.address}</div>{/if}
				</div>
			</div>
		</div>
	</Dialog>
</main>

<style>
	main {
		width: 100%;
		max-width: 65rem;
		margin-inline: auto;
		display: flex;
		align-items: center;
		flex-direction: column;
	}
	header {
		display: flex;
		align-items: center;
		width: 100%;
		gap: 1rem;
		padding: 0.5rem 1rem;

		& .logo {
			font-size: 1.2rem;
		}
	}
	main > div {
		gap: 1rem;
		display: flex;
		align-items: center;
		padding: 1rem;
	}
	th,
	td {
		text-align: start;
		padding: 0.5rem 1rem;
	}

	th {
		white-space: nowrap;
	}

	td {
		color: var(--color-muted);
	}

	.invoice-editor {
		display: flex;
		flex-direction: column;
	}
	.invoice-editor > header {
		display: flex;
		width: 100%;
		justify-content: space-around;
	}

	.invoice {
		position: relative;
		line-height: 1.5rem;
		width: 100%;
		height: 100%;
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		grid-template-rows: repeat(3, 1fr);
		white-space: pre-line;
	}
	.company {
		display: flex;
		flex-direction: column;
		grid-column-end: 5;
		grid-column-start: 1;
		grid-row: 1;
	}
	.company-name {
		font-weight: bold;
		font-size: 1.3rem;
	}
	.company-address {
		margin-bottom: 1.5rem;
	}
	.company-date {
		margin-top: 1.5rem;
	}
	.client {
		display: flex;
		flex-direction: column;
		grid-column-start: 8;
		grid-column-end: 13;
		grid-row: 1;
		text-align: end;
		margin-top: auto;
	}
</style>

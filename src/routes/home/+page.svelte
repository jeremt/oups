<script lang="ts">
	let { data } = $props();
</script>

<main>
	<div>
		<select>
			<option>Mes factures</option>
			<option>Mes devis</option>
		</select>
		<select>
			<option>Les 3 dev</option>
			<option>Vincent Néel</option>
		</select>
		<button> Nouvelle facture </button>
	</div>
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
	select {
		margin-bottom: 0;
	}
	div {
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
</style>

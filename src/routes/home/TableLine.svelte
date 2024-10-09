<script lang="ts">
	import type { Invoice } from '$lib/pocketbase/pocketbase';

	let { invoice }: { invoice: Invoice } = $props();
</script>

<tr>
	<td>{invoice.name} nº{invoice.number}</td>
	<td>{invoice.expand?.company_id.name}</td>
	<td><select>{invoice.status} </select> </td>
	<td>{invoice.created}</td>
	<td>{invoice.emission_date}</td>
	<td>{invoice.lines.reduce((total, l) => total + l.price, 0)}</td>
	<td>+134 €</td>
</tr>

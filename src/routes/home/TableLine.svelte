<script lang="ts">
    import {formatDate} from '$lib/helpers/formatDate';
    import type {Invoice, InvoiceStatus} from '$lib/pocketbase/pocketbase';

    let {invoice}: {invoice: Invoice} = $props();

    let status = $state(invoice.status);
    let selectElement: HTMLSelectElement;

    const statusMap: Record<InvoiceStatus, {name: string; color: string}> = {
        generated: {name: 'générée', color: 'var(--color-pink)'},
        sent: {name: 'envoyée', color: 'var(--color-indigo)'},
        paid: {name: 'payée', color: 'var(--color-yellow)'},
        declared: {name: 'déclarée', color: 'var(--color-lime)'},
    };
    async function handleStatusChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        status = select.value as InvoiceStatus;
        const response = await fetch(`/api/invoices/${invoice.id}`, {
            method: 'PATCH',
            body: JSON.stringify({status}),
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
</script>

<tr>
    <td>{invoice.name} nº{invoice.number}</td>
    <td>{invoice.expand?.company_id.name}</td>
    <td style:color={statusMap[status].color} onclick={() => selectElement.click()}>
        {statusMap[status].name}
        <select bind:this={selectElement} value={status} onchange={handleStatusChange}>
            <option value="generated">générée</option>
            <option value="sent">envoyée</option>
            <option value="paid">payée</option>
            <option value="declared">déclarée</option>
        </select>
    </td>
    <td>{formatDate(new Date(invoice.created))}</td>
    <td>{formatDate(new Date(invoice.emission_date))}</td>
    <td>{invoice.lines.reduce((total, l) => total + l.price, 0)}</td>
    <td>+134 €</td>
</tr>

<style>
    td {
        text-align: start;
        padding: 0.5rem 1rem;
    }

    td {
        position: relative;
        color: var(--color-muted);
    }

    select {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        opacity: 0;
    }
</style>

<script lang="ts">
    import {formatDate} from '$lib/helpers/formatDate';
    import type {Companies} from '$lib/kysely/gen/public/Companies';
    import type {Documents} from '$lib/kysely/gen/public/Documents';
    import type DocumentStatus from '$lib/kysely/gen/public/DocumentStatus';
    import type {DocumentLine} from '$lib/supabase/types';

    let {invoice}: {invoice: Documents & {company: Companies}} = $props();

    let status = $state(invoice.status);
    let selectElement: HTMLSelectElement;

    const statusMap: Record<DocumentStatus, {name: string; color: string}> = {
        generated: {name: 'générée', color: 'var(--color-pink)'},
        sent: {name: 'envoyée', color: 'var(--color-indigo)'},
        paid: {name: 'payée', color: 'var(--color-yellow)'},
        declared: {name: 'déclarée', color: 'var(--color-lime)'},
        accepted: {name: 'acceptée', color: 'var(--color-lime)'},
        declined: {name: 'refusée', color: 'var(--color-error)'},
    };

    async function handleStatusChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        status = select.value as DocumentStatus;
        await fetch(`/api/invoices/${invoice.id}`, {
            method: 'PATCH',
            body: JSON.stringify({status}),
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
</script>

<tr>
    <td class="name">{invoice.name} nº{invoice.number}</td>
    <td>{invoice.company.name}</td>
    <td style:color={statusMap[status].color} onclick={() => selectElement.click()}>
        {statusMap[status].name}
        <select bind:this={selectElement} value={status} onchange={handleStatusChange}>
            <option value="generated">générée</option>
            <option value="sent">envoyée</option>
            <option value="paid">payée</option>
            <option value="declared">déclarée</option>
        </select>
    </td>
    <td>{formatDate(new Date(invoice.created_at))}</td>
    <td>{formatDate(new Date(invoice.emitted_at))}</td>
    <td>{(invoice.lines as DocumentLine[]).reduce((total, l) => total + l.price, 0)}</td>
    <td class="note">{@html invoice.note}</td>
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

    .name {
        min-width: 12rem;
    }

    .note {
        & :global(p) {
            text-wrap: wrap;
            max-height: 10rem;
            overflow: auto;
            margin: 0;
            font-size: 0.9rem;
            line-height: 1.4;
            min-width: 10rem;
        }
    }
</style>

<script lang="ts">
    import type {Document} from '$lib/kysely/queries';
    import type DocumentStatus from '$lib/kysely/gen/public/DocumentStatus';
    type Props = {
        document: Document;
    };
    let {document}: Props = $props();
    const statusMap: Record<DocumentStatus, {name: string; color: string}> = {
        generated: {name: 'générée', color: 'var(--color-pink)'},
        sent: {name: 'envoyée', color: 'var(--color-indigo)'},
        paid: {name: 'payée', color: 'var(--color-yellow)'},
        declared: {name: 'déclarée', color: 'var(--color-lime)'},
        accepted: {name: 'acceptée', color: 'var(--color-lime)'},
        declined: {name: 'refusée', color: 'var(--color-error)'},
    };
    let selectElement: HTMLSelectElement;
    let status = $state(document.status);

    async function handleStatusChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        status = select.value as DocumentStatus;
        await fetch(`/api/documents/${document.id}`, {
            method: 'PATCH',
            body: JSON.stringify({name: document.name, emittedAt: document.emittedAt, status}),
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
</script>

<td style:color={statusMap[status].color} onclick={() => selectElement.click()}>
    {statusMap[status].name}
    <select bind:this={selectElement} value={status} onchange={handleStatusChange}>
        <option value="generated">générée</option>
        <option value="sent">envoyée</option>
        <option value="paid">payée</option>
        <option value="declared">déclarée</option>
    </select>
</td>

<style>
    td {
        position: relative;
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

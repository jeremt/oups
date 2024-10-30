<script lang="ts">
    import {formatDate} from '$lib/helpers/formatDate';
    import type {Document} from '$lib/kysely/queries';
    import type {DocumentLine} from '$lib/kysely/types';
    import Pen from '$lib/icons/Pen.svelte';
    import StatusPicker from './StatusPicker.svelte';

    type Props = {
        document: Document;
        onSelect: (document: Document) => void;
    };
    let {document, onSelect}: Props = $props();
</script>

<tr>
    <td class="name">{document.name} nº{document.number}</td>
    <td><StatusPicker {document} /></td>
    <td>{formatDate(new Date(document.emittedAt))}</td>
    <td>{(document.lines as DocumentLine[]).reduce((total, l) => total + l.price, 0)} €</td>
    <td>{document.company.name}</td>
    <td class="note">{@html document.note}</td>
    <td><button class="icon button" aria-label="Éditer" onclick={() => onSelect(document)}><Pen /></button></td>
</tr>

<style>
    td {
        text-align: start;
        padding: 0.5rem 1rem;
    }

    td {
        color: var(--color-muted);
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

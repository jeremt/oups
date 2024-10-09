<script lang="ts">
    import ColorSchemeToggle from '$lib/color-scheme/ColorSchemeToggle.svelte';
    import type {Client} from '$lib/pocketbase/pocketbase.js';
    import DocumentDialog from './DocumentDialog.svelte';

    let {data} = $props();

    let isDocumentOpen = $state(false);

    const client: Client = {
        id: 'salutlol',
        name: 'Ada Tech School',
        created: new Date().toString(),
        address: `11 rue de Pommard
75012 Paris
France`,
    };
</script>

<main>
    <header>
        <div class="logo">Oups.</div>
        <a href="#invoices">Factures</a>
        <a href="#quotes" style:margin-right="auto">Devis</a>
        <button class="btn" onclick={() => (isDocumentOpen = true)}>Nouvelle facture</button>
        <ColorSchemeToggle />
        <a href="/logout" data-sveltekit-reload>Se déconnecter</a>
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
    <DocumentDialog isOpen={isDocumentOpen} company={data.company} {client} />
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
            font-size: 1.4rem;
            font-weight: bold;
        }
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

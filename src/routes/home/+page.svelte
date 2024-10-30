<script lang="ts">
    import ColorSchemeToggle from '$lib/color-scheme/ColorSchemeToggle.svelte';
    import DocumentDialog from './DocumentDialog.svelte';
    import TableLine from './TableLine.svelte';

    let {data} = $props();

    let isDocumentOpen = $state(false);
</script>

<svelte:head>
    <title>Oups</title>
    <meta name="description" content="Gestionnaire de factures & devis pour éviter les erreurs 😅" />
    <meta property="og:title" content="Oups" />
    <meta property="og:site_name" content="Oups" />
    <meta property="og:image" content="/thumbnail.png" />
    <meta property="og:url" content="https://oups.vercel.app" />
    <meta property="og:description" content="Gestionnaire de factures & devis pour éviter les erreurs 😅" />
    <meta property="twitter:title" content="Oups" />
    <meta property="twitter:description" content="Gestionnaire de factures & devis pour éviter les erreurs 😅" />
    <meta property="twitter:image" content="/thumbnail.png" />
</svelte:head>

<main>
    <header>
        <div class="logo">Oups.</div>
        <a href="#invoices">Factures</a>
        <a href="#quotes" style:margin-right="auto">Devis</a>
        <button class="btn" onclick={() => (isDocumentOpen = true)}>Créer</button>
        <ColorSchemeToggle />
        <form method="POST" action="/auth/logout">
            <button class="btn" style:background-color="var(--color-fg)" type="submit">Déconnexion</button>
        </form>
    </header>
    <table>
        <thead>
            <tr>
                <th>Nom</th>
                <th>Statut</th>
                <th>Émis le</th>
                <th>Prix</th>
                <th>Entreprise</th>
                <th>Notes</th>
                <th>Editer</th>
            </tr>
        </thead>
        <tbody>
            {#each data.documents as document}
                <TableLine {document} />
            {/each}
        </tbody>
    </table>
    <DocumentDialog bind:isOpen={isDocumentOpen} companies={data.companies} />
</main>

<style>
    main {
        width: 100%;
        max-width: 65rem;
        padding: 0 2rem;
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
    th {
        text-align: start;
        padding: 0.5rem 1rem;
    }

    th {
        white-space: nowrap;
    }
</style>

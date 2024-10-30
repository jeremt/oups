<script lang="ts">
    import Cross from '$lib/icons/Cross.svelte';
    import type {Clients, NewClients} from '$lib/kysely/gen/public/Clients';
    import type {Companies} from '$lib/kysely/gen/public/Companies';
    import Dialog from '$lib/widgets/Dialog.svelte';
    import ResizeInput from '$lib/widgets/ResizeInput.svelte';
    import EnhancedSelect, {type Option} from '$lib/widgets/EnhancedSelect.svelte';

    type Props = {
        isOpen: boolean;
        selected?: Clients;
        onEdit: (client: Clients) => void;
        onCreate: (client: Clients) => void;
    };

    let {isOpen = $bindable(false), selected = $bindable(undefined), onCreate, onEdit}: Props = $props();
    let error = $state('');
    let options = $state<Option[]>([]);

    const defaultClient: NewClients = {
        name: '',
        address: '',
        email: '',
        logoUrl: '',
        companyId: 1,
    };
    let client = $state<NewClients>(selected ?? defaultClient);

    async function createClient() {
        const response = await fetch(`/api/clients`, {
            method: 'POST',
            body: JSON.stringify(client),
        });
        if (response.status === 200) {
            isOpen = false;
            onCreate((await response.json()) as Clients);
        } else {
            error = (await response.json())?.message;
        }
    }
    async function editClient() {
        const response = await fetch(`/api/clients/${selected!.id}`, {
            method: 'PATCH',
            body: JSON.stringify(client),
        });
        if (response.status === 200) {
            isOpen = false;
            onEdit((await response.json()) as Clients);
        } else {
            error = (await response.json())?.message;
        }
    }

    $effect(() => {
        (async () => {
            const response = await fetch(`/api/companies`);
            if (response.status === 200) {
                const companies: Companies[] = await response.json();
                options = companies.map(c => ({id: c.id as number, image: c.logoUrl ?? '', label: c.name}));
                client.companyId = companies[0]?.id;
            } else {
                error = (await response.json())?.message;
            }
        })();
    });

    $effect(() => {
        client = selected ?? defaultClient;
    });
</script>

<Dialog {isOpen} onrequestclose={() => (isOpen = false)}>
    <header>
        <button aria-label="Retour" class="icon" onclick={() => (isOpen = false)}>
            <Cross />
        </button>
        {#if selected === undefined}
            <div class="title">Créer un client</div>
            <button class="btn" onclick={createClient}>Créer</button>
        {:else}
            <div class="title">Éditer le client</div>
            <button class="btn" onclick={editClient}>Éditer</button>
        {/if}
    </header>
    <div class="form">
        <input type="text" placeholder="Nom du client" bind:value={client.name} />
        <input type="email" placeholder="Adresse email" bind:value={client.email} />
        <ResizeInput placeholder="Adresse" bind:value={client.address} />
        <input type="text" placeholder="URL du logo" bind:value={client.logoUrl} />
        <EnhancedSelect bind:value={client.companyId} {options} placeholder="Entreprise" />
    </div>
    {#if error}
        <div class="error">
            {error}
        </div>
    {/if}
</Dialog>

<style>
    header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
        & .title {
            font-size: 1.2rem;
            font-weight: bold;
            flex-grow: 1;
        }
    }
    .form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .error {
        color: var(--color-error);
        white-space: pre-line;
    }
</style>

<script lang="ts">
    import Cross from '$lib/icons/Cross.svelte';
    import type {Clients} from '$lib/kysely/gen/public/Clients';
    import type {Companies} from '$lib/kysely/gen/public/Companies';
    import Dialog from '$lib/widgets/Dialog.svelte';
    import ResizeInput from '$lib/widgets/ResizeInput.svelte';
    import EnhancedSelect, {type Option} from '$lib/widgets/EnhancedSelect.svelte';
    import {onMount} from 'svelte';

    type Props = {
        isOpen: boolean;
        selectedClient?: Clients;
    };

    let {isOpen = $bindable(false), selectedClient = $bindable(undefined)}: Props = $props();
    let error = $state('');
    let companyIdSelected = $state<number>();
    let options = $state<Option[]>([]);

    let client = $derived(
        selectedClient ?? {
            name: '',
            address: '',
            email: '',
            logoUrl: '',
        },
    );

    async function createClient() {
        const response = await fetch(`/api/clients`, {
            method: 'POST',
            body: JSON.stringify({
                ...client,
                companyId: companyIdSelected,
            }),
        });
        if (response.status === 200) {
            isOpen = false;
        } else {
            error = (await response.json())?.message;
        }
    }
    async function editClient() {
        const response = await fetch(`/api/clients/${selectedClient!.id}`, {
            method: 'PATCH',
            body: JSON.stringify({
                ...client,
                companyId: companyIdSelected,
            }),
        });
        if (response.status === 200) {
            isOpen = false;
        } else {
            error = (await response.json())?.message;
        }
    }

    onMount(async () => {
        const response = await fetch(`/api/companies`);
        if (response.status === 200) {
            const companies: Companies[] = await response.json();
            options = companies.map(c => ({id: c.id as number, image: c.logoUrl ?? '', label: c.name}));
        } else {
            error = (await response.json())?.message;
        }
    });
</script>

<Dialog {isOpen} onrequestclose={() => (isOpen = false)}>
    <header>
        <button aria-label="Retour" class="icon" onclick={() => (isOpen = false)}>
            <Cross />
        </button>
        {#if selectedClient === undefined}
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
        <EnhancedSelect bind:value={companyIdSelected} {options} placeholder="Entreprise" />
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

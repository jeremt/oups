<script lang="ts">
    import Cross from '$lib/icons/Cross.svelte';
    import Dialog from '$lib/widgets/Dialog.svelte';
    import {inputDebounce} from '$lib/helpers/inputDebounce';
    import type {Clients, ClientsId} from '$lib/kysely/gen/public/Clients';
    import Pen from '$lib/icons/Pen.svelte';
    import CreateEditClientDialog from './CreateEditClientDialog.svelte';
    import {onMount} from 'svelte';

    type Props = {isOpen: boolean; onSelect: (client: Clients) => void};
    let {isOpen = $bindable(false), onSelect}: Props = $props();

    let clients: Clients[] = $state([
        {
            id: 0 as ClientsId,
            created_at: new Date(),
            updated_at: new Date(),
            name: 'Ada Tech School',
            address: '28 rue du Petit Musc, 75004 Paris',
            email: null,
            logo_url: null,
        },
        {
            id: 1 as ClientsId,
            created_at: new Date(),
            updated_at: new Date(),
            name: 'Pierre Lacombe',
            address: '44 rue des navettes, 123456 Kourou, Guyanne.',
            email: 'pie.lacombe@gmail.com',
            logo_url: null,
        },
    ]);

    let query = $state('');
    let selectedClient = $state<Clients | undefined>(undefined);

    let isCreateOrEditOpen = $state(false);

    function handleSearch() {}

    onMount(async () => {
        const response = await fetch(`/api/clients`, {
            method: 'GET',
        });
        if (response.status === 200) {
            clients = await response.json();
        }
    });
</script>

<Dialog {isOpen} onrequestclose={() => (isOpen = false)}>
    <header>
        <button aria-label="Retour" class="icon" onclick={() => (isOpen = false)}>
            <Cross />
        </button>
        <input bind:value={query} type="text" placeholder="Rechercher un client..." use:inputDebounce={[300, handleSearch]} />
        <button
            class="btn"
            onclick={() => {
                selectedClient = undefined;
                isCreateOrEditOpen = true;
            }}>Ajouter</button
        >
    </header>
    <div class="clients">
        {#each clients as client}
            <!-- TODO: improve a11y -->
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
                class="card"
                onclick={e => {
                    onSelect(client);
                    isOpen = false;
                }}
            >
                <div class="top">
                    <div class="name">{client.name}</div>
                    <button
                        aria-label="Editer"
                        class="icon"
                        onclick={e => {
                            e.stopPropagation();
                            selectedClient = client;
                            isCreateOrEditOpen = true;
                        }}><Pen /></button
                    >
                </div>
                <div>{client.address}</div>
                {#if client.email !== null}<div>{client.email}</div>{/if}
            </div>
        {/each}
    </div>
</Dialog>

<CreateEditClientDialog bind:isOpen={isCreateOrEditOpen} {selectedClient} />

<style>
    header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
        & input {
            flex-grow: 1;
        }
    }
    .clients {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        & > .card {
            cursor: pointer;
            display: flex;
            flex-direction: column;
            padding: 1rem;
            border: 2px solid var(--color-bg-2);
            border-radius: 0.5rem;
            &:hover {
                border: 2px solid var(--color-primary);
            }
            font-size: 0.9rem;
            color: var(--color-fg-1);
            & .top {
                display: flex;
            }
            & .name {
                color: var(--color-fg);
                font-size: 1.1rem;
                font-weight: bold;
                flex-grow: 1;
            }
        }
    }
</style>

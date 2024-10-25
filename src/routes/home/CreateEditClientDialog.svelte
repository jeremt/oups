<script lang="ts">
    import Cross from '$lib/icons/Cross.svelte';
    import type {Clients} from '$lib/kysely/gen/public/Clients';
    import Dialog from '$lib/widgets/Dialog.svelte';

    type Props = {
        isOpen: boolean;
        selectedClient?: Clients;
    };

    let {isOpen = $bindable(false), selectedClient = $bindable(undefined)}: Props = $props();

    let client = $derived(
        selectedClient ?? {
            name: '',
            address: '',
            email: '',
            logo_url: '',
        },
    );

    function createClient() {
        //
    }
    function editClient() {
        //
    }
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
        <input type="text" placeholder="Adresse" bind:value={client.address} />
        <input type="email" placeholder="Adresse email" bind:value={client.email} />
        <input type="text" placeholder="URL du logo" bind:value={client.logo_url} />
    </div>
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
</style>

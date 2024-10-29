<script lang="ts">
    import Cross from '$lib/icons/Cross.svelte';
    import Dialog from '$lib/widgets/Dialog.svelte';
    import ResizeInput from '$lib/widgets/ResizeInput.svelte';
    import type {Company} from '$lib/kysely/queries';
    import type {NewCompanies} from '$lib/kysely/gen/public/Companies';

    type Props = {
        isOpen: boolean;
        selected?: Company;
    };

    let {isOpen = $bindable(false), selected = $bindable(undefined)}: Props = $props();
    let error = $state('');

    let company = $derived<NewCompanies>(
        selected ?? {
            name: '',
            bic: '',
            iban: '',
            siren: '',
            address: '',
            phone: '',
            email: '',
            logoUrl: '',
        },
    );

    async function create() {
        const response = await fetch(`/api/companies`, {
            method: 'POST',
            body: JSON.stringify({
                ...company,
            }),
        });
        if (response.status === 200) {
            isOpen = false;
        } else {
            error = (await response.json())?.message;
        }
    }
    async function edit() {
        const response = await fetch(`/api/companies/${selected!.id}`, {
            method: 'PATCH',
            body: JSON.stringify({
                ...company,
            }),
        });
        if (response.status === 200) {
            isOpen = false;
        } else {
            error = (await response.json())?.message;
        }
    }
</script>

<Dialog {isOpen} onrequestclose={() => (isOpen = false)}>
    <header>
        <button aria-label="Retour" class="icon" onclick={() => (isOpen = false)}>
            <Cross />
        </button>
        {#if selected === undefined}
            <div class="title">Créer une entreprise</div>
            <button class="btn" onclick={create}>Créer</button>
        {:else}
            <div class="title">Éditer l'entreprise</div>
            <button class="btn" onclick={edit}>Éditer</button>
        {/if}
    </header>
    <div class="form">
        <input type="text" placeholder="Nom de l'entreprise" bind:value={company.name} />
        <input type="text" placeholder="BIC" bind:value={company.bic} />
        <input type="text" placeholder="IBAN" bind:value={company.iban} />
        <input type="text" placeholder="SIREN" bind:value={company.siren} />
        <input type="email" placeholder="Email" bind:value={company.email} />
        <input type="phone" placeholder="Phone" bind:value={company.phone} />
        <ResizeInput placeholder="Adresse" bind:value={company.address} />
        <input type="text" placeholder="URL du logo" bind:value={company.logoUrl} />
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

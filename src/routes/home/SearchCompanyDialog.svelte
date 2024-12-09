<script lang="ts">
    import Cross from '$lib/icons/Cross.svelte';
    import Dialog from '$lib/widgets/Dialog.svelte';
    import {inputDebounce} from '$lib/actions/inputDebounce';
    import Pen from '$lib/icons/Pen.svelte';
    import {queryFilter} from '$lib/helpers/queryFilter';
    import type {Company} from '$lib/kysely/queries';
    import CreateEditCompanyDialog from './CreateEditCompanyDialog.svelte';

    type Props = {isOpen: boolean; onSelect: (company: Company) => void; companies: Company[]};
    let {isOpen = $bindable(false), onSelect, companies = $bindable()}: Props = $props();

    let query = $state('');
    let selected = $state<Company | undefined>(undefined);

    let isCreateOrEditOpen = $state(false);
    const filteredItems = $derived(query ? companies.filter(c => queryFilter([c.name, c.address], query)) : companies);

    function handleSearch(value: string) {
        query = value;
    }
</script>

<Dialog {isOpen} onrequestclose={() => (isOpen = false)}>
    <header>
        <button aria-label="Retour" class="icon" onclick={() => (isOpen = false)}>
            <Cross />
        </button>
        <input bind:value={query} type="text" placeholder="Rechercher une entreprise..." use:inputDebounce={[300, handleSearch]} />
        <button
            class="btn"
            onclick={() => {
                selected = undefined;
                isCreateOrEditOpen = true;
            }}>Ajouter</button
        >
    </header>
    <div class="list">
        {#each filteredItems as company}
            <!-- TODO: improve a11y -->
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
                class="card"
                onclick={() => {
                    onSelect(company);
                    isOpen = false;
                }}
            >
                <div class="top">
                    <div class="name">{company.name}</div>
                    <button
                        aria-label="Editer"
                        class="icon"
                        onclick={e => {
                            e.stopPropagation();
                            selected = company;
                            isCreateOrEditOpen = true;
                        }}><Pen /></button
                    >
                </div>
                <div>{company.address}</div>
            </div>
        {/each}
    </div>
</Dialog>

<CreateEditCompanyDialog
    bind:isOpen={isCreateOrEditOpen}
    {selected}
    onEdit={company => (companies = companies.map(c => (c.id === company.id ? company : c)))}
    onCreate={company => companies.push(company)}
/>

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
    .list {
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

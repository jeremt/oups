<script lang="ts">
    import {inputDebounce} from '$lib/helpers/inputDebounce';
    import Dialog from '$lib/widgets/Dialog.svelte';

    type Props = {isOpen: boolean};

    let {isOpen = $bindable(false)}: Props = $props();
    let query = $state('');

    function handleSearch() {}
</script>

<Dialog {isOpen} onrequestclose={() => (isOpen = false)}>
    <div>
        <header>
            <input bind:value={query} type="text" placeholder="Rechercher un client..." use:inputDebounce={[300, handleSearch]} />
            <button class="btn">Ajouter</button>
        </header>
    </div>
</Dialog>

<style>
    header {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
</style>

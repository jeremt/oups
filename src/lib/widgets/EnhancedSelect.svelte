<script module lang="ts">
    export type Option = {id: string | number; image: string; label: string};
</script>

<script lang="ts">
    interface Props {
        value?: Option['id'];
        options: Option[];
        placeholder?: string;
    }

    let {options, value = $bindable(), placeholder}: Props = $props();

    let isOpen = $state(false);
    let op = $derived(options);
    function handleSelect(option: Option) {
        value = option.id;
        isOpen = false;
    }

    function toggleDropdown() {
        isOpen = !isOpen;
    }

    $effect(() => {
        value = op[0]?.id;
    });
    const optionSelected = $derived(options.find(o => o.id === value));
</script>

<div class="custom-select">
    <button type="button" class="btn" onclick={toggleDropdown} aria-haspopup="listbox" aria-expanded={isOpen}>
        {#if optionSelected}
            <div class="selected-option">
                <img src={optionSelected.image} alt="" class="option-image" />
                <span>{optionSelected.label}</span>
            </div>
        {:else}
            <span class="placeholder">{placeholder}</span>
        {/if}
        <svg class="arrow-icon" class:rotated={isOpen} viewBox="0 0 24 24" width="24" height="24">
            <path d="M7 10l5 5 5-5z" />
        </svg>
    </button>

    {#if isOpen}
        <ul class="options-list" role="listbox" tabindex="-1">
            {#each options as option (option.id)}
                <li role="option" aria-selected={value === option.id}>
                    <button onclick={() => handleSelect(option)} class="option-item">
                        <img src={option.image} alt="" class="option-image" />
                        <span>{option.label}</span>
                    </button>
                </li>
            {/each}
        </ul>
    {/if}
</div>

<style>
    .custom-select {
        position: relative;
        width: 100%;
        max-width: 300px;
    }

    button {
        color: var(--color-fg);
        background: transparent;
    }

    .selected-option {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--color-fg);
    }

    .option-image {
        width: 24px;
        height: 24px;
        object-fit: cover;
        border-radius: 0.25rem;
    }

    .placeholder {
        color: var(--color-fg-2);
    }

    .arrow-icon {
        fill: currentColor;
        transition: transform 0.15s ease-in-out;
    }

    .arrow-icon.rotated {
        transform: rotate(180deg);
    }

    li {
        border-radius: 0.25rem;
    }
    .options-list {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        margin-top: 0.25rem;
        padding: 0.5rem;
        background: var(--color-bg);
        box-shadow: 3px 3px 5px 0px rgba(0, 0, 0, 0.75);
        border-radius: 0.375rem;
        list-style: none;
        z-index: 10;
    }

    .option-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        cursor: pointer;
        border: none;
        transition: background-color 0.15s ease-in-out;
    }

    .option-item:hover {
        background-color: var(--color-fg-2);
    }

    li[aria-selected='true'] {
        background-color: var(--color-fg-2);
    }
</style>

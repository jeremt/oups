<script>
    import Moon from '$lib/icons/Moon.svelte';
    import Sun from '$lib/icons/Sun.svelte';
    import {getColorScheme} from './color-scheme.svelte';

    let colorScheme = getColorScheme();
</script>

<button class="icon" onclick={colorScheme.toggle}>
    {#if colorScheme.value === 'dark'}
        <Moon />
    {:else}
        <Sun />
    {/if}
</button>

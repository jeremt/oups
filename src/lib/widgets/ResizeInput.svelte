<script lang="ts">
    import {onMount} from 'svelte';
    import type {HTMLTextareaAttributes} from 'svelte/elements';

    interface Props extends HTMLTextareaAttributes {}

    let {value = $bindable(''), oninput, ...rest}: Props = $props();

    let textarea: HTMLTextAreaElement;

    function resize() {
        textarea.style.height = `auto`;
        textarea.style.height = `${textarea.scrollHeight}px`;
    }

    function delayedResize() {
        setTimeout(resize, 0);
    }

    function onInput(e: Event & {currentTarget: HTMLTextAreaElement}) {
        resize();
        oninput?.(e);
    }

    onMount(() => {
        resize();
    });
</script>

<textarea bind:this={textarea} bind:value {...rest} oninput={onInput} onpaste={delayedResize} onkeydown={delayedResize} oncut={delayedResize} ondrop={delayedResize}></textarea>

<style>
    textarea {
        overflow: hidden;
        min-height: 49px;
        resize: none;
    }
</style>

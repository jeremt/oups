<script lang="ts">
    import type {HTMLTextareaAttributes} from 'svelte/elements';

    interface Props extends HTMLTextareaAttributes {
        minRows?: number;
        maxRows?: number;
    }

    let {value = $bindable(), minRows, maxRows, ...props}: Props = $props();

    let element: HTMLTextAreaElement | null = null;

    function resize() {
        if (!element) {
            return;
        }
        element.style.height = 'auto';
        const style = window.getComputedStyle(element);

        element.style.height = `${element.scrollHeight + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth)}px`;
    }

    function handleInput(event: Event & {currentTarget: HTMLTextAreaElement}) {
        resize();
        props.onchange?.(event);
    }

    $effect(() => {
        if (ResizeObserver && element) {
            const observer = new ResizeObserver(entries => {
                for (const entry of entries) {
                    if (entry.contentRect.height) {
                        resize();
                        observer.disconnect();
                    }
                }
            });
            observer.observe(element);
        } else {
            setTimeout(resize, 0);
        }
    });
</script>

<svelte:window onresize={resize} />
<textarea bind:this={element} bind:value oninput={handleInput} {...props}></textarea>

<style>
    textarea {
        overflow: hidden;
        resize: none;
    }
</style>

<script lang="ts">
    /**
     * The color to apply to the SVG fill and stroke.
     * It must be a valid CSS color.
     */
    export let direction: 'top' | 'right' | 'bottom' | 'left' = 'bottom';

    const directionToTransform = {top: 'rotate(-90deg)', right: '', bottom: 'rotate(90deg)', left: 'rotate(180deg)'};
</script>

<svg width="12" height="20" viewBox="0 0 12 20" fill="none" xmlns="http://www.w3.org/2000/svg" style="--transform: {directionToTransform[direction]}">
    <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M10.8388 11.0607C11.4246 10.4749 11.4246 9.52512 10.8388 8.93933L3.06066 1.16116C2.47487 0.575374 1.52513 0.575375 0.939341 1.16116C0.353554 1.74695 0.353554 2.6967 0.939341 3.28248L7.65685 9.99999L0.939339 16.7175C0.353553 17.3033 0.353553 18.253 0.939339 18.8388C1.52513 19.4246 2.47487 19.4246 3.06066 18.8388L10.8388 11.0607Z"
        fill="currentColor"
    />
</svg>

<style>
    svg {
        transform: var(--transform);
        width: var(--size, 0.5rem);
        transition: transform 0.3s;
    }
</style>

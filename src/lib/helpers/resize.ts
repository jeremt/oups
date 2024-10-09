export function resize(el: HTMLElement, onupdate: (width: number, height: number) => void) {
    if (ResizeObserver) {
        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const {blockSize, inlineSize} = entry.contentBoxSize[0];
                onupdate(inlineSize, blockSize);
            }
        });

        resizeObserver.observe(el);

        return {
            destroy() {
                resizeObserver.unobserve(el);
            },
        };
    }
}

export function inputDebounce(el: HTMLInputElement | HTMLTextAreaElement, params: [number, (value: string) => void]) {
    const [delay, onUpdate] = params;
    let timeout: NodeJS.Timeout | undefined;

    const listener = (event: Event) => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            timeout = undefined;
            onUpdate((event.target as HTMLInputElement).value);
        }, delay);
    };

    el.addEventListener('input', listener);
    return {
        destroy() {
            el.removeEventListener('input', listener);
        },
    };
}

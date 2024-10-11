export function inputDebounce(el: HTMLInputElement | HTMLTextAreaElement, params: [number, (value: string) => void]) {
    const [delay, onUpdate] = params;
    let timeout: number;

    const listener = (event: Event) => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            timeout = 0;
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

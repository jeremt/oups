<script module>
    type Undefineable<T> = T | undefined;

    type SetupType = {
        styles: CSSStyleDeclaration;
        minRows: Undefineable<number | string>;
        maxRows: Undefineable<number | string>;
    };

    const PROXY_TEXTAREA_ELEMENT_HIDDEN_STYLE = `
    height: 0 !important;
    visibility: hidden !important;
    overflow: hidden !important;
    position: absolute !important;
    z-index: -1000 !important;
    top: 0 !important;
    right: 0 !important;
    pointer-events: none !important;
    opacity: 0 !important;
    `;

    const CONTEXT_STYLE = [
        'letter-spacing',
        'line-height',
        'padding-top',
        'padding-bottom',
        'font-family',
        'font-weight',
        'font-size',
        'text-rendering',
        'text-transform',
        'width',
        'text-indent',
        'padding-left',
        'padding-right',
        'border-width',
        'box-sizing',
    ];

    function parseNumber(value: number | string | undefined) {
        if (value) {
            if (typeof value === 'string') {
                const parsedValue = Number.parseInt(value, 10);
                if (!Number.isNaN(value)) {
                    return parsedValue;
                }
            }

            if (typeof value === 'number') return value;
        }

        return 0;
    }

    function getSizingData(styles: CSSStyleDeclaration) {
        const boxSizing = styles.getPropertyValue('box-sizing');
        const paddingSize = Number.parseFloat(styles.getPropertyValue('padding-bottom')) + Number.parseFloat(styles.getPropertyValue('padding-top'));
        const borderSize = Number.parseFloat(styles.getPropertyValue('border-bottom-width')) + Number.parseFloat(styles.getPropertyValue('border-top-width'));

        return {boxSizing, paddingSize, borderSize};
    }

    function isBorderBox(boxSizing: string) {
        return boxSizing === 'border-box';
    }

    function isContentBox(boxSizing: string) {
        return boxSizing === 'content-box';
    }

    let _proxyTextareaElement: HTMLTextAreaElement | undefined = undefined;
    export const ProxyTextareaElement = () => {
        let _element = undefined as HTMLTextAreaElement | undefined;
        let _minRows = 0;
        let _maxRows = 0;
        let _minHeightFromResizeObserver = 0;
        let _sourceStyles = undefined as Undefineable<CSSStyleDeclaration>;
        let _lastCalculatedHeight = 0;
        let _probablyResizeHappen = false;
        let hasStarted = false;

        const __onpointerdown = (e: PointerEvent) => {
            _element!.setPointerCapture(e.pointerId);
        };

        const __onpointermove = () => {
            _probablyResizeHappen = true;
        };

        const __onpointerup = (e: PointerEvent) => {
            _element!.releasePointerCapture(e.pointerId);
            if (_probablyResizeHappen) {
                const newHeight = parseNumber(_element!.style.getPropertyValue('height'));
                if (!Number.isNaN(newHeight) && newHeight !== _lastCalculatedHeight) {
                    _minHeightFromResizeObserver = newHeight;
                }
            }

            _probablyResizeHappen = false;
        };

        const __setup = ({styles, maxRows, minRows}: SetupType) => {
            _sourceStyles = styles;
            _maxRows = parseNumber(maxRows);
            _minRows = parseNumber(minRows);

            _element!.addEventListener('pointerdown', __onpointerdown);
            _element!.addEventListener('pointermove', __onpointermove);
            _element!.addEventListener('pointerup', __onpointerup);

            // setup proxy textarea element
            // if not present
            if (_proxyTextareaElement === undefined) {
                _proxyTextareaElement = document.createElement('textarea');
                const contextStyle = CONTEXT_STYLE.map(name => `${name}:${styles.getPropertyValue(name)}`).join(';');

                _proxyTextareaElement.setAttribute('style', `${contextStyle};${PROXY_TEXTAREA_ELEMENT_HIDDEN_STYLE}`);
                if (_proxyTextareaElement.parentNode === null || _proxyTextareaElement.parentNode !== document.body) {
                    document.body.appendChild(_proxyTextareaElement);
                }
            }
        };

        const __updateText = (text: string) => {
            _proxyTextareaElement!.value = text;
        };

        const __getComputedHeight = () => {
            const {boxSizing, paddingSize, borderSize} = getSizingData(_sourceStyles!);
            let finalHeight = _proxyTextareaElement!.scrollHeight;
            if (isBorderBox(boxSizing)) {
                finalHeight += borderSize;
            } else if (isContentBox(boxSizing)) {
                finalHeight -= paddingSize;
            }

            if (_maxRows !== 0 || _minRows !== 0) {
                _proxyTextareaElement!.value = '';
                const singleRowHeight = _proxyTextareaElement!.scrollHeight - paddingSize;
                if (_minRows !== 0) {
                    let minHeight = singleRowHeight * _minRows;
                    if (isBorderBox(boxSizing)) {
                        minHeight += paddingSize + borderSize;
                    }

                    finalHeight = Math.max(finalHeight, minHeight);
                }

                if (_maxRows !== 0) {
                    let maxHeight = singleRowHeight * _maxRows;
                    if (isBorderBox(boxSizing)) {
                        maxHeight += paddingSize + borderSize;
                    }

                    finalHeight = Math.min(finalHeight, maxHeight);
                }
            }

            finalHeight = Math.max(finalHeight, _minHeightFromResizeObserver);

            _lastCalculatedHeight = finalHeight;
            return finalHeight;
        };
        return {
            get hasStarted() {
                return hasStarted;
            },
            start(element: HTMLTextAreaElement, minRows?: number, maxRows?: number) {
                if (hasStarted) return;
                _element = element;
                const sourceStyles = getComputedStyle(element);
                __setup({
                    styles: sourceStyles,
                    maxRows,
                    minRows,
                });
                hasStarted = true;
            },

            onUpdateText(text: string) {
                __updateText(text);
                _element!.style.setProperty('height', __getComputedHeight() + 'px');
            },

            cleanUp() {
                _element?.removeEventListener('pointerdown', __onpointerdown);
                _element?.removeEventListener('pointermove', __onpointermove);
                _element?.removeEventListener('pointerup', __onpointerup);
            },
        };
    };
</script>

<script lang="ts">
    import type {HTMLTextareaAttributes} from 'svelte/elements';

    interface Props extends HTMLTextareaAttributes {
        minRows?: number;
        maxRows?: number;
    }

    let {value = $bindable(), minRows, maxRows, ...props}: Props = $props();

    let element: HTMLTextAreaElement | null = null;

    const instance = ProxyTextareaElement();

    $effect(() => {
        if (element !== null && !instance.hasStarted) {
            instance.start(element, minRows, maxRows);
        }
        if (instance.hasStarted) {
            instance.onUpdateText((value || '').toString());
            instance.onUpdateText((value || '').toString()); // hack :)
        }
    });

    $effect(() => {
        return () => instance.cleanUp();
    });
</script>

<textarea bind:this={element} bind:value {...props}></textarea>

<style>
    textarea {
        resize: none;
    }
</style>

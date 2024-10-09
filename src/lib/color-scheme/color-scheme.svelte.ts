import { browser } from '$app/environment';
import { getContext, setContext } from 'svelte';

export type ColorScheme = 'dark' | 'light';

class ColorSchemeContext {
	#value = $state<ColorScheme>('light');
	set value(newValue: ColorScheme) {
		this.#value = newValue;
		if (browser) {
			localStorage.setItem('colorScheme', newValue);
			document.documentElement.setAttribute('color-scheme', newValue);
		}
	}
	get value() {
		return this.#value;
	}
	toggle = () => {
		this.value = this.#value === 'light' ? 'dark' : 'light';
	};
}

const colorSchemeSymbol = Symbol('color-scheme');
export function setColorScheme() {
	const ctx = new ColorSchemeContext();
	if (browser) {
		ctx.value = document.documentElement.getAttribute('color-scheme') as ColorScheme;
	}
	setContext(colorSchemeSymbol, ctx);
}

export function getColorScheme() {
	return getContext<ColorSchemeContext>(colorSchemeSymbol);
}

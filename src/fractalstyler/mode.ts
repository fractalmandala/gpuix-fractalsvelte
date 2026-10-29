/**
 * The active fractalstyler mode, in a module with no Node imports so the browser entry can use it.
 * `auto.ts` (Node only) reads it and applies the token map; the browser build has no tokens to apply.
 */

export type FractalstylerMode = 'light' | 'dark';

let current: FractalstylerMode = process.env?.GPUIX_THEME === 'light' ? 'light' : 'dark';

export const fractalstyler_mode = () => current;
export const set_mode_value = (next: FractalstylerMode) => {
	current = next;
};

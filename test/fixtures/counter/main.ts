/**
 * The counter fixture used by smoke and live-automation tests.
 */

import { render_hot } from 'gpuix-fractalsvelte';

render_hot(new URL('./Counter.svelte', import.meta.url), {
	title: 'GPUIX + Svelte',
	width: 820,
	height: 560
});

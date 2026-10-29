// test/fixtures/fractalstyler/main.ts
import { render_hot } from 'gpuix-fractalsvelte';

render_hot(new URL('./App.svelte', import.meta.url), {
	title: 'fractalstyler fixture',
	width: 640,
	height: 480
});
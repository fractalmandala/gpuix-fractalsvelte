// `render_hot` re-imports the component from disk on every save, and a binary
// has no source on disk, so the compiled entry mounts it through a static import.
import { render } from '@fractaldesign/gpuix-fractalsvelte';
import TicTacToe from './TicTacToe.svelte';

render(TicTacToe, {
	title: 'GPUIX + Svelte — Tic-tac-toe',
	width: 480,
	height: 640,
	// What `npm run compile` (@fractaldesign/gpuix-fractalsvelte/build) packages the executable as; the window takes only its Linux app id from it.
	app: {
		name: 'Tic-tac-toe',
		identifier: 'dev.gpuix.svelte.tictactoe',
		// Every gpuix-fractalsvelte release uploads this app for each platform and this manifest with it.
		update: { manifest: 'https://github.com/fractalmandala/gpuix-fractalsvelte/releases/latest/download/update.json' }
	}
});

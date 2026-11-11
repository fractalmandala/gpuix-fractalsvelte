declare module '*.svelte' {
	const component: import('@fractaldesign/gpuix-fractalsvelte').AnyComponent;
	export default component;
}

// A `.css` import registers its rules and tokens with the renderer; it exports nothing.
declare module '*.css';

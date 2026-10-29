import './fractalstyler/auto.ts';
export { load_fractalstyler, set_fractalstyler_mode, fractalstyler_mode, fractalstyler_tokens, type FractalstylerMode, type FractalstylerReport } from './fractalstyler/auto.ts';
export * from './web.ts';
export async function render_hot(entry: string | URL, options: any = {}) {
	const mod = await import('./hot.ts');
	return (mod.render_hot as any)(entry, options);
}

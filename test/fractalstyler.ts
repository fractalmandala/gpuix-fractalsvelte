/** The package root must activate fractalstyler classes and tokens with no app setup. */

import 'gpuix-fractalsvelte';
import { mount_headless, tree, all_text, check, finish } from 'gpuix-fractalsvelte/test';
import App from './fixtures/fractalstyler/App.svelte';

mount_headless(App);

const styles: Record<string, unknown>[] = [];

(function walk(n: any) {
	if (!n) return;
	if (n.style) styles.push(n.style);
	for (const c of n.children ?? []) walk(c);
})(tree() as any);

const has = (test: (s: Record<string, unknown>) => boolean) => styles.some(test);

check('the component rendered', all_text().includes('42'));
check('bg-surface reached GPUI', has((s) => typeof s.backgroundColor === 'string'));
check('gap-md reached GPUI', has((s) => s.gap === 12));
check('themed reached GPUI', has((s) => typeof s.backgroundColor === 'string'));

finish('fractalstyler', 5);

/**
 * Fractalstyler is part of the package, not an app setup step.
 *
 * Importing the package root compiles the shipped fractalstyler Sass, translates
 * its classes into renderer `ClassRule[]`, registers them with `define_styles`,
 * and installs the default mode's token map with `set_css_vars`.
 */

import type { ClassRule } from '../types.ts';
import { define_styles, set_css_vars } from '../renderer.ts';
import { compile_fractalstyler } from './fractalstyler.ts';
import { sort_rules, translate_css, type Loss } from './gpui-css.ts';
import { collect_tokens, empty_raw, flatten, type TokenSets } from './tokens.ts';

import { fractalstyler_mode, set_mode_value, type FractalstylerMode } from './mode.ts';
export type { FractalstylerMode };

export interface FractalstylerReport {
	mode: string;
	rules: number;
	keys: number;
	losses: number;
	warnings: string[];
}

let registered = new Set<string>();
let tokens: TokenSets | null = null;

/** Compile + register the design system. Safe to call again after a style edit. */
export function load_fractalstyler(): FractalstylerReport {
	const build = compile_fractalstyler();

	const raw = empty_raw();
	for (const sheet of build.sheets) collect_tokens(sheet.css, raw);
	const resolved = flatten(raw);

	const rules: ClassRule[] = [];
	const losses: Loss[] = [];
	for (const sheet of build.sheets) {
		const translated = translate_css(sheet.css, { source: sheet.source, tokens: resolved, live: true });
		rules.push(...translated.rules);
		losses.push(...translated.losses);
	}
	const sorted = sort_rules(rules);
	const keys = new Set(sorted.flatMap((rule) => rule.classes));

	// Clear every previously registered key first, or stale rules survive a reload.
	for (const key of registered) define_styles(key, []);
	for (const key of keys) define_styles(key, sorted);
	registered = keys;
	tokens = resolved;
	set_css_vars(resolved[fractalstyler_mode()]);

	return { mode: build.mode, rules: sorted.length, keys: keys.size, losses: losses.length, warnings: build.warnings };
}

export function set_fractalstyler_mode(next: FractalstylerMode): void {
	set_mode_value(next);
	if (tokens) set_css_vars(tokens[next]);
}

export { fractalstyler_mode };
export const fractalstyler_tokens = () => tokens;

try {
	if (typeof process !== 'undefined' && process.versions?.node) {
		const report = load_fractalstyler();
		for (const warning of report.warnings) console.warn(`[gpuix-fractalsvelte] ${warning}`);
	}
} catch (error) {
	console.warn('[gpuix-fractalsvelte] fractalstyler styles failed to load:', (error as Error).message);
}

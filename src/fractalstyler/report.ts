/** Inventory of everything fractalstyler contributes to GPUI. No window, no native renderer. */

import type { ClassRule } from '../types.ts';
import { compile_fractalstyler } from './fractalstyler.ts';
import { sort_rules, translate_css, type Loss } from './gpui-css.ts';
import { collect_tokens, empty_raw, flatten, type TokenSets } from './tokens.ts';

export interface FractalstylerInventory {
	dir: string;
	mode: string;
	tokens: TokenSets;
	classes: string[];
	rules: ClassRule[];
	losses: Loss[];
	warnings: string[];
}

export function fractalstyler_inventory(): FractalstylerInventory {
	const build = compile_fractalstyler();
	const raw = empty_raw();
	for (const sheet of build.sheets) collect_tokens(sheet.css, raw);
	const tokens = flatten(raw);

	const rules: ClassRule[] = [];
	const losses: Loss[] = [];
	for (const sheet of build.sheets) {
		const translated = translate_css(sheet.css, { source: sheet.source, tokens, live: true });
		rules.push(...translated.rules);
		losses.push(...translated.losses);
	}
	const sorted = sort_rules(rules);
	const classes = [...new Set(sorted.flatMap((rule) => rule.classes))].sort();

	return { dir: build.dir, mode: build.mode, tokens, classes, rules: sorted, losses, warnings: build.warnings };
}

export type ReportFormat = 'text' | 'json';

export function format_fractalstyler_inventory(inventory: FractalstylerInventory, format: ReportFormat = 'text'): string {
	if (format === 'json') {
		return JSON.stringify(
			{
				dir: inventory.dir,
				mode: inventory.mode,
				counts: {
					tokens: { light: Object.keys(inventory.tokens.light).length, dark: Object.keys(inventory.tokens.dark).length, invariant: Object.keys(inventory.tokens.invariant).length },
					classes: inventory.classes.length,
					rules: inventory.rules.length,
					losses: inventory.losses.length,
					warnings: inventory.warnings.length
				},
				tokens: inventory.tokens,
				classes: inventory.classes
			},
			null,
			2
		);
	}

	const lines: string[] = [];
	lines.push('fractalstyler');
	lines.push(`  source: ${inventory.dir}`);
	lines.push(`  mode: ${inventory.mode}`);
	lines.push(`  tokens: light ${Object.keys(inventory.tokens.light).length}, dark ${Object.keys(inventory.tokens.dark).length}`);
	lines.push(`  classes: ${inventory.classes.length}`);
	lines.push(`  rules: ${inventory.rules.length}`);
	lines.push(`  losses: ${inventory.losses.length}`);
	if (inventory.warnings.length) lines.push(`  warnings: ${inventory.warnings.length}`);

	const modes = [
		['light', inventory.tokens.light],
		['dark', inventory.tokens.dark]
	] as const;
	for (const [mode, tokens] of modes) {
		lines.push('', `TOKENS (${mode})`);
		for (const name of Object.keys(tokens).sort()) lines.push(`  --${name}: ${tokens[name]}`);
	}

	lines.push('', `CLASSES (${inventory.classes.length})`);
	for (const name of inventory.classes) lines.push(`  .${name}`);

	return lines.join('\n');
}

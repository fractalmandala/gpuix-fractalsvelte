/**
 * A plain `.css` file for GPUI: class and tag rules become `define_global_styles`, `:root`
 * tokens a `set_css_vars` call, and a `[data-mode='dark']`-style block a named palette.
 * There is no cascade and no selector engine, so everything else is skipped with one line
 * per kind rather than one per selector.
 */

import { parse, type AST } from 'svelte/compiler';
import { parse_css_text, replace_vars } from './style.ts';
import type { ClassRule, GpuiStyle, Pseudo } from './types.ts';

export type Warn = (message: string) => void;

const PSEUDOS = new Map<string, Pseudo>([
	['hover', 'hover'],
	['active', 'active'],
	['focus-visible', 'focusVisible']
]);

/** A `body`/`html` block carries the base palette, since GPUI has no such element to style. */
const ROOT_TAGS = new Set(['html', 'body']);

const ROOT = '';

/** `@keyframes` and `@font-face` are painted by GPUI itself or not at all, so they say nothing. */
const SILENT_AT_RULES = new Set(['import', 'keyframes', 'font-face', 'property', 'charset', 'namespace', 'page']);

/** The declaration bodies whose rules are keyed by a selector rather than by a token block. */
type Selector = Pick<ClassRule, 'classes' | 'tag' | 'pseudo'>;

interface TokenBlock {
	scope: string;
	props: Record<string, string>;
}

export interface Stylesheet {
	/** Weakest first, as `define_global_styles` takes them. */
	rules: ClassRule[];
	/** `:root`/`html`/`body` tokens, each resolved through the others. */
	base: Record<string, string>;
	/** One complete set per `[data-mode='dark']`-style block, base included, so a switch is one call. */
	palettes: Record<string, Record<string, string>>;
}

/** A compound selector's simple selectors, with `:where(...)`/`:is(...)` spliced in. */
function unwrap(list: AST.CSS.SimpleSelector[]): AST.CSS.SimpleSelector[] | null {
	const out: AST.CSS.SimpleSelector[] = [];

	for (const simple of list) {
		if (simple.type === 'PseudoClassSelector' && (simple.name === 'where' || simple.name === 'is')) {
			const inside = simple.args?.children;
			if (!inside || inside.length !== 1) return null;
			const inner = compound(inside[0]);
			if (inner === null) return null;
			out.push(...inner);
			continue;
		}
		out.push(simple);
	}

	return out;
}

/** One compound selector, or null for anything with a combinator. */
function compound(selector: AST.CSS.ComplexSelector): AST.CSS.SimpleSelector[] | null {
	if (selector.children.length !== 1) return null;
	const relative = selector.children[0];
	if (relative.combinator) return null;
	return unwrap(relative.selectors);
}

function target(selector: AST.CSS.ComplexSelector): Selector | { tokens: string } | null {
	const list = compound(selector);
	if (list === null) return null;

	if (list.length === 1) {
		const only = list[0];
		if (only.type === 'PseudoClassSelector' && only.name === 'root' && only.args === null) return { tokens: ROOT };
		if (only.type === 'TypeSelector' && ROOT_TAGS.has(only.name)) return { tokens: ROOT };
		if (only.type === 'AttributeSelector' && only.matcher === '=' && only.value !== null) return { tokens: only.value };
	}

	const classes: string[] = [];
	let tag: string | null = null;
	let pseudo: Pseudo = null;

	for (const simple of list) {
		if (simple.type === 'ClassSelector') classes.push(simple.name);
		else if (simple.type === 'TypeSelector' && tag === null && simple.name !== '*') tag = simple.name;
		else if (simple.type === 'PseudoClassSelector' && simple.args === null && pseudo === null && PSEUDOS.has(simple.name)) {
			pseudo = PSEUDOS.get(simple.name) ?? null;
		} else return null;
	}

	return classes.length === 0 && tag === null ? null : { classes, tag, pseudo };
}

/** One line per kind, not per selector: a design system has hundreds of the same refusal. */
const SKIPPED = {
	selector: ['selector GPUI cannot match', 'selectors GPUI cannot match'],
	conditional: ['conditional block', 'conditional blocks'],
	at_rule: ['at-rule', 'at-rules'],
	nested: ['nested rule', 'nested rules'],
	root: ['declaration on :root, html or body', 'declarations on :root, html or body'],
	tokens: ['custom property scoped to a class', 'custom properties scoped to a class']
} as const;

const WHY = {
	selector: 'combinators, attribute selectors, :not() and pseudo-elements never reach GPUI',
	conditional: 'GPUI has no viewport or @supports conditions',
	at_rule: 'GPUI has no such at-rule',
	nested: 'GPUI has no nesting',
	root: 'there is no such element, so only their tokens are kept',
	tokens: "GPUI's palette is one global map"
} as const;

type SkipKind = keyof typeof SKIPPED;

/** The compiler's own CSS parser is the one a `<style>` block goes through, so a file is read the same way. */
const WRAPPER = '<style>';

function parse_css(css: string, path: string): AST.CSS.StyleSheet | null {
	try {
		return parse(`${WRAPPER}${css}</style>`, { modern: true }).css;
	} catch (error) {
		throw new Error(`[gpuix-fractalsvelte] ${path}: ${(error as Error).message}`, { cause: error });
	}
}

/** `./x.css` and `pkg/x.css`, as offsets into `css` itself. */
export function css_imports(css: string, path: string): Array<{ start: number; end: number; url: string }> {
	const sheet = parse_css(css, path);
	if (!sheet) return [];

	const found: Array<{ start: number; end: number; url: string }> = [];
	for (const node of sheet.children) {
		if (node.type !== 'Atrule' || node.name !== 'import') continue;
		const url = node.prelude.trim().replace(/^url\(\s*/i, '').replace(/\s*\)$/, '').replace(/^['"]|['"]$/g, '');
		found.push({ start: node.start - WRAPPER.length, end: node.end - WRAPPER.length, url });
	}
	return found;
}

/** A token that reads another one has to be resolved here, or GPUI would receive a `var()` it cannot read. */
function resolve_tokens(props: Record<string, string>): Record<string, string> {
	const lookup = (name: string) => props[name];
	const out: Record<string, string> = {};
	for (const [name, value] of Object.entries(props)) out[name] = replace_vars(value, lookup) ?? value;
	return out;
}

/** The weight `compile.ts` sorts by: more classes wins, then a tag, then source order. */
const weight = (rule: ClassRule) => rule.classes.length * 2 + (rule.tag === null ? 0 : 1);

export function parse_stylesheet(css: string, path: string, warn: Warn = console.warn): Stylesheet {
	const source = `${WRAPPER}${css}</style>`;
	const sheet = parse_css(css, path);

	const rules: ClassRule[] = [];
	const blocks: TokenBlock[] = [];
	const skipped = new Map<SkipKind, { count: number; first: string }>();

	if (!sheet) return { rules, base: {}, palettes: {} };

	const skip = (kind: SkipKind, what: string) => {
		const found = skipped.get(kind);
		if (found) found.count++;
		else skipped.set(kind, { count: 1, first: what });
	};

	/** A block that reads a `var()` only resolves at runtime, so it ships as CSS text. */
	const body_of = (plain: string[]): { css: string } | { style: GpuiStyle } | null => {
		const text = plain.join('; ');
		if (text === '') return null;
		return text.includes('var(') ? { css: text } : { style: parse_css_text(text) };
	};

	const visit = (block: AST.CSS.Block | AST.CSS.StyleSheet) => {
		for (const node of block.children) {
			if (node.type === 'Atrule') {
				if (node.name === 'layer') {
					if (node.block) visit(node.block);
				} else if (SILENT_AT_RULES.has(node.name)) {
					continue;
				} else if (node.name === 'media' || node.name === 'supports' || node.name === 'container') {
					skip('conditional', `@${node.name} ${node.prelude}`.trim());
				} else {
					skip('at_rule', `@${node.name} ${node.prelude}`.trim());
				}
				continue;
			}

			if (node.type !== 'Rule') continue;

			const custom = new Map<string, string>();
			const plain: string[] = [];
			let nested = false;
			for (const child of node.block.children) {
				if (child.type === 'Declaration') {
					if (child.property.startsWith('--')) custom.set(child.property.slice(2), child.value.trim());
					else plain.push(`${child.property}: ${child.value}`);
				} else {
					nested = true;
				}
			}
			const body = body_of(plain);
			if (nested) skip('nested', `${source.slice(node.prelude.start, node.prelude.end).trim()} { … }`);

			for (const complex of node.prelude.children) {
				const found = target(complex);
				const text = source.slice(complex.start, complex.end).trim();
				if (found === null) {
					skip('selector', text);
					continue;
				}
				if ('tokens' in found) {
					if (custom.size > 0) blocks.push({ scope: found.tokens, props: Object.fromEntries(custom) });
					if (body !== null) skip('root', text);
					continue;
				}
				if (custom.size > 0) skip('tokens', text);
				if (body !== null) rules.push({ ...found, ...body });
			}
		}
	};

	visit(sheet);

	for (const [kind, found] of skipped) {
		const [one, many] = SKIPPED[kind];
		warn(`[gpuix-fractalsvelte] ${path}: skipped ${found.count} ${found.count === 1 ? one : many} — ${WHY[kind]}; first \`${found.first}\``);
	}

	// Later blocks win, as the cascade has it, so the tokens are folded in source order.
	const base_props: Record<string, string> = {};
	const named: Record<string, Record<string, string>> = {};
	for (const block of blocks) Object.assign(block.scope === ROOT ? base_props : (named[block.scope] ??= {}), block.props);

	const base = resolve_tokens(base_props);
	const palettes: Record<string, Record<string, string>> = {};
	for (const [name, props] of Object.entries(named)) palettes[name] = resolve_tokens({ ...base_props, ...props });

	return { rules: rules.sort((a, b) => weight(a) - weight(b)), base, palettes };
}

/**
 * Unknown keys need no allowlist — serde drops them when deserializing
 * `StyleDesc` on the Rust side. Values are the opposite: a key GPUI *does*
 * know, handed a string it can't parse, throws out of `applyBatch`.
 */

import type { GpuiStyle, ShadowAttrs, StyleRule, StyleValue } from './types.ts';

const PX = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)px$/i;
const NUM = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/;
const PERCENT = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)%$/;
const REM = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)rem$/i;
const NUMERIC_ISH = /^[-+.\d]/;

/** There is no cascade for it to outrank, and left on a value it fails every check below. */
const IMPORTANT = /\s*!\s*important$/i;

/** No GPUI sizing mode matches these, and `auto` is the nearest a `DimensionValue` can say. */
const INTRINSIC = /^(?:max-content|min-content|fit-content)(?:\(.*\))?$/;

/** Native matches only `scroll` and `hidden`, so `auto` would be accepted and then ignored. */
const OVERFLOW = new Set(['overflow', 'overflowX', 'overflowY']);

/**
 * GPUI lays out in a horizontal, left-to-right writing mode, which is the one CSS assumes by
 * default, so a logical property has exactly one physical spelling.
 */
const LOGICAL_PAIR: Record<string, [string, string] | undefined> = {
	paddingInline: ['paddingLeft', 'paddingRight'],
	paddingBlock: ['paddingTop', 'paddingBottom'],
	marginInline: ['marginLeft', 'marginRight'],
	marginBlock: ['marginTop', 'marginBottom'],
	insetInline: ['left', 'right'],
	insetBlock: ['top', 'bottom']
};

const LOGICAL_ONE: Record<string, string | undefined> = {
	paddingInlineStart: 'paddingLeft',
	paddingInlineEnd: 'paddingRight',
	paddingBlockStart: 'paddingTop',
	paddingBlockEnd: 'paddingBottom',
	marginInlineStart: 'marginLeft',
	marginInlineEnd: 'marginRight',
	marginBlockStart: 'marginTop',
	marginBlockEnd: 'marginBottom',
	inlineSize: 'width',
	blockSize: 'height',
	minInlineSize: 'minWidth',
	minBlockSize: 'minHeight',
	maxInlineSize: 'maxWidth',
	maxBlockSize: 'maxHeight',
	insetInlineStart: 'left',
	insetInlineEnd: 'right',
	insetBlockStart: 'top',
	insetBlockEnd: 'bottom'
};

/** The `border: 1px solid red` family, which GPUI splits into a width, a style and a colour. */
const BORDER_STYLE = new Set(['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset', 'hidden', 'none']);
const BORDER_WIDTH: Record<string, string | undefined> = { thin: '1', medium: '3', thick: '5' };
const BORDER_SIDE: Record<string, string | undefined> = {
	borderTop: 'borderTopWidth',
	borderRight: 'borderRightWidth',
	borderBottom: 'borderBottomWidth',
	borderLeft: 'borderLeftWidth'
};

/** GPUI reads these as a bare `f64`, so any string at all fails to deserialize. */
const NUMBER_ONLY = new Set([
	'flexGrow',
	'flexShrink',
	'flexBasis',
	'gap',
	'rowGap',
	'columnGap',
	'gridTemplateColumns',
	'gridTemplateRows',
	'padding',
	'paddingTop',
	'paddingRight',
	'paddingBottom',
	'paddingLeft',
	'margin',
	'marginTop',
	'marginRight',
	'marginBottom',
	'marginLeft',
	'top',
	'right',
	'bottom',
	'left',
	'opacity',
	'borderWidth',
	'borderTopWidth',
	'borderRightWidth',
	'borderBottomWidth',
	'borderLeftWidth',
	'borderRadius',
	'borderTopLeftRadius',
	'borderTopRightRadius',
	'borderBottomLeftRadius',
	'borderBottomRightRadius',
	'fontSize',
	'lineHeight',
	'lineClamp',
	'aspectRatio',
	'outlineWidth',
	'outlineOffset',
	'scrollbarWidth'
]);

/** Rust `String`s (`background` an enum of one or a gradient), so `color: 123456` must not coerce into a number. */
const TEXT_ONLY = new Set([
	'display',
	'visibility',
	'flexDirection',
	'flexWrap',
	'alignItems',
	'alignSelf',
	'alignContent',
	'justifyContent',
	'gridColumnMin',
	'gridRowMin',
	'position',
	'background',
	'backgroundColor',
	'color',
	'borderColor',
	'borderStyle',
	'outlineColor',
	'fontFamily',
	'textAlign',
	'whiteSpace',
	'textOverflow',
	'textDecoration',
	'overflow',
	'overflowX',
	'overflowY',
	'scrollbarColor',
	'cursor',
	'pointerEvents',
	'userSelect',
	'selectionColor'
]);

/** Rust `bool`s: the string CSS text hands over would fail to deserialize. */
const BOOLEAN = new Set(['keyboardFocusDim']);

/** A unitless `aspect-ratio`, `1.5` or `16 / 9`; a length is no ratio, so it must not coerce like one. */
const RATIO = /^([+-]?(?:\d+(?:\.\d+)?|\.\d+))(?:\s*\/\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+)))?$/;

/** GPUI paints a thumb and no track, so only the first colour of `scrollbar-color: thumb track` applies. */
const FIRST_COLOR = /^(?:[^\s(]+\([^)]*\)|\S+)/;

/** The only keys GPUI reads as a `DimensionValue`, so the only ones `%` and `auto` survive. */
const DIMENSION = new Set(['width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight']);

const PSEUDO_ATTRS = [
	['hover', 'hover'],
	['active', 'active'],
	['focusVisible', 'focus-visible']
] as const;

/** A struct on the Rust side — CSS text can never produce one. */
const NEVER = new Set(['boxShadow', 'hover', 'active', 'focusVisible']);

/** GPUI has no `inset` field, so that one expands even when it holds one value. */
const BOX: Record<string, string[] | undefined> = {
	padding: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
	margin: ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'],
	borderWidth: ['borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth'],
	borderRadius: [
		'borderTopLeftRadius',
		'borderTopRightRadius',
		'borderBottomRightRadius',
		'borderBottomLeftRadius'
	],
	inset: ['top', 'right', 'bottom', 'left']
};

/**
 * GPUI reads a longhand over its shorthand whatever the order, so a later
 * `padding: 20px` has to clear the longhands an earlier `padding: 12px 24px` left.
 */
const SUPERSEDES: Record<string, string[] | undefined> = { ...BOX, gap: ['rowGap', 'columnGap'] };

function put(out: GpuiStyle, key: string, value: GpuiStyle[string]) {
	const longhands = SUPERSEDES[key];
	if (longhands) for (const l of longhands) delete out[l];
	out[key] = value;
}

function merge(target: GpuiStyle, source: GpuiStyle): GpuiStyle {
	for (const key in source) put(target, key, source[key]);
	return target;
}

// The CSS 1-4 value rules; corners happen to fill in the same order as sides.
const FILL = [
	[0, 0, 0, 0],
	[0, 1, 0, 1],
	[0, 1, 2, 1],
	[0, 1, 2, 3]
];

const warned = new Set<string>();

/** The docs' playground recompiles one source on every edit and has to hear a dropped value each time. */
export const forget_style_warnings = () => warned.clear();

/** `var(--name)` values, set from JS; every rule or inline style that reads one re-resolves on change. */
const css_vars = new Map<string, string>();
let vars_generation = 0;
let vars_read = false;
const warned_vars = new Set<string>();
const pending_vars = new Set<string>();

/** Keys with or without the `--`; false when nothing moved, so an identical palette costs no restyle. */
export function define_css_vars(vars: Record<string, string | number | null>): boolean {
	let changed = false;

	for (const [key, value] of Object.entries(vars)) {
		const name = key.startsWith('--') ? key.slice(2) : key;
		if (value == null) {
			if (css_vars.delete(name)) changed = true;
		} else if (css_vars.get(name) !== String(value)) {
			css_vars.set(name, String(value));
			changed = true;
		}
	}

	if (changed) vars_generation++;
	return changed;
}

/** Deferred to the commit, since Svelte styles the tree before the root's `$effect` can set the palette. */
export function flush_var_warnings() {
	for (const name of pending_vars) {
		if (css_vars.has(name)) continue;
		warned_vars.add(name);
		console.warn(`[gpuix-fractalsvelte] \`var(--${name})\` is not defined — set it with set_css_vars() or give it a fallback`);
	}
	pending_vars.clear();
}

/** Whether the last `build_style` read a variable, so the renderer knows what to restyle. */
export const used_css_vars = () => vars_read;

/** A token that reads another token (`--text-md: var(--text-static-md)`) needs more than one pass. */
const MAX_VAR_DEPTH = 16;

/**
 * Replaces each `var(--name[, fallback])` in a value through `lookup`. Null means a variable
 * was undefined with no fallback, and the declaration has to be dropped.
 */
export function replace_vars(value: string, lookup: (name: string) => string | undefined, depth = 0): string | null {
	let out = '';
	let at = 0;

	for (;;) {
		const start = value.indexOf('var(', at);
		if (start === -1) {
			out += value.slice(at);
			break;
		}

		// Balanced parens, since a fallback may be `rgba(...)`.
		let parens = 0;
		let end = -1;
		for (let i = start + 3; i < value.length; i++) {
			if (value[i] === '(') parens++;
			else if (value[i] === ')' && --parens === 0) {
				end = i;
				break;
			}
		}
		if (end === -1) return out + value.slice(at);

		const inner = value.slice(start + 4, end);
		const comma = inner.indexOf(',');
		const name = (comma === -1 ? inner : inner.slice(0, comma)).trim().replace(/^--/, '');

		let resolved = lookup(name);
		if (resolved === undefined) {
			if (comma === -1) return null;
			const fallback = replace_vars(inner.slice(comma + 1).trim(), lookup, depth + 1);
			if (fallback === null) return null;
			resolved = fallback;
		}

		out += value.slice(at, start) + resolved;
		at = end + 1;
	}

	if (depth < MAX_VAR_DEPTH && out.includes('var(')) return replace_vars(out, lookup, depth + 1);
	return out;
}

function substitute_vars(value: string): string | null {
	return replace_vars(value, (name) => {
		vars_read = true;
		const found = css_vars.get(name);
		// Deferred to the commit: the root's palette effect runs after Svelte styled the tree.
		if (found === undefined && !warned_vars.has(name)) pending_vars.add(name);
		return found;
	});
}

function camel(key: string) {
	return key.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

/** `12px` must become `12`, while `50%`, `auto` and `#1e1e2e` stay strings. */
function coerce(value: string): StyleValue {
	if (PX.test(value) || NUM.test(value)) return parseFloat(value);
	// GPUI's rem size is 16 px and gpuix never changes it.
	if (REM.test(value)) return parseFloat(value) * 16;
	return value;
}

function accepts(key: string, value: StyleValue) {
	if (NEVER.has(key)) return false;
	if (NUMBER_ONLY.has(key)) return typeof value === 'number';
	if (BOOLEAN.has(key)) return typeof value === 'boolean';
	if (TEXT_ONLY.has(key) && typeof value === 'number') return false;
	if (DIMENSION.has(key)) {
		return typeof value === 'number' || value === 'auto' || (typeof value === 'string' && PERCENT.test(value));
	}
	// Not a key we have typed: serde drops it if GPUI doesn't know it either, but
	// a length-shaped string on one it does know would throw, so keep those out.
	return typeof value !== 'string' || !NUMERIC_ISH.test(value);
}

/**
 * A value GPUI's deserializer would reject (`1em`, `12px 24px`, `50%` on a
 * pixel-only key) throws out of `applyBatch` and takes the whole frame with it,
 * so drop it and say so once per property.
 */
function assign(out: GpuiStyle, key: string, value: string) {
	let coerced = coerce(value);
	if (key === 'aspectRatio') {
		const ratio = RATIO.exec(value);
		coerced = ratio ? parseFloat(ratio[1]) / (ratio[2] ? parseFloat(ratio[2]) : 1) : value;
	} else if (key === 'scrollbarColor') coerced = FIRST_COLOR.exec(value)?.[0] ?? value;
	else if (BOOLEAN.has(key) && (value === 'true' || value === 'false')) coerced = value === 'true';
	else if (coerced === 'auto' && OVERFLOW.has(key)) coerced = 'scroll';
	else if (typeof coerced === 'string' && DIMENSION.has(key) && INTRINSIC.test(coerced)) coerced = 'auto';

	if (!accepts(key, coerced)) {
		if (!warned.has(key)) {
			warned.add(key);
			console.warn(`[gpuix-fractalsvelte] dropped unsupported style value \`${key}: ${value}\``);
		}
		return;
	}

	put(out, key, coerced);
}

/** Splits on whitespace outside `(...)`, so a colour like `rgb(0 0 0 / .3)` stays one value. */
function split_values(value: string): string[] {
	const out: string[] = [];
	let parens = 0;
	let quote = '';
	let current = '';

	for (const c of value) {
		if (quote) {
			current += c;
			if (c === quote) quote = '';
		} else if (c === '"' || c === "'") {
			quote = c;
			current += c;
		} else if (c === '(') {
			parens++;
			current += c;
		} else if (c === ')') {
			if (parens > 0) parens--;
			current += c;
		} else if (parens === 0 && /\s/.test(c)) {
			if (current !== '') out.push(current);
			current = '';
		} else {
			current += c;
		}
	}

	if (current !== '') out.push(current);
	return out;
}

/** `border: 1px solid #fff`, in any order, which no single GPUI field can take. */
function border_parts(value: string) {
	let width: string | undefined;
	let style: string | undefined;
	let color: string | undefined;

	for (const part of split_values(value)) {
		if (part === 'none') width = '0';
		else if (BORDER_STYLE.has(part)) style = part;
		else if (BORDER_WIDTH[part] !== undefined) width = BORDER_WIDTH[part];
		else if (/^[+-]?(?:\d|\.\d)[\w%.]*$/.test(part)) width = part;
		else color = part;
	}

	return { width, style, color };
}

/** `flex: 1 1 0%` as GPUI's three fields; the keyword forms set only the factors. */
function expand_flex(out: GpuiStyle, value: string) {
	const parts = split_values(value);

	if (parts.length === 1 && parts[0] === 'none') {
		assign(out, 'flexGrow', '0');
		assign(out, 'flexShrink', '0');
		return;
	}
	if (parts.length === 1 && parts[0] === 'auto') {
		assign(out, 'flexGrow', '1');
		assign(out, 'flexShrink', '1');
		return;
	}

	const factors = parts.filter((part) => NUM.test(part));
	const basis = parts.find((part) => !NUM.test(part));
	if (factors[0] !== undefined) assign(out, 'flexGrow', factors[0]);
	if (factors[1] !== undefined) assign(out, 'flexShrink', factors[1]);
	else if (factors[0] !== undefined) assign(out, 'flexShrink', '1');
	// GPUI takes a pixel basis, where a `0%` basis is the same as a `0px` one.
	if (basis === undefined || basis === '0%' || basis === '0px') assign(out, 'flexBasis', '0');
}

function expand(out: GpuiStyle, key: string, value: string) {
	const parts = value.split(/\s+/);

	if (key === 'border' || BORDER_SIDE[key] !== undefined) {
		const { width, style, color } = border_parts(value);
		const field = BORDER_SIDE[key] ?? 'borderWidth';
		if (width !== undefined) assign(out, field, width);
		if (style !== undefined) assign(out, 'borderStyle', style);
		if (color !== undefined) assign(out, 'borderColor', color);
		return true;
	}

	if (key === 'outline') {
		const { width, color } = border_parts(value);
		if (width !== undefined) assign(out, 'outlineWidth', width);
		if (color !== undefined) assign(out, 'outlineColor', color);
		return true;
	}

	if (key === 'flex') {
		expand_flex(out, value);
		return true;
	}

	const pair = LOGICAL_PAIR[key];
	if (pair !== undefined) {
		const sides = split_values(value);
		assign(out, pair[0], sides[0]);
		assign(out, pair[1], sides[1] ?? sides[0]);
		return true;
	}

	const physical = LOGICAL_ONE[key];
	if (physical !== undefined) {
		assign(out, physical, value);
		return true;
	}

	if (key === 'gap' && parts.length === 2) {
		assign(out, 'rowGap', parts[0]);
		assign(out, 'columnGap', parts[1]);
		return true;
	}

	const targets = BOX[key];
	if (!targets || parts.length > 4 || (parts.length === 1 && key !== 'inset')) return false;

	const fill = FILL[parts.length - 1];
	for (let i = 0; i < 4; i++) assign(out, targets[i], parts[fill[i]]);
	return true;
}

// Splits the way Svelte's `style:` read-modify-write does, so a `;` inside quotes, `(...)` or a comment stays in its value.
function split_declarations(css: string): string[] {
	const out: string[] = [];
	let quote = '';
	let depth = 0;
	let comment = false;
	let start = 0;

	for (let i = 0; i < css.length; i++) {
		const c = css[i];
		if (comment) {
			if (c === '/' && css[i - 1] === '*') comment = false;
		} else if (c === '\\') {
			i++;
		} else if (quote) {
			if (c === quote) quote = '';
		} else if (c === '/' && css[i + 1] === '*') {
			comment = true;
		} else if (c === '"' || c === "'") {
			quote = c;
		} else if (c === '(') {
			depth++;
		} else if (c === ')') {
			if (depth > 0) depth--;
		} else if (c === ';' && depth === 0) {
			out.push(css.slice(start, i));
			start = i + 1;
		}
	}
	out.push(css.slice(start));
	return out;
}

export function parse_css_text(css: string | null | undefined): GpuiStyle {
	const out: GpuiStyle = {};
	if (!css) return out;

	let line_ratio: number | null = null;

	for (const decl of split_declarations(css)) {
		const colon = decl.indexOf(':');
		if (colon === -1) continue;

		const key = camel(decl.slice(0, colon).trim());
		const raw = decl.slice(colon + 1).trim().replace(IMPORTANT, '');
		if (key === '' || raw === '') continue;

		const value = raw.includes('var(') ? substitute_vars(raw) : raw;
		if (value === null) continue;

		// A unitless `line-height` is a multiple of the font size, and GPUI reads it as pixels.
		if (key === 'lineHeight' && NUM.test(value)) {
			line_ratio = parseFloat(value);
			continue;
		}

		if (!expand(out, key, value)) assign(out, key, value);
	}

	if (line_ratio !== null) {
		const base = typeof out.fontSize === 'number' ? out.fontSize : 16;
		put(out, 'lineHeight', line_ratio * base);
	}

	return out;
}

/** A rule that reads a variable ships as CSS text and is parsed here, once per change. */
function rule_style(rule: StyleRule): GpuiStyle {
	if (rule.css === undefined) return rule.style;

	if (rule.generation !== vars_generation) {
		rule.generation = vars_generation;
		rule.resolved = parse_css_text(rule.css);
	}
	vars_read = true;
	return rule.resolved!;
}

/**
 * `hover`, `active` and `focusVisible` are GPUI's natively-handled pseudo styles —
 * nested objects, which CSS text can't express, so they arrive as their own
 * attributes (or as `:hover`/`:active`/`:focus-visible` rules) and get folded back in here.
 *
 * `attrs` are the raw attribute strings off the shadow node; `rules` the element's
 * matching `<style>` rules, weakest first.
 */
export function build_style(attrs: ShadowAttrs, rules: readonly StyleRule[] = []): GpuiStyle {
	vars_read = false;
	const style: GpuiStyle = {};
	const pseudo: Partial<Record<'hover' | 'active' | 'focusVisible', GpuiStyle>> = {};

	for (const rule of rules) {
		const declared = rule_style(rule);
		if (rule.pseudo) pseudo[rule.pseudo] = merge(pseudo[rule.pseudo] ?? {}, declared);
		else merge(style, declared);
	}

	// Inline wins over a class, as in CSS.
	merge(style, parse_css_text(attrs.style as string | undefined));
	for (const [key, attr] of PSEUDO_ATTRS) {
		const inline = attrs[attr] as string | undefined;
		if (pseudo[key] || inline) style[key] = merge(pseudo[key] ?? {}, parse_css_text(inline));
	}

	return style;
}

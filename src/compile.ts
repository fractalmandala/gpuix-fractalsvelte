/**
 * `experimental.customRenderer` is what makes the compiler emit
 * `import $renderer from '@fractaldesign/gpuix-fractalsvelte/renderer'` and wrap the component in
 * `$.push_renderer($renderer)`.
 */

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve as resolve_path } from 'node:path';
import { Parser, type Node as AcornNode } from 'acorn';
import { compileModule } from 'svelte/compiler';
import { compile_source } from './compile-core.ts';
import { css_imports, parse_stylesheet, type Warn } from './css.ts';

/**
 * The compiler bakes this into every component's `import $renderer from '...'`,
 * which must resolve from the `.svelte` file's own location — so components
 * outside this workspace need the override to supply an absolute path.
 */
export const RENDERER_MODULE = process.env.GPUIX_SVELTE_RENDERER || '@fractaldesign/gpuix-fractalsvelte/renderer';

/**
 * The registry's svelte carries the same version number as the custom-renderer build this
 * package bundles, so the loaders check for the API itself.
 */
export const WRONG_SVELTE =
	'[gpuix-fractalsvelte] svelte resolved to a build without the custom-renderer API. gpuix-fractalsvelte bundles the build it needs — remove svelte from your own dependencies and reinstall.';

/** The only nodes that carry a module specifier; a string that merely looks like one does not. */
const SPECIFIER_NODES = new Set([
	'ImportDeclaration',
	'ImportExpression',
	'ExportAllDeclaration',
	'ExportNamedDeclaration'
]);

/** A specifier that can carry `render_hot`'s `?v=N`: a bare one can't, and a package is not being edited. */
const BUSTED = /\.(?:svelte|css)$/;

type SpecifierNode = AcornNode & { source?: (AcornNode & { type: string; value: unknown }) | null };

/** The same compiled component JS, with every child `.svelte` or `.css` specifier carrying the `?v=N` cache-buster. */
function bust_child_specifiers(code: string, query: string): string {
	const closing_quotes: number[] = [];

	function scan(node: AcornNode) {
		// A computed `import(expr)` has no literal to rewrite, and never had one.
		const source = SPECIFIER_NODES.has(node.type) ? (node as SpecifierNode).source : undefined;
		if (source?.type === 'Literal') {
			const value = String(source.value);
			if (BUSTED.test(value) && /^(\.|\/|file:)/.test(value)) closing_quotes.push(source.end - 1);
		}

		for (const key in node) {
			const child = (node as unknown as Record<string, unknown>)[key];
			if (Array.isArray(child)) {
				for (const item of child) if ((item as AcornNode | null)?.type) scan(item as AcornNode);
			} else if ((child as AcornNode | null)?.type) {
				scan(child as AcornNode);
			}
		}
	}

	scan(Parser.parse(code, { ecmaVersion: 'latest', sourceType: 'module' }));

	// Back to front, so a splice never shifts an offset still to come.
	let out = code;
	for (const at of closing_quotes.sort((a, b) => b - a)) {
		out = out.slice(0, at) + query + out.slice(at);
	}
	return out;
}

/** Compiles the `.svelte` file at `path` to client JS; `query` is the `?v=N` cache-buster `render_hot` appends, if any. */
export function compile_svelte(path: string, query?: string): string {
	const code = compile_source(readFileSync(path, 'utf8'), path, RENDERER_MODULE);

	// Propagate the cache-buster to child components, or a reload would
	// re-instantiate the root against stale children.
	return query ? bust_child_specifiers(code, query) : code;
}

/**
 * A `.svelte.ts` module has runes but no template, so it needs neither the renderer
 * import nor a cache-buster: it is loaded once and shared, which is what lets its
 * state outlive a hot remount. `source` is passed in when a loader has already
 * stripped the types, since `compileModule` does not.
 */
export function compile_module(path: string, source: string = readFileSync(path, 'utf8')): string {
	const { js, warnings } = compileModule(source, { filename: path, generate: 'client' });

	for (const warning of warnings) {
		console.warn(`[gpuix-fractalsvelte] ${path}: ${warning.message}`);
	}

	return js.code;
}

/** Where an `@import` points: beside the file for a path, through a package's `exports` for a bare one. */
function resolve_css(url: string, from: string): string | null {
	if (/^(?:\.|\/)/.test(url)) return resolve_path(dirname(from), url);
	try {
		return createRequire(from).resolve(url);
	} catch {
		return null;
	}
}

/** `@import` has no runtime in GPUI, so the chain is flattened into the file that pulls it in. */
function inline_css_imports(path: string, seen: Set<string>, warn: Warn): string {
	if (seen.has(path)) return '';
	seen.add(path);

	let css = readFileSync(path, 'utf8');
	for (const found of css_imports(css, path).sort((a, b) => b.start - a.start)) {
		const resolved = resolve_css(found.url, path);
		if (resolved === null) {
			warn(`[gpuix-fractalsvelte] ${path}: cannot resolve \`@import "${found.url}"\``);
			css = css.slice(0, found.start) + css.slice(found.end);
			continue;
		}
		css = css.slice(0, found.start) + inline_css_imports(resolved, seen, warn) + css.slice(found.end);
	}
	return css;
}

/**
 * Compiles a `.css` file to a module that registers its rules and tokens with the renderer:
 * `define_global_styles` for what GPUI can match, `set_css_vars` for `:root` and
 * `define_palette` for a `[data-mode='dark']`-style block.
 */
export function compile_css(path: string, warn: Warn = console.warn): string {
	const sheet = parse_stylesheet(inline_css_imports(path, new Set(), warn), path, warn);
	const lines: string[] = [];

	if (sheet.rules.length > 0 || Object.keys(sheet.base).length > 0 || Object.keys(sheet.palettes).length > 0) {
		lines.push(
			`import { define_global_styles as $g, define_palette as $p, set_css_vars as $v } from ${JSON.stringify(RENDERER_MODULE)};`
		);
	}
	if (sheet.rules.length > 0) lines.push(`$g(${JSON.stringify(path)}, ${JSON.stringify(sheet.rules)});`);
	if (Object.keys(sheet.base).length > 0) lines.push(`$v(${JSON.stringify(sheet.base)});`);
	for (const [name, vars] of Object.entries(sheet.palettes)) lines.push(`$p(${JSON.stringify(name)}, ${JSON.stringify(vars)});`);

	return lines.length > 0 ? `${lines.join('\n')}\n` : 'export {};\n';
}

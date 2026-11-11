/**
 * A `.css` import reaches GPUI through the loaders: `compile.ts` turns the file into calls that
 * register global rules, `:root` tokens and one palette per mode, and the renderer matches those
 * rules ahead of a component's own `<style>` sheet. This checks the translation, the registration
 * and what a real tree makes of it.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse_stylesheet } from '../src/css.ts';
import { compile_css } from '../src/compile.ts';
import { use_palette } from '@fractaldesign/gpuix-fractalsvelte';
import { mount_headless, find_test_id, settle, check, finish } from '@fractaldesign/gpuix-fractalsvelte/test';

const FIXTURE = fileURLToPath(new URL('./stylesheet.css', import.meta.url));

// --- the translation, on its own --------------------------------------------
const warnings: string[] = [];
const sheet = parse_stylesheet(readFileSync(FIXTURE, 'utf8'), FIXTURE, (message) => warnings.push(message));

check('the layer is flattened, and its class rules come through', sheet.rules.some((r) => r.classes.join('.') === 'card'), true);
check('a token resolved through another token', sheet.base['nested'], '8px');
check('both modes become palettes', Object.keys(sheet.palettes), ['light', 'dark']);
check('a palette is complete, base included', [sheet.palettes.dark['bg'], sheet.palettes.dark['theme'], sheet.palettes.dark['space']], ['#101010', '#00ff00', '8px']);
check('a rule that reads a token ships as text, so it re-resolves per palette', typeof sheet.rules.find((r) => r.classes.join('.') === 'card')?.css, 'string');
check('a rule without one is parsed at load', sheet.rules.find((r) => r.classes.join('.') === 'flexy')?.style?.flexGrow, 1);
check(':where() is unwrapped into the class it holds', sheet.rules.some((r) => r.classes.join('.') === 'carded' && r.style?.paddingTop === 4), true);
check('the imported file is not inlined by the parser alone', sheet.rules.some((r) => r.classes.join('.') === 'tag'), false);

check('one line names what the @media block costs', warnings.filter((w) => w.includes('@media')).length, 1);
check('so does the descendant selector', warnings.filter((w) => w.includes('combinators')).length, 1);
check('and the declarations on body', warnings.filter((w) => w.includes('html or body')).length, 1);
check('a skipped group names the first selector it dropped', warnings.some((w) => w.includes('`.card > .nested`')), true);

// --- the module a `.css` file becomes ---------------------------------------
const warnings_from_compile: string[] = [];
const code = compile_css(FIXTURE, (message) => warnings_from_compile.push(message));

check('it registers a global sheet under the file path', code.includes(`$g(${JSON.stringify(FIXTURE)}`), true);
check('it applies the :root tokens', /\$v\(\{"space":"8px"/.test(code), true);
check('it defines a palette per mode', code.includes('$p("dark"'), true);
check('@import is inlined, since GPUI has no runtime for it', code.includes('"classes":["tag"]'), true);
check('the module names the renderer once', code.match(/from "@fractaldesign\/gpuix-fractalsvelte\/renderer"/g)?.length, 1);

// --- what a window makes of it ----------------------------------------------
// The import is what a component's own `import './stylesheet.css'` does in an app.
await import('./stylesheet.css');

use_palette('light');
const Stylesheet = (await import('./Stylesheet.svelte')).default;
mount_headless(Stylesheet, { width: 400, height: 300 });

const style_of = (id: string) => find_test_id(id)?.style ?? {};

check(
	'a class rule lands, its logical padding resolved to both sides',
	[style_of('card').paddingLeft, style_of('card').paddingRight, style_of('card').paddingTop],
	[8, 8, null]
);
check('border shorthand splits into GPUI fields', [style_of('card').borderWidth, style_of('card').borderStyle, style_of('card').borderColor], [1, 'solid', '#00ff00']);
check('a token-supplied colour arrives, not the var()', [style_of('card').backgroundColor, style_of('card').color], ['#ffffff', '#111111']);
check(':hover is the native hover style', style_of('card').hover?.borderColor, '#00ff00');
check(':focus-visible is the native focus style', style_of('card').focusVisible?.outlineWidth, 2);
check(':where() applies to the class it wraps', [style_of('carded').paddingTop, style_of('carded').paddingBottom], [4, 4]);
check('a tag rule matches an element with no class at all', style_of('tagged').color, '#00ff00');
check('a unitless line-height is a multiple of the rule font size', [style_of('ratio').fontSize, style_of('ratio').lineHeight], [20, 30]);
check('flex shorthand becomes the three fields', [style_of('flexy').flexGrow, style_of('flexy').flexShrink, style_of('flexy').flexBasis], [1, 1, 0]);
check('min-block-size lands on min-height', style_of('rowy').minHeight, 10);
check('an @media block registers nothing', style_of('wide').color ?? null, null);
check('the imported sheet registered too', style_of('imported').backgroundColor, '#00ff00');
check('a component <style> still wins over a global rule of the same weight', style_of('scoped').color, '#0000ff');

use_palette('dark');
settle();
check('a palette switch restyles what reads a token', [style_of('card').backgroundColor, style_of('card').color], ['#101010', '#eeeeee']);
check('and leaves the rest alone', style_of('card').borderColor, '#00ff00');

finish('stylesheet', 32);

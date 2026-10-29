---
title: Automatic Fractalstyler Integration
description: make fractalstyler classes and tokens active for every scaffolded gpuix-fractalsvelte app without app-level setup
---

## Requirement

From `AGENTS.md`:

> What does "incorporating" mean?
> It means that the gpuix-fractalsvelte package must be edited such, that when other projects use `npm create gpuix-fractalsvelte` and install it, fractalstyler classes and tokens recognition must be activated in their projects.
> They should not need to set up cssvars or other functions/tooling themselves.
> There is no difference between gpuix-svelte and gpuix-fractalsvelte otherwise!

This is a package responsibility, not a starter-local utility.

## Why `gpui-dom` Was Not Needed

The deleted experiment used `gpui-dom.registerCSS` because it replaced the custom renderer with a fake DOM.

With the custom renderer, the equivalent API already exists:

- `define_styles(key, ClassRule[])` registers class rules.
- `set_css_vars(tokens)` installs the active token map.
- `renderer.ts` matches elements against those class rules.

The missing piece was only the conversion pipeline:

```text
fractalstyler Sass
  → compiled CSS
  → ClassRule[]
  → define_styles under each class key

fractalstyler tokens
  → flattened px maps
  → set_css_vars(current mode)
```

## Implementation

Added under `src/fractalstyler/`:

- `css/ast.ts`, `css/parse.ts` — CSS syntax parser
- `tokens.ts` — token collection, nested `var()` substitution, `rem`/`calc`/`clamp` reduction
- `gpui-css.ts` — CSS rules to renderer `ClassRule[]`, with GPUI-compatible declarations
- `fractalstyler.ts` — compiles the Sass shipped by `@fractaldesign/fractalstyler`
- `auto.ts` — builds, registers, and installs the default token mode

Added dependencies:

```json
"@fractaldesign/fractalstyler": "^1.4.0",
"sass": "^1.106.1"
```

### Automatic activation

`src/index.ts` now imports `./fractalstyler/auto.ts` first.

That runs before any app code calls `render_hot` or `render`:

1. compile `@fractaldesign/fractalstyler/styles`
2. collect token blocks, including tokens nested inside `@layer`
3. flatten `rem`, `calc()`, `clamp()`, and nested `var()`
4. translate fractalstyler CSS to `ClassRule[]`
5. register the complete rule list under every class key with `define_styles`
6. install the default mode with `set_css_vars`

The default mode is `dark`; `GPUIX_THEME=light` selects light. Optional exports are available for apps that want to switch mode later:

```ts
import { set_fractalstyler_mode } from 'gpuix-fractalsvelte';
```

No app has to call `load_styles`, `define_styles`, or `set_css_vars`.

### Starter

`starter/App.svelte` now uses only fractalstyler classes for layout, surfaces, text, spacing, radius, and color:

```svelte
<div class="box xcenter ycenter gap-md pad-xl bg-surface text-primary wfull hfull">
```

The starter has no fractalstyler Sass, no theme setup, and no `gpui-dom`.

## Token Handling

Fractalstyler tokens use kebab-case names, which is what the renderer's `var()` resolver expects:

```css
background: var(--bg-surface)
```

The loader keeps them as kebab-case and passes them directly to `set_css_vars`.

`clamp()` values are resolved to their upper bound because GPUI has no viewport units. This makes classes such as `.text-5xl` produce a real `fontSize` instead of being dropped.

## Verification

- `npm run typecheck` → 0 errors, 0 warnings.
- Headless style fixture:
  - `.bg-surface` resolved to the dark `bgSurface` colour.
  - `.text-5xl` resolved to `68.664px`.
  - `.gap-md` resolved to `12px`.
  - `.weight-700` resolved to `700`.
- Starter test copy with a local package dependency:
  - `npm start` → `created native window`, `mount complete`
  - `npm test` → `starter ok`
  - `npm run typecheck` → 0 errors, 0 warnings
- Package `test/smoke.ts` still passes.
- Added `test/fractalstyler.ts` and `test/fixtures/fractalstyler/App.svelte`; it passes with no app setup.

## Validation Script

Added a standalone inventory command:

```bash
npm run styles:report
```

In a package install:

```bash
npx gpuix-fractalsvelte-styles
npx gpuix-fractalsvelte-styles --json
```

It prints:

- source directory and compile mode (fractalstyler `src/lib/styles` when present, otherwise the published `dist/styles`)
- token counts per mode
- every light and dark token
- every activated class name
- rule/loss/warning counts

The implementation is `src/fractalstyler/report.ts`; the bin is `bin/gpuix-fractalsvelte-styles.js`. It does not open a window or need a native renderer. It is also exported as `gpuix-fractalsvelte/fractalstyler`.

Verified locally against fractalstyler's source: 132 light tokens, 133 dark tokens, 343 classes, 476 rules.

## Remaining

- Decide whether the package should watch fractalstyler Sass for hot style reload, or rely on a restart after dependency updates.
- `README.md` and `CLAUDE.md` still describe the pre-integration setup.

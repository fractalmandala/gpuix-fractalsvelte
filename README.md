# gpuix-fractalsvelte

Gpuix-Fractalsvelte is a personal fork of [GPUIX Svelte](https://github.com/khromov/gpuix-svelte), for local development and experimentation. The objective is to find enhancements to GPUIX Svelte for CSS and Svelte components, and customize them to my specific uses and conventions. 

This is a **very experimental** build that I break often and use to learn and play. Please use the original [GPUIX Svelte](https://github.com/khromov/gpuix-svelte).

A complete roundtrip experiment was conducted by using the current version of Svelte 5, instead of the unreleased custom renderer API. Was able to make it work, but it's actually not worth it, the costs outweighing any benefit. Still, the full log of this can be traced in the `devlogs` folder, particularly:
[regular svelte vs custom rendered](docs/devlogs/regular-svelte-vs-custom-renderer.md)


## Docs

- [Overview](docs/package/01overview.md): what the package is, setup, how it differs from Svelte on the web, TypeScript config
- [Styling](docs/package/02styling.md): every CSS property and value GPUI accepts, what is dropped, theming with var() and set_css_vars
- [Components](docs/package/03components.md): Scroller (scrollbars, virtual lists), Portal (modals, menus, toasts), Tooltip, Popover and the native <anchored> they build on
- [Guide](docs/package/04guide.md): forms and inputs, keyboard shortcuts and focus, window and desktop helpers, state that survives hot reload
- [Testing](docs/package/06testing.md): headless tests through gpuix-svelte/test: mount, click, type, read back, screenshot; gpuix-svelte/automation drives a running window
- [Shipping](docs/package/05shipping.md): standalone binaries with Bun, macOS signing, running in a browser on WebGPU

> [!WARNING]
> **Experimental.** gpuix-fractalsvelte is built on Svelte's unreleased
> [custom renderer API](https://github.com/sveltejs/svelte/pull/18511), so every release ships the
> exact Svelte build it was tested against. Expect breaking changes between minor versions.

## Quick start

```bash
npm create gpuix-fractalsvelte@latest my-app
cd my-app
npm install
npm start
```

A counter opens in its own window. Edit `App.svelte`, save, and the window hot-reloads.

You need **Node.js 24 or later** or **Bun 1.4 or later**, on macOS (Apple Silicon), Windows (x64)
or Linux (x64). The GPUI binary comes prebuilt from npm, so `npm install` is all the setup there
is. On Bun, run `bun create gpuix-fractalsvelte my-app`, then `cd my-app`, `bun install` and
`bun run start`. Building a standalone executable (`npm run build`) needs [Bun](https://bun.com)
whichever runtime you develop on.

## What it looks like

```svelte
<!-- App.svelte -->
<script lang="ts">
  let count = $state(0);
</script>

<div class="app">
  <text class="count">{count}</text>
  <div class="btn" onclick={() => count++}>Add one</div>
</div>

<style>
  .app { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 32px;
         width: 100%; height: 100%; background-color: #1e1e2e; }
  .count { font-size: 48px; color: #cdd6f4; }
  .btn { padding: 12px 24px; border-radius: 8px; background-color: #313244; color: #cdd6f4; }
  .btn:hover { background-color: #45475a; }
</style>
```

```ts
// app.ts
import { render_hot } from 'gpuix-fractalsvelte';

render_hot(new URL('./App.svelte', import.meta.url), { title: 'My app', width: 640, height: 480 });
```

```bash
npx gpuix-fractalsvelte app.ts          # Node
npx gpuix-fractalsvelte --bun app.ts    # Bun
```

Runes, snippets, `{#each}`, `{#if}`, `{#await}`, `<svelte:boundary>` and `.svelte.ts` state modules
all work as you'd expect. Scoped `<style>` blocks work too, for class rules (the
[styling page](docs/styling.md) has the details). GPUI paints the window on the GPU, and your app
runs inside Node or Bun, so it can read files, spawn processes, open SQLite databases and load
native addons directly.

## Coming from Svelte on the web

- **Elements are GPUI's**: `div`, `text`, `img`, `svg`, `input`, `textarea`, `code`, `markdown`,
  `virtual-list`, `anchored` and a few more. Any other tag renders as a `div`, with a one-time
  warning. `<img src>` takes a file path, a `data:` URL or an http(s) URL.
- **Styling is CSS, laid out with flexbox.** Lengths are `px` or `rem` (16 px), and sizes
  (`width`, `height`, `min-*`, `max-*`) also take `%` and `auto`. `<style>` blocks take class rules
  with `:hover` and `:active`. Values GPUI can't use are dropped with a warning.
  → [docs/styling.md](docs/styling.md)
- **Theming** is `var(--token)` in your styles plus one `set_css_vars({ token: '#fff' })` call.
  → [docs/styling.md#theming-with-css-variables](docs/styling.md#theming-with-css-variables)
- **Mouse events go to the element under the pointer.** Put `hitbox="self"` on a clickable
  element and clicks on its icons and badges reach it. `onclick` is the primary button; right and
  middle clicks are `onauxclick`.
  → [docs/styling.md#what-works-and-what-does-not](docs/styling.md#what-works-and-what-does-not)
- **Inputs report through events**, with the value on the event:
  `<input value={text} onchange={(e) => (text = e.value)} />`. There is no `bind:`, and
  `{@attach}` hands you the element. → [docs/guide.md](docs/guide.md)
- **Keyboard shortcuts** go through `on_window_key('keydown', handler)`, which hears every key
  whatever has focus. → [docs/guide.md](docs/guide.md#keyboard-shortcuts-and-focus)
- **`Scroller`, `Portal`, `Tooltip` and `Popover` ship with the package**: a scroll column with a
  drawn scrollbar (virtualised on request), a wrapper that paints modals, menus and toasts on top
  from anywhere in the tree, and a hover tip and a controlled panel that hang beside their
  trigger. → [docs/components.md](docs/components.md)
- **Window and desktop APIs** cover the title, fullscreen, the file picker, file drops, images
  from raw pixels, focus and accessibility attributes.
  → [docs/guide.md](docs/guide.md#window-and-desktop-helpers)

## Documentation

| | |
|---|---|
| [Styling](docs/styling.md) | Every CSS property and value GPUI understands, what is dropped, theming with variables |
| [Components](docs/components.md) | `Scroller` (incl. virtualised lists), `Portal`, `Tooltip`, `Popover`, and the native `<anchored>` they build on |
| [Guide](docs/guide.md) | Forms, text search, keyboard and focus, reactive window size, window and desktop helpers, state that survives hot reload |
| [Testing](docs/testing.md) | Headless tests that click through GPUI's real hit testing, screenshots, and driving a running window |
| [Shipping](docs/shipping.md) | Standalone binaries, signed macOS apps, and running in a browser via WebGPU |

For real code, the [examples](examples) are the best reference (see [Examples](#examples)).

## Adding it to an existing project

```bash
npm install gpuix-fractalsvelte
```

`gpuix-fractalsvelte` brings its own Svelte, so it's the only runtime dependency you add (see [About the
Svelte version](#about-the-svelte-version)). Run your entry through the package's bin, usually from
`package.json`:

```json
{
  "type": "module",
  "scripts": {
    "start": "gpuix-fractalsvelte app.ts",
    "test": "gpuix-fractalsvelte test.ts"
  }
}
```

The bin starts Node, or Bun when you pass `--bun` or launch it with `bun run`. Before your entry
loads, it points `svelte` at the build with the custom renderer API and teaches the runtime to
import `.svelte` files. Your `.ts` files need nothing extra: Node and Bun run TypeScript
themselves.

Runtime flags go before the entry, and a flag that takes a value needs the `=` form
(`gpuix-fractalsvelte --experimental-ffi app.ts`, `gpuix-fractalsvelte --import=tsx app.ts`). Arguments after
the entry go to your script. Spelled out, the bin runs:

```bash
node --conditions custom-renderer --conditions development --import gpuix-fractalsvelte/register app.ts
bun  --conditions custom-renderer --conditions development --preload gpuix-fractalsvelte/plugin app.ts
```

On Bun, `preload = ["gpuix-fractalsvelte/plugin"]` in a `bunfig.toml` does the job of `--preload` for
ad-hoc `bun file.ts` runs.

### TypeScript

The package ships type declarations. Your `tsconfig.json` needs a `paths` entry that points at the
Svelte build nested inside the package. For the editor and `svelte-check` to type your markup as
GPUI elements, it also needs the `gpuixHTML` namespace:

```jsonc
{
  "compilerOptions": {
    "module": "nodenext",
    "strict": true,
    "noEmit": true,
    "allowImportingTsExtensions": true,
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true,
    "customConditions": ["custom-renderer", "development"],
    "types": ["node", "gpuix-fractalsvelte/html"],
    "skipLibCheck": true,
    "paths": {
      "svelte": ["./node_modules/gpuix-fractalsvelte/node_modules/svelte"],
      "svelte/*": ["./node_modules/gpuix-fractalsvelte/node_modules/svelte/*"]
    }
  },
  "svelteOptions": { "namespace": "gpuixHTML" }
}
```

You'll also want a `*.svelte` module declaration and a `svelte.config.js` that turns off Svelte's
DOM accessibility advice. [`starter/`](starter) has all three, ready to copy.

Node and Bun run TypeScript by stripping the types, which rules out a few constructs: enums,
namespaces, parameter properties, a type imported without `import type`, and a relative import
without a file extension. This config makes `tsc` flag them before Node does. If your app needs
that syntax anyway, install tsx and load it through the bin: `gpuix-fractalsvelte --import=tsx app.ts`.

Event handlers take a `GpuixEvent` and `{@attach}` gets a `ShadowNode`. Both are exported as types:

```svelte
<script lang="ts">
  import type { GpuixEvent, ShadowNode } from 'gpuix-fractalsvelte';
</script>
```

## Building

**Building standalone executables requires Bun** (>= 1.4), even in a project that uses npm and Node.

`npm run build` runs `build.ts`, which compiles `standalone.ts` with Bun into a single executable
(about 95 MB) that carries the Bun runtime, Svelte and the GPUI addon.

- The executable is for the platform it was built on: macOS arm64, Windows x64 or Linux x64, the
  three GPUI ships prebuilt. To release for all three, run `npm run build` on each, for example in a
  GitHub Actions matrix over `macos-latest`, `windows-latest` and `ubuntu-latest`.
- `standalone.ts` mounts `App.svelte` with `render` and a static import, since a binary has no
  source files to hot-reload. Keep its window options in step with `app.ts`.
- macOS keeps a downloaded, unsigned executable from opening until it is allowed under System
  Settings → Privacy & Security. Signing, notarizing and wrapping it as a `.app` are covered on the
  Shipping page of the docs.

## Writing components

- Elements are GPUI's: `div`, `text`, `img`, `svg`, `input`, `textarea`, `code`, `markdown`,
  `virtual-list`, `anchored`. `<img src>` takes a file path, a `data:` URL or an http(s) URL, plus
  a width and a height.
- Style with `<style>` class rules (`.btn`, `.btn.primary`, `.btn:hover`, `.btn:active`) and inline
  `style=`. Layout is flexbox in logical pixels: lengths in `px` or `rem` (16 px), and `%`/`auto` for `width`,
  `height`, `min-*` and `max-*`. Use `flex-grow: 1` for `flex: 1`, and `border-width` plus
  `border-color` for `border`. The styling page lists every property.
- Colours go in `var(--token)`, with the palette set once from the root through
  `set_css_vars({ token: '#fff' })`.
- Inputs report through events: `<input value={text} onchange={(e) => (text = e.value)} />`.
  `{@attach (node) => ...}` hands you an element.
- A click goes to the element under the pointer. Put `hitbox="self"` on a clickable element whose
  children paint a background, and it receives their clicks. `onclick` is the primary button; right
  and middle clicks are `onauxclick`.
- App-wide keyboard shortcuts: `on_window_key('keydown', handler)` from `gpuix-fractalsvelte`, returned
  from an `$effect` so it unsubscribes.
- Scrolling content goes in `Scroller` (`gpuix-fractalsvelte/components/Scroller.svelte`), which draws the
  scrollbar; modals, menus and toasts go in `Portal` (`gpuix-fractalsvelte/components/Portal.svelte`),
  which paints on top; hover tips and dropdowns that sit beside a trigger go in `Tooltip` and
  `Popover` from the same directory.
- State that should survive a hot reload goes in a `.svelte.ts` module; editing one needs a restart.
- Handlers take `GpuixEvent` and `{@attach}` gets a `ShadowNode`, both importable as types from
  `gpuix-fractalsvelte`.

## Examples

Every example under [`examples/`](examples/) is an ordinary app: its `.svelte` components and a
`main.ts` that calls `render_hot`, so any of them drops into a project made with
`npm create gpuix-fractalsvelte`. The scripts below run them in a clone of the repository (`bun install`,
then the command):

| | |
|---|---|
| `npm run demo:counter` | The counter, hot-reloading on save |
| `npm run demo:tictactoe` | Tic-tac-toe with score tracking |
| `npm run demo:hn` | Hacker News reader: live network data in a scrolling list |
| `npm run demo:glass` | A translucent control center over macOS vibrancy (`demo:glass-ffi`: real Liquid Glass via FFI, macOS 26+) |
| `npm run demo:styling` | Which CSS reaches GPUI and which is dropped, side by side |
| `npm run demo:desktop` | Window controls, file picker and drops, live image pixels, selection, focus, accessibility |
| `npm run demo:web` | Tic-tac-toe in a browser on GPUI's WebAssembly build (Bun) |
| `npm run tutorial` | A 12-step interactive guide to the renderer, itself a gpuix-svelte app |

Each of these, apart from `demo:web` (which always runs on Bun), has a Bun twin under a `bun:`
prefix, such as `npm run bun:demo:counter`.

## About the Svelte version

Custom renderers live on an open Svelte pull request that moves on its own schedule. So each
release of this package **bundles** the exact build of that pull request it was tested against,
inside `node_modules/gpuix-fractalsvelte/node_modules/svelte`, and every `svelte` import, yours included,
resolves to that copy.

In practice:

- `gpuix-fractalsvelte` is your one dependency, and the Svelte you import is the one it brings. Keep
  `svelte` itself out of your `package.json`.
- Upgrading `gpuix-fractalsvelte` can move the Svelte build underneath you, so read the changelog before
  a minor bump.
- `svelte-check` installs the registry's Svelte as its own peer dependency and uses it to read your
  components. The `paths` entry in your tsconfig points type imports at the bundled build.

## Good to know

- Scrollbars come from `Scroller`. Context menus are drawn by the app: a `Popover` with
  `position`, or a `<Portal>`, placed at the `onauxclick` coordinates.
- `left`, `top`, `right` and `bottom` take pixels only. A progress bar's fill sizes with
  `width: 50%`.
- `<svg>` inherits `color` from its nearest ancestor, but not that ancestor's `:hover` colour, so
  put hover colours on the `<svg>` itself.
- Headless tests run on macOS and Windows.
- Standalone binaries and web bundles are built with Bun, from a script modelled on the
  repository's. See [docs/shipping.md](docs/shipping.md).

## How it works

Svelte's custom renderer API hands the renderer DOM-shaped operations: create an element, insert
it before an anchor, set an attribute, add a comment node. GPUI's tree is flat, keyed by numeric
id, and holds elements and text. gpuix-svelte keeps a lightweight shadow tree in JavaScript and
projects it onto GPUI. Only elements and non-blank text get native nodes, and they're created
lazily, once they're attached to the window. Every change in a frame is queued and shipped as one
batch, which Rust applies before the next paint.

Around that sit a `.svelte` loader for Node and one for Bun, which compile components with the
renderer baked in and turn `<style>` blocks into class rules, a translator from CSS to GPUI
styles that expands shorthands and drops what GPUI would reject, a ~125 fps frame loop, and
in-process hot reload. The full design notes are in [CLAUDE.md](CLAUDE.md).

## Commands

Everything goes through the package scripts, and those go through `bin/gpuix-fractalsvelte.js`
(`node bin/gpuix-fractalsvelte.js [--bun] [runtime flags] <entry> [args]`, published as the `gpuix-fractalsvelte`
bin). It runs `node --conditions custom-renderer --conditions development --import
gpuix-fractalsvelte/register <entry>` — the conditions are **mandatory**, without them `svelte`
resolves to its server build and `mount()` does not exist; the `--import` installs the `.svelte`
loader, resolved through the package's own `exports` (so `src/register.ts` here and
`lib/register.js` once packed), and Node strips the types of every `.ts` itself — or, under
`--bun` / when invoked by Bun, `bun` with the same conditions and `--preload gpuix-fractalsvelte/plugin`.
Flags before the entry are forwarded to the runtime (`demo:glass-ffi` passes `--experimental-ffi`
that way).

```bash
bun install                # entire setup (bun.lock is the lockfile); @gpuix/native ships prebuilt
npm run typecheck          # tsc --noEmit + svelte-check --fail-on-warnings; the first step of `test`
npm run lint               # eslint . (eslint.config.js); NOT part of `test` — only CI's linux job
                           # runs it, so run it before pushing
npm run demo               # counter, tic-tac-toe, hacker-news and liquid-glass at once
                           # (scripts/demo-all.ts — cmd.exe has no `&` ... `wait`)
npm run demo:counter       # counter (hot-reloads on save)
npm run demo:tictactoe
npm run demo:hn            # Hacker News reader — live network data, scrolling
npm run demo:glass         # transparent window, macOS vibrancy (GPUI window blur)
npm run demo:glass-ffi     # same app on real Liquid Glass (NSGlassEffectView, macOS 26+)
                           # via a clang-compiled ObjC shim + FFI (node:ffi/bun:ffi) in
                           # examples/liquid-glass-ffi/glass.ts; GPUIX_GLASS=0 forces the
                           # window-blur fallback
npm run demo:styling       # styling playground: style strings next to what GPUI made of them
                           # (reads like CSS / looks like CSS but is not / GPUI-only)
npm run demo:desktop       # desktop APIs (examples/desktop-apis): window controls, prompt_for_paths,
                           # onfiledrop, set_image/set_image_pixels (a live waveform), selection,
                           # scroll_into_view, focus walking, aria props
npm run demo:web           # tic-tac-toe in a browser, on GPUI's wasm/WebGPU build — bundles it to
                           # dist/web and serves it at http://localhost:4173 (PORT overrides).
                           # --production for the minified/production-Svelte bundle, --build-only
                           # to skip serving. BUN ONLY. See "Rendering to the web"
npm run tutorial           # interactive onboarding guide (examples/tutorial): 12 steps, each an
                           # explanation + diagram beside highlighted source and the same component
                           # running live, with a quiz. Prose is examples/tutorial/content/*.md, the
                           # registry is steps.ts, samples/ hot-reload; GPUIX_TUTORIAL_STEP=7 starts
                           # at step 7. The only user of GPUI's <code>/<markdown> elements

npm test                   # typecheck, then every test:* below except automation-live and coverage
npm run test:reorder       # keyed {#each} reordering
npm run test:smoke         # mount + click Counter headlessly
npm run test:autocommit    # the microtask drain used where there is no frame loop
npm run test:style         # CSS shorthand expansion, and what must never reach serde
npm run test:teardown      # removal marks dirty, blank text demotes, listeners survive
npm run test:lifecycle     # throws don't kill the frame loop; remount is one batch
npm run test:compile       # the ?v=N cache-buster reaches every child specifier
npm run test:css           # <style> class rules: specificity, inline wins, :hover, class: toggles
npm run test:module        # a .svelte.ts runes module compiles and is one shared instance
npm run test:vars          # var() in class rules and inline styles, set_css_vars restyles in one
                           # batch, an undefined var warns at commit rather than where it was read
npm run test:scroller      # the shipped Scroller: wheel, thumb drag, follow, scroll={false}, virtual
npm run test:hitbox        # hitbox="self" shielding through real hit testing, <svg> colour inheritance
npm run test:auxclick      # a right click is onauxclick, ctrl+click is not
npm run test:window-keys   # on_window_key, the editing flag, remount survival
npm run test:window        # window_size / window_insets: polled only while read, restarted on remount
npm run test:portal        # <Portal> paints on top, tears down with its {#if}, orders by mount
npm run test:host          # aria props in GPUI's a11y tree, file drop, motionComplete,
                           # on_selection_change, focus walk, scroll_into_view, image uploads
                           # (including one from an {@attach}, before the element exists)
npm run test:overlay       # the debug frame overlay wrappers, and how render() picks between
                           # GPUIX_FPS and the debugFrameOverlay option across remounts
npm run test:helpers       # every gpuix-fractalsvelte/test input helper through real hit testing
npm run test:search        # TextSearch: native match count, next/prev wrap, flags, find_ranges
npm run test:tooltip       # native <anchored> placement and its center quirk; Tooltip hover
                           # (delay, grace, jumping onto the tip, spread handlers); Popover dismissal
npm run test:automation    # gpuix-fractalsvelte/automation's Locator over test_app(), and the live
                           # server's two-frame reply against a stub frame loop
npm run test:automation-live  # opens a window: launch()es the counter, clicks + three times, waits
                           # for "3 clicks", screenshots, close()s; NOT part of `npm test`
npm run test:coverage      # optional; needs SVELTE_SAMPLES_DIR (see "Testing")
npm run check:svelte       # every .svelte / .svelte.ts past the Svelte MCP server's
                           # svelte-autofixer (scripts/svelte-mcp.ts, the .mcp.json endpoint):
                           # `-- <file|dir>` checks just that one, --a11y unhides the a11y
                           # warnings and --all every filtered class, --json, --jobs N, --url.
                           # Exits 1 on issues, never on suggestions. Needs the network
npm run docs               # README.md + docs/*.md → static HTML in dist/docs via marked
                           # (scripts/docs.ts; links to other repo files go to GitHub), plus a
                           # markdown copy of each page with absolute links, llms.txt indexing
                           # them and llms-full.txt — starter/AGENTS.md points agents there;
                           # homepage/ is copied to the root, so README becomes overview.html;
                           # .github/workflows/docs.yml deploys it to GitHub Pages on push.
                           # A new docs page also needs an entry in scripts/docs.ts's PAGES
npm run docs:serve         # the same build, then serves dist/docs at http://127.0.0.1:4321
                           # (PORT overrides) and opens it in the browser (-- --no-open skips
                           # that); rebuilds on any change to README.md, docs/, homepage/ or
                           # scripts/docs.ts by restarting a child that builds and serves
npm run og                 # retakes homepage/og.png: headless Chrome over CDP (scripts/og.ts,
                           # $CHROME overrides the path) on index.html#og at 1200x630, device
                           # scale 2. og:docs does docs/assets/og-docs.png from the built overview.
                           # Rerun after changing the hero; keep og:image:alt in step
npm run vendor             # re-vendor svelte: downloads pkg.svelte.dev's build of the PR
                           # head; see "Hard constraints"
npm run parity             # the @gpuix/native methods nothing in src/ calls (--all: every method,
                           # the classes that have it, its callers) plus a GPUI_EVENTS diff
                           # against upstream's EVENT_PROPS; run it after a native bump
npm run pack -- <dir>      # the npm tarball, with svelte bundled, the published spec and
                           # JS + declarations in lib/ — scripts/publish.ts wraps `npm pack`;
                           # `publish:npm` wraps `npm publish` the same way (release workflow)
npm run consume            # the consumer path: pack, scaffold an app under $TMPDIR with
                           # packages/create-gpuix-fractalsvelte, install the tarball into it, run the
                           # starter's `typecheck` (tsc + svelte-check) and its headless test
                           # through the installed bin; fails if a non-declaration `.ts` ships or
                           # tsx lands in the consumer. bun:consume installs and runs with Bun and
                           # also builds the starter's binary (size-checked, so a binary without
                           # the addon fails); consume:open / bun:consume:open open the window
npm run compile            # tic-tac-toe → dist/tictactoe (.exe on Windows) via Bun.build({ compile });
                           # it refuses to run under Node
npm run compile:app        # same, plus a dist/Tic-tac-toe.app wrapper with its icon (macOS only)
```

Every script that goes through the bin has a `bun:`-prefixed twin (`npm run bun:test`,
`npm run bun:demo:counter`, ...) running the same entry through Bun (`node bin/gpuix-fractalsvelte.js
--bun ...`), which takes the loader as a `--preload` rather than an `--import`; `bunfig.toml`
carries the same preload for ad-hoc `bun file.ts` runs. Deps come from `bun install` either way,
but scripts run through `npm run`, Node twins and `bun:` twins alike: the bin picks its runtime
from `--bun` or the launching package manager's `npm_config_user_agent`, so `bun run test` would
run the Node suite on Bun. Adding a bin script means adding both halves and, for a test, chaining
both into `test` / `bun:test`. `compile`, `compile:app` and `demo:web` are Bun-only, `bun:typecheck`
is an alias, `demo` and `consume` take `--bun` for their twins, and the remaining tooling
(`lint`, `check:svelte`, `docs`, `vendor`, `parity`, `pack`, `publish:npm`) has none. Repo-local
scripts that need no loader run on plain `node`, which strips their types itself.

### Driving a running app

`docs/testing.md` covers the API. `gpuix-fractalsvelte/automation` (`src/automation.ts`) re-exports
`@gpuix/native/automation`'s `App` / `Locator` / `AutomationError` rather than porting them.
`launch({ entry, bun?, args?, cwd?, env? })` spawns `process.execPath bin/gpuix-fractalsvelte.js entry`
with `GPUIX_AUTOMATION=1` and stderr inherited (upstream's own `launch` pipes stderr and never
drains it, and its `close()` SIGTERMs), connects with upstream's `connectStdio`, and its `close()`
ends the app's stdin. `test_app()` is the same `App` over `TestGpuixRenderer`, through
`headless_renderer()`, upstream's `TestAutomationRenderer` written with test.ts's simulate → drain
→ settle discipline; its reads settle first, so `waitFor` sees a timer's update.

`GPUIX_AUTOMATION=1` (`0` or empty is off) is deliberately explicit, not upstream
`createNativeRenderer`'s stdin-is-not-a-TTY sniffing: stdin is not a TTY under CI, `nohup`, an
agent's shell or `demo-all.ts`'s four children, and the env var is what lets stdin ending mean
"exit". Under it `render()` rebinds `console.log`/`info`/`debug` to stderr before creating the
window (stdout is the wire, and a write without a trailing newline would swallow the next frame)
and imports `src/automation-server.ts` through a computed specifier, so neither the web bundle nor
the normal app path loads it, and a compiled binary cannot serve. The server is started where the
window is created, so `render_hot` remounts reuse it. It owns its stdio loop (upstream's
`createSseDecoder` + `handleAutomationRequest`) to answer an unparseable request that has an id
with a `Protocol` error (upstream drops it, and the driver waits forever) and to answer what is in
flight before stdin's end exits the process. Upstream's `liveRendererAsTest` ticks synchronously
after each input, which is not enough here — the napi callback carrying the event runs on a later
loop turn, so a `getTree` right after a `click` could miss a just-shown `{#if}` node. So the
server hides `tick` from it and wraps the backend (`frame_synced`): requests run one at a time and
every input replies only after two of the frame loop's own ticks (`next_frame()` in `render.ts`);
reads and `screenshot` do not wait.

### Measuring frame cost

Scroll lag here is native per-frame layout, not JS, so measure before reasoning. Both
`GpuixRenderer` and `TestGpuixRenderer` expose GPUI's own draw times, wrapped in `src/window.ts`
as `set_debug_overlay(mode)`, `cycle_debug_overlay()`, `debug_overlay()`,
`reset_debug_overlay_stats()` and `debug_overlay_stats()` (cur/p90/p99/max draw ms and a frame
count, recorded even while the overlay is hidden). A headless bench of one component is those calls
and `wheel()` from `gpuix-fractalsvelte/test` around `mount_headless` (from outside the repo it needs a
`node_modules` of symlinks, `svelte` and `gpuix-fractalsvelte` → the repo, and a `{"type":"module"}`
package.json). Substrate's `scripts/frame-cost.ts` (`bun run frames` in
`../substrate-gpuix-fractalsvelte`) is the worked example over a real window: it boots the app against a
`VACUUM INTO` copy of its data and prints idle and while-scrolling draw times per route; its
AGENTS.md keeps the baselines.

## Shipping

### Standalone binary

User-facing steps, including signing and notarization (`CODESIGN_IDENTITY`, `NOTARY_PROFILE`), are
in `docs/shipping.md`. `scripts/compile.ts` is `Bun.build({ compile })` over
`examples/tic-tac-toe/standalone.ts`, a static-`render()` entry — `render_hot` re-imports from disk
and can't live in a binary, so `main.ts` stays the dev entry. `Bun.build` never sees the
`Bun.plugin` registration from `bunfig.toml`, so the script wires `src/plugin.ts`'s exported hooks
in itself:

- `load_svelte` / `load_module` compile components, and the script counts the components that
  went through them, because without the plugin a `.svelte` import silently becomes a file asset
  while the build still succeeds.
- `resolve_svelte(conditions)` pins `svelte` to the bundled copy under the build's own conditions
  (`custom-renderer` + `production` here, `custom-renderer` + `browser` in `scripts/web.ts`).
  `production` only takes effect together with the `process.env.NODE_ENV` define, because Bun
  implies `development` otherwise and esm-env lists it first.
- `resolve_native_cjs` points `@gpuix/native` at its `index.cjs`: the ESM loader finds the `.node`
  through `createRequire(import.meta.url)`, which `Bun.build` cannot trace, and without the CJS
  entry the binary ships without the addon and dies at launch — the script's size floor catches
  that. Bun embeds only the host's prebuild, so a binary is built on the OS it targets.

`autoloadBunfig` and `autoloadDotenv` are off, so a `bunfig.toml` or `.env` beside the binary can't
reconfigure it. `GPUIX_FRACTALSVELTE_RENDERER` is a build-time variable on this path. The `.app`'s icon is
`examples/tic-tac-toe/icon.png`, rasterized at 1024 px from the `icon.svg` beside it; `--app` cuts it
into an `.icns` with `sips` + `iconutil`.

### Rendering to the web

There is **no DOM renderer** and there never was one to wire up: gpuix's web target is GPUI itself
compiled to `wasm32-unknown-unknown`, painting a WebGPU (WebGL2 fallback) `<canvas>` that the wasm
appends to `<body>` along with a hidden IME `<textarea>`. Nothing produces DOM nodes. It is the
same element tree, the same `applyBatch` protocol and the same error-first `(err, event)`
callback, so **`renderer.ts`, `style.ts` and `events.ts` are untouched by it** and the pixels match
the desktop app.

`@gpuix/native` ships the build already — `browser.mjs`, `wasm/gpuix-web.js` and a ~20 MB
`wasm/gpuix-web_bg.wasm`. Its `browser` export condition is what `Bun.build({ target: 'browser' })`
picks up, and `browser.mjs` pulls the wasm in with `with { type: 'file' }`, so Bun copies it
beside the bundle and rewrites the URL. That import attribute is why this is **Bun-only**.
`scripts/web.ts` is the whole integration; it reuses `compile.ts`'s plugin pattern and also fails
if no `.wasm` was emitted (`@gpuix/native` did not resolve to its browser entry). The `.` export
of this package is conditional too — `browser` → `src/web.ts` (everything `index.ts` has but
`render_hot`), `default` → `src/index.ts` — and only a browser bundler picks the first.

Two things bite (`docs/shipping.md` has the hosting side):

- **Cross-origin isolation is mandatory.** The wasm links with `--shared-memory`, so it needs
  `SharedArrayBuffer`, which exists only in an isolated document: every response carries
  `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`, and
  `.wasm` must be served as `application/wasm` or `instantiateStreaming` rejects it. `file://`
  cannot work.
- **A browser bundle has no `process`.** Bun does not shim it for `target: 'browser'`, so a bare
  `process.env.X` throws a `ReferenceError` that kills `render()` before it mounts — with GPUI
  itself already up, which makes it look like a renderer bug. Hence the `env()` helper in
  `render.ts`.

The wasm class differs from the napi one: `requiresTick()` is hardcoded `false` (so the frame loop
never starts and `set_auto_commit(true)` carries every commit) and `tick()` is a no-op;
`init(options)` **ignores** its argument, so `title`/`width`/`height` do nothing and the page's CSS
sizes the canvas; and it has no `captureScreenshot`, `activateWindow`, `minimizeWindow`,
`zoomWindow`, `toggleFullscreen`, `simulateKeystrokes`, `simulateKeyDown`/`Up`,
`cycleDebugFrameOverlay`, or `resetDebugFrameOverlayStats`/`getDebugFrameOverlayStats` — so
frame-cost measurement is desktop-only (`set_debug_overlay` still shows the overlay). Like the napi
window it has `getAutomationTree()` but no `getTreeJson()` (that is test-renderer only). Everything
`Scroller` needs (`getElementBounds`, `getScrollOffset`, `getListScrollTop`, `scrollTo`,
`scrollToItem`) is present.

There is no automated test: `gpuix-fractalsvelte/test` is built on `TestGpuixRenderer`, which is napi-only.
Verify by hand with headless Chrome over CDP — `--headless=new --enable-unsafe-swiftshader
--remote-debugging-port=9222`, then navigate and read `Runtime.consoleAPICalled`. Avoid
`--virtual-time-budget`: GPUI never goes idle, so Chrome fast-forwards frames forever and hangs.

## Hard constraints

- **TypeScript sources run as-is; no build step in the repo.** `exports` points straight at
  `src/*.ts`, and Node and Bun both strip the types natively — no tsx, no loader for `.ts`.
  `tsc --noEmit` (strict, `erasableSyntaxOnly`, `verbatimModuleSyntax`, explicit `./x.ts`
  specifiers) covers `types`, `src`, `bin`, `scripts`, `test`, `examples` and `packages`;
  `types/*.d.ts` hold the ambient shims (`*.svelte` modules, `node:ffi`'s missing names). Keep it
  that way: no enums, namespaces or parameter properties, and no `dist/`. The only emit is inside
  the tarball, because Node refuses to strip types under `node_modules`: `scripts/publish.ts` runs
  `tsc -p tsconfig.lib.json` into a gitignored `lib/` (JS with `rewriteRelativeImportExtensions`,
  declarations beside it, plus a copy of `src/html.d.ts`), rewrites the declarations' `./x.ts`
  specifiers to `./x.js`, and for the length of `npm pack`/`npm publish` points `main` and every
  `src/*.ts` export at `lib/*.js` (TypeScript finds each `.d.ts` beside its `.js`, so there are no
  `types` conditions) and ships `lib`, `src/components` and `bin` only. tsc wraps the two computed
  `import()`s in an inlined `__rewriteRelativeImportExtension` helper: `render_hot`'s, where it is
  inert because the specifier is always a `file://` URL, and `render.ts`'s
  `'./automation-server.ts'`, which it rewrites to `.js`. The starter's tsconfig carries
  `erasableSyntaxOnly`, `verbatimModuleSyntax` and `allowImportingTsExtensions`, so an app's `tsc`
  rejects what Node's stripping cannot run. `bin/gpuix-fractalsvelte.js` is plain JS (checked via
  `checkJs`) because it is what starts the runtime (`svelte.config.js` is editor-only and outside
  the tsc program).
- **Markup is only typechecked by svelte-check**, the second half of `typecheck` (tsc never opens a
  `.svelte` file; `--diagnostic-sources js,svelte`, since the CSS source flags GPUI-only properties
  like `selection-color`). tsconfig's `"svelteOptions": { "namespace": "gpuixHTML" }` makes
  svelte-check and the editor type markup against `src/html.d.ts` (GPUI's tags, Svelte-spelled
  attributes, `GpuixEvent` handlers) instead of Svelte's DOM `svelteHTML`; without it every
  `hover=` and `onkeydown` is a DOM type error. Mind three svelte2tsx quirks. It lowercases
  attribute names except `on*`, names on hyphenated tags and the `{shorthand}` form, so
  `html.d.ts` declares `minrows` and `minRows` both. It splits blocks on a literal
  `<style>`/`<script>` even inside a comment or string. And it always loads `lib: dom`, so a `.ts`
  file must also typecheck against DOM's `ReadableStream`/`Blob`. Consumers typechecking against
  the package need `@types/node`, the `paths` to the nested svelte, and for markup
  `"types": ["gpuix-fractalsvelte/html"]` plus the namespace, as README says. svelte-check pulls the
  registry's svelte in as its peer, which lacks `customRenderer`, so the starter's
  `svelte.config.js` sets only the a11y `warningFilter`.
- **Node >= 24** (`engines`; the package needs `module.registerHooks` and `stripTypeScriptTypes`,
  nothing newer — only the glass-ffi demo needs 26.1's experimental `node:ffi`) or **Bun >= 1.4.0**.
  Keep runtime-specific code confined to `register.ts` / `plugin.ts`.
- **Never `bun --hot`.** `render_hot` implements its own in-process reload; `--hot` re-evaluates
  Svelte's runtime, so the old component belongs to a module instance the new one can't see and
  `unmount()` fails.
- **`svelte` is vendored and bundled**: `dependencies.svelte` is
  `file:vendor/svelte-<version>-<sha7>.tgz`, a build of sveltejs/svelte at that commit of the
  custom-renderer PR stack (#18042 → #18405 → #18461 → #18511, whose `custom-condition` branch is
  the tip), and `bundleDependencies` lists it, so the npm tarball carries that build (and its
  transitive deps, ~5 MB unpacked) under `node_modules/svelte` and a consumer never installs
  svelte. It has to be in `dependencies` (npm-packlist skips dev and peer deps when bundling) and
  there is no `peerDependencies` (npm 7+ would auto-install the registry release with the same
  version string, which has no `mount()`). The bundled copy is nested, so both loaders pin every
  `svelte` / `svelte/*` import to it — `register.ts` with a `resolve` hook that swaps `parentURL`
  for its own URL, `plugin.ts` with one `build.module()` virtual module per svelte export (Bun's
  runtime `onResolve` never sees a bare specifier) — and both throw `WRONG_SVELTE` when
  `svelte/renderer` fails to resolve, which is how a non-PR build is caught. The *published*
  manifest cannot carry the `file:` spec: Bun resolves a bundled dep's spec before honouring the
  bundle and fails on `file:vendor/…`, and npm `overrides` cannot diverge from a direct dep
  (`EOVERRIDE`) — so `scripts/publish.ts` rewrites it to `>=5.56.0` for the duration of
  `npm pack` / `npm publish` and restores it in `finally` (not `prepack`/`postpack`:
  `npm publish` re-reads the manifest after `postpack`). `starter/tsconfig.json` shows the `paths`
  a consumer's `tsc` needs to see the nested copy. It can't be a URL pin: pkg.svelte.dev drops a
  build once a force-push removes its commit from the branch, and this PR is rebased on every
  update. `npm run vendor` moves the pin: it looks up the PR head on GitHub, downloads that
  commit's tarball from pkg.svelte.dev (`/svelte/c/<sha>`; it errors if the build isn't up yet),
  swaps the tarball, repoints `package.json` and runs `bun install`. Then run `npm test` and
  `npm run bun:test`. For a commit pkg.svelte.dev no longer has, `pnpm build && pnpm pack` in a
  svelte checkout's `packages/svelte` and drop the tarball in by hand under the same name.
  `.gitignore` un-ignores `vendor/*.tgz` for this; `files` keeps it out of the npm package (the
  bundled `node_modules` copy is what ships). `bun.lock` records the tarball's sha512, so a new
  build is a new lockfile entry.
- **`@gpuix/native` range is `>=0.10.0 <0.11.0`** (pre-1.0, so every minor may break; upstream
  recommends an exact pin for its own adapters) and the renderer speaks its mutation contract:
  applyBatch only — no `removeChild` op (reinserts reparent implicitly; nodes that leave the live
  tree are destroyed at commit and re-materialize if shown again), `setCustomProp` not
  `setCustomPropValue`, and `commitMutations?.()` only where it exists. The package is ESM with an
  `index.cjs` under the `require` condition. Prebuilds exist for darwin-arm64 / linux-x64 /
  win32-x64 only. On Linux `TestGpuixRenderer` is a constructor that throws
  (`hasTestGpuixRenderer()` says so) — gpuix builds it with `--no-default-features` until wgpu grows
  image readback — so CI there can only check that the binding loads. Its `/host`, `/runtime` and
  `/testing` entry points are the framework-neutral layer `@gpuix/react` and `@gpuix/solid` share;
  this renderer takes `/host`'s window observers, text search and types, and `/automation`, but
  keeps its own `render.ts` / `renderer.ts` / `test.ts`, because that layer's event map and
  mutation queue would replace the batching here rather than simplify it. **Moving the range:** read the new tag's `CHANGELOG.md`,
  the `index.d.ts` diff and the Rust (`renderer.rs`, `custom_elements/*.rs`, `style.rs`) at that
  tag; get `npm test` and `npm run bun:test` passing on the new version before anything uses the
  new surface; and in the same change go through `npm run parity`'s output and redo
  `docs/styling.md`'s lists if `style.rs` moved (see "Regenerating the styling reference").

## Architecture

Three layers, `src/`:

```
render.ts    window lifecycle + frame loop  ─┐
renderer.ts  shadow tree → GPUI projection   ├─ style.ts / events.ts are its translation helpers
compile.ts   .svelte → JS, runtime-agnostic  ─┘
  types.ts     ShadowNode, GpuixEvent, GpuiStyle, Mutation, … ─ re-exported as types from `gpuix-fractalsvelte`
  hot.ts       render_hot's fs.watch reload         ─ the only node:* in the mount path
  web.ts       the `browser` condition's entry      ─ everything index.ts has but render_hot
  register.ts  Node loader (module.registerHooks)   ─ the default
  plugin.ts    Bun loader (Bun.plugin) + Bun.build hooks  ─ the `bun:*` scripts, scripts/compile.ts, scripts/web.ts
  test.ts      headless harness over TestGpuixRenderer  ─ `gpuix-fractalsvelte/test`
  automation.ts  upstream's App/Locator, launch(), test_app()  ─ `gpuix-fractalsvelte/automation`
  automation-server.ts  GPUIX_AUTOMATION=1 stdio server  ─ imported lazily by render.ts
  window.ts    window, picker, focus, image, overlay helpers  ─ no-op where native lacks the method; window_size / window_insets poll
  search.ts    TextSearch, find_ranges                  ─ createSubscriber, so no runes in src/
  components/  Scroller, Portal, Tooltip, Popover .svelte  ─ `gpuix-fractalsvelte/components/*`
```

**`compile.ts`** compiles `.svelte` with `runes: true` (legacy `export let` / `$:` never compiles
in legacy mode) and `experimental: { customRenderer }`, which makes the compiler emit
`import $renderer from 'gpuix-fractalsvelte/renderer'` into every component. `GPUIX_FRACTALSVELTE_RENDERER`
overrides that baked specifier — needed for components outside this workspace, since it must
resolve from the `.svelte` file's own location. `async: true` rides along because a
`pending`/`failed` snippet in a `<svelte:boundary>` crashes the compiler without it
(`SvelteBoundary.js` reads through the `renderer_snippet` wrapper; still present in the vendored
build). Reported upstream on #18511; drop the flag once it lands.

It is also where `<style>` blocks go. The compiler refuses `css: 'injected'` under a custom
renderer and hands the scoped CSS back instead, so `compile_svelte` walks the block's AST
(`modernAst: true`) and appends a `define_styles(scope, rules)` call to the component: one rule
per compound selector, keyed by the `svelte-<hash>` scope class the compiler already stamps on
every matched element (`cssHash` captures it). Only classes, one optional tag, and
`:hover`/`:active` are accepted — combinators, `:global`, attribute selectors, at-rules and
nesting are refused with a warning naming the file — and declarations go through
`parse_css_text` at compile time, so the value checks below apply to them too. Rules are
emitted weakest first (tags under classes, then source order), and the renderer's
`class_rules()` picks the ones whose classes the element carries on every `class` change, so
`class:` directives and dynamic class strings restyle for free. `build_style` then lays the
inline `style` on top; `:hover` rules become GPUI's native `hover` object with the `hover=`
attribute winning. A block that reads a `var(--name[, fallback])` is emitted as `css` text
instead of a parsed `style`, because the map it resolves against lives at runtime: `style.ts`
substitutes on every `parse_css_text` (inline `style=` included), memoises each such rule per
`set_css_vars()` generation, and the renderer flags nodes whose style read a variable so
`set_css_vars(vars)` (exported from the package) restyles exactly those, in one batch — a call
whose values are all already in force is a no-op. An undefined variable without a fallback drops
that declaration and is warned about once at the next `commit()`, not where it was read: the root's
palette `$effect` runs after Svelte has styled the tree, so a name it defines is never reported.
Merging also honours shorthands: a later `padding: 20px` clears the longhands an earlier
`padding: 12px 24px` expanded to, since GPUI reads longhands over the shorthand.

The two loaders exist because there is no shared API: Bun has no `module.registerHooks`, and its
`module.register()` is a silent no-op. Both are small wrappers around `compile_svelte()`, and both
must be installed before the entry module resolves — Node via `--import gpuix-fractalsvelte/register`,
Bun via `--preload gpuix-fractalsvelte/plugin` (or `bunfig.toml`'s `preload`), both supplied by
`bin/gpuix-fractalsvelte.js`. Tests rely on that registration rather than importing a loader themselves.
Both also compile `.svelte.ts` runes modules through `compile_module()` (`compileModule` from
`svelte/compiler`, no renderer option) — which does **not** strip types, so the loaders do it
first: `register.ts` hands the URL to `nextLoad` and puts Node's `module-typescript` source through
`stripTypeScriptTypes`, `plugin.ts` runs `Bun.Transpiler`. Those modules are deliberately **not**
cache-busted: a module is one instance per process, so state kept in one survives a hot remount,
and editing one (or any plain `.ts`) needs a restart, which `render_hot` warns about.

**`renderer.ts`** is where the real work is. Svelte's renderer contract is DOM-shaped (fragments,
comments, sibling walking); GPUI's tree is flat, id-based and knows only `div`/`text` plus a few
custom element types. So the renderer keeps a JS shadow tree and *projects* it:

- Elements and non-blank text get a `nativeId`; comments, blank text and fragments never do —
  they are ordering-only. That holds in both directions: text set to `''` at runtime gives its id
  back, or it would keep a slot in GPUI's flex/gap layout.
- Ids are allocated lazily, when a node first becomes reachable from the root (`live`). Svelte
  renders offscreen constantly, and eager creation would leak a Rust node per abandoned render.
- Because virtual nodes are always leaves, "the next native node" is a flat scan of following
  siblings (`first_native_after`) — nothing to descend into.
- `remove()` never destroys: Svelte removes and re-inserts the same node in consecutive statements,
  so nodes go to `pending_destroy` and are reaped in `commit()`. It still has to `mark_dirty()`,
  though — a frame that only removes nodes queues no mutation, so nothing else would tell the frame
  loop (or the auto-commit microtask) that there is anything to ship.
- `next_id` is monotonic across remounts, so a stale tree's ids can't collide with the new one's.
  A remount queues the old root's `destroyElement` after the new `setRoot`, in the same batch.
- Mutations queue as tuples and ship as **one** `applyBatch(json)` per commit, then
  `commitMutations()`. `applyBatch` returns the ids Rust destroyed (whole subtrees), which is how
  the id map learns what to purge. The node's `listeners` map survives that purge, like `attrs`
  does, so `materialize()` can re-emit `setEventListener` if the node ever becomes live again.

**`render.ts`** owns the `GpuixRenderer`, a `globalThis` symbol slot for the window (so remounts
reuse it), and a ~125fps `setTimeout` loop calling `native.tick()` — paced deliberately, since
`setImmediate` burns most of a core at idle. `requiresTick()` is true on every desktop platform —
on Windows/Linux, where GPUI owns a blocking UI thread, `tick()` only reports whether that thread
is still alive — and `tick()` returns false once the last window closes, which ends the loop and
the process. Where `requiresTick()` is false (the wasm build), `set_auto_commit(true)` makes the
renderer schedule its own commit on a microtask instead — otherwise a mutation with no native event
behind it (a resolved `fetch`, a timer) would sit in the queue until the next click. Native events
run `dispatch` → `flushSync()` → `commit()` so the effects' mutations land in the same frame.
`next_frame()` resolves after the loop's next `tick()` (a timer where there is no loop), which is
what the automation server waits on. It reads env through a `globalThis.process?.env` helper and
keeps no `node:*` import, so it bundles for the browser as-is; `render_hot` lives in **`hot.ts`**
for that reason. It watches the entry's directory and re-imports with a `?v=N` cache-buster;
`compile.ts` propagates that query to child `.svelte` specifiers — static, side-effect and dynamic
`import()` alike — or a reload would re-instantiate the root against stale children. It finds them
by parsing the emitted JS with `acorn` (Svelte's own parser, and the one dependency besides
`@gpuix/native` and the bundled svelte) and splicing the query in at each specifier's offset, so a
`.svelte` string inside ordinary code or a comment is left alone and the rest of the output stays
byte-identical. Only relative, absolute and `file:` specifiers are busted: Node refuses a bare one
with a query, and a package component is not what is being edited.

**`style.ts`** — Svelte hands over the `style` attribute as CSS *text*; GPUI wants a camelCase
object with bare-number lengths. `12px` → `12`, while `50%`, `auto` and `#1e1e2e` stay strings. The
raw string is kept on the shadow node because Svelte read-modify-writes it for `style:` directives.
`hover`/`active` are GPUI's native pseudo-styles — nested objects CSS text can't express, so they
arrive as their own attributes and get folded back in.

Unknown *keys* need no allowlist — serde drops them. Unknown **values** are the opposite: a key
GPUI does know, handed a string it can't parse, throws out of `applyBatch`, and that throw loses
the whole frame. So multi-value box shorthands (`padding`, `margin`, `border-width`,
`border-radius`, `gap`, `inset`) expand to the longhands GPUI actually has, and each value is then
checked against the key's Rust type: `NUMBER_ONLY` keys (all the spacing, border and font metrics)
are `f64`, so `1em`, `50%` and `auto` are all fatal there; only `width`/`height`/`min*`/`max*` are
`DimensionValue` and take `%` or `auto`; `boxShadow` is a struct CSS text can never build. Anything
that fails is dropped with a one-time warning per property rather than shipped. `inset` expands
even when it holds a single value, because GPUI has `top`/`right`/`bottom`/`left` but no `inset`.
Three spellings are rewritten before that check: `Nrem` becomes `N × 16` (GPUI's rem size, which
gpuix never changes), `overflow*: auto` becomes `scroll` (native matches only `scroll`/`hidden`
and would ignore it), and `max-content`/`min-content`/`fit-content(...)` become `auto` on the
dimension keys. `em` stays dropped because it means the inherited font size, which the renderer
cannot see, and `vh`/`vw` because a class rule is parsed at compile time and nothing re-resolves
on resize.

**`events.ts`** — Svelte lowercases event names at compile time (`onmouseenter` → `mouseenter`);
GPUI keys listeners camelCase (`mouseEnter`). `GPUI_EVENTS` is a hand-kept copy of GPUI's event
list, lowercased into the lookup map; `npm run parity` diffs it against upstream's `EVENT_PROPS`.
Unknown events are dropped silently.

### Shipped components

`src/components/` ships `.svelte` files as-is; the consumer's loader compiles them, and their
`import ... from 'gpuix-fractalsvelte'` resolves through the package's own `exports` from anywhere.
`docs/components.md` documents their props and the native `<anchored>`.

- **`Scroller`** is the scroll column with a drawn thumb (the tutorial, the styling playground
  and Substrate all use it). GPUI paints no scrollbar and captures no pointer, so it measures
  `getElementBounds`/`getScrollOffset` on a timer and drags on a panel-sized overlay; the thumb
  restyle after a wheel event is throttled to one per 50 ms because each one is a full native
  frame. A plain scroll container lays out and paints every child every frame, so `virtual` swaps
  in GPUI's `<virtual-list>` (each direct child a row, which needs `width: 100%`; `follow` →
  `followTail`). There the thumb works in rows: the viewport from `getListScrollTop`, the row
  height a running mean of `visibleRange` reports seeded with `estimate`, drag via `scrollToItem`.
  Its colours are `var(--scroller-thumb, …)` / `var(--scroller-thumb-hover, …)`.
- **`Portal`** is a window-sized `position: absolute; pointer-events: none` wrapper carrying the
  renderer's `portal` attribute: the shadow node stays exactly where Svelte put it (so Svelte's
  teardown walk, anchors and `{#if}` blocks are untouched) and only the **native** node hangs off
  the root (whose default `position: relative` makes `inset: 0` the window) — appended after the
  subtree it sits in has attached (`pending_portals`), so it paints last, and later portals over
  earlier ones. `first_native_after` skips portal nodes, since they are not in their shadow
  parent's native child list, and `commit()` destroys any portal that is no longer `live`, because
  its ancestor's `destroyElement` never reaches it.
- **`Tooltip`** and **`Popover`** hang a native `<anchored>` layer from a 0×0 dot on the trigger's
  edge, with `align="start"` and the `anchor` corner named explicitly, because native 0.10's
  `align: center` centres the content-sized layer box and then anchors its centre again, landing
  half a layer off (`test:tooltip` asserts the quirk, so it fails once upstream fixes it). The
  layer carries `background-color: #00000001`, or native paints `#1a1a1a` behind it. `Tooltip`
  tracks hover per source (wrapper, spread trigger handlers, tip) because a pointer jumping onto the
  tip gets the tip's `mouseEnter` before the trigger's `mouseLeave`. `Popover`'s `mouseDownOutside`
  sits on the panel (`<anchored>` only hears `click`, `mouseEnter`, `mouseLeave` and `fileDrop`).
  Both forward a `style` prop to the tip or panel: `var()` resolves from one global map and a
  parent's scoped rules cannot reach in, so inline style is the only per-instance hook.

### Regenerating the styling reference

The two `<details>` lists in `docs/styling.md` are transcribed from the native side, so redo them
whenever `@gpuix/native` moves. The npm package ships no Rust; read the release tag on upstream
(`https://raw.githubusercontent.com/remorses/gpuix/@gpuix/native@<version>/packages/native/src/<file>`,
tags exist for every release; the sibling `../gpuix` checkout lags and is not a source of truth):

- `style.rs`, `struct StyleDesc` — every key and its type. `Option<f64>` keys are pixel-only,
  `DimensionValue` takes `%`/`auto`, `String` keys are keyword-matched, and anything that is a
  struct (`BoxShadowValue`, `BackgroundValue::Gradient`) is unreachable from CSS text. Its
  `parse_cursor` is the cursor keyword list.
- `renderer.rs`, `fn apply_styles` — the keywords each `String` key actually matches; a key that is
  in `StyleDesc` but not here is accepted and ignored (`display: none`; `visibility: hidden` is
  handled further down, as `invisible()`).
  `sed -n '/fn apply_styles/,/^}/p' renderer.rs | grep -n 'Some("'` lists them all. `parse_font_weight`
  is the weight names; `overflow: scroll` is handled separately in `build_host_container`.
- `color.rs` — colour syntax (`csscolorparser`, so names and `hsl()` work).

Then mirror any new pixel-only or dimension key into `NUMBER_ONLY` / `DIMENSION` in `src/style.ts`,
add a card to `examples/styling-playground`, and confirm what actually reached GPUI headlessly:
mount with `TestGpuixRenderer` and read `getTreeJson()` — each node's `style` is the deserialized
`StyleDesc`, with unknown keys already dropped, which is exactly what `docs/styling.md` claims.

## Writing components for this renderer

`docs/styling.md`, `docs/guide.md` and `docs/components.md` are the full user-facing rules; these
are the ones that bite most often, and the renderer behaviour behind them.

- Style with `<style>` blocks for shape and colour, colours as `var(--token)` with the palette
  handed to `set_css_vars({ token: '#fff' })` once from the root (Substrate does it in an `$effect`
  over its `LIGHT`/`DARK` objects — a theme switch is one call), and `style:` / inline `style="..."`
  only for measured values. Class rules accept `.btn`, `.btn.primary`, `.a, .b`, one tag, and
  `:hover` / `:active`; specificity is class count then source order, inline `style` always wins.
  Box shorthands work and `rem` is 16 px; `em`/`vh`/`vw` do not — GPUI lengths are logical pixels —
  and neither do `%` or `auto` outside `width`/`height`/`min*`/`max*`, so the `auto` halves of
  `margin: 0 auto`, and all of `border-radius: 50%`, are dropped with a warning. `flex: 1`,
  `border: 1px solid ...`, unitless `line-height` and `display: none` misbehave in a class rule as
  inline (see the styling playground). Shared reactive state goes in `.svelte.ts` modules.
- Only GPUI tags exist (`div`, `text`, `img`, `svg`, `input`, `textarea`, `code`, `diff`,
  `markdown`, `virtual-list`, `anchored`, `canvas`, ...); anything else degrades to `div` with a
  one-time warning. `<img src>` is a filesystem path, a `data:` URL or an http(s) URL GPUI fetches
  in the background, so give it both a width and a height. `<markdown>` is rebuilt and laid out in
  full on every frame, on screen or not, and the cost follows its block count, not its bytes (a
  226-block page cost ~7 ms a frame headless, ~18 ms in Substrate's window), so a long document goes
  one block per row under `<Scroller virtual>`, which brought it under 1 ms headless and the window
  to ~5 ms — Substrate's `Item.svelte` with `lib/blocks.ts` (one row per top-level token of
  `marked`'s lexer) is the example. `<svg source>` inherits **no** `color` natively, so the renderer
  copies the nearest ancestor's (from its class rules or inline style) onto any `<svg>` without one
  and re-copies it whenever that ancestor restyles; a parent's `:hover` colour does not reach it,
  since hover is native.
- Only the events in `GPUI_EVENTS` fire. `keyDown`/`keyUp` require focus (`tabIndex` or
  `autofocus`); Tab reaches `keyDown` as an ordinary key and does not move focus, so an app wires
  `e.key === 'tab'` to `focus_next()` / `focus_previous()`, which walk the window's tab stops as of
  the last painted frame (a stop rendered this tick joins after it paints). For shortcuts use
  `on_window_key('keydown', handler)` (an unsubscribe comes back; `render`'s `onKeyDown`/`onKeyUp`
  options are the same thing kept across remounts) — it fires whatever has focus, and `e.editing`
  says a text field has focus and is getting the same key. The renderer tracks that itself by
  always listening for `focus`/`blur` on `<input>`/`<textarea>`. `on_selection_change(handler)` (and
  `render`'s `onSelectionChange`) rides the same window pseudo-node as `on_window_key`, through
  `setWindowSelectionChange` on the same id. `<textarea>` Enter inserts a newline unless the element
  has `onsubmit`.
- `window_size` / `window_insets` are reactive getter objects, not runes: `window.ts` wraps
  `@gpuix/native/host`'s `observeWindowSize` / `observeWindowInsets` (100 ms poll, structural
  compare) in `createSubscriber`, because native 0.10 still has no resize event. The poll starts on
  the first tracking read and stops a microtask after the last reader's effect is destroyed. A
  read outside an effect gets the last polled value while a poll is live and one fresh native call
  otherwise, and a module-level `$derived` first read outside any effect owns its poll forever
  (`createSubscriber` semantics; Svelte's `MediaQuery` does the same). The host object resolves
  `get_native()` on every call, so a poll that outlives a remount follows the new native. Insets
  keep upstream's camelCase fields (`safeArea`, `keyboardVisible`, …), like every other native
  payload. Headlessly the size is the real viewport and the insets are zero; with no native at all
  it is upstream's 800×600 fallback.
- **`onclick` is the primary button only; a right or middle click is `onauxclick`**, told apart by
  `e.isRightClick`, with `e.x`/`e.y` in window coordinates — which is what positions a `<Portal>`
  menu at the cursor (`getElementBounds` on that panel reports its content box, so it sits inset by
  the border and padding). GPUI routes macOS's ctrl+click to `click`, not `auxClick`, so a surface
  that wants the platform's secondary click needs both handlers; Substrate's `is_secondary(e)` in
  `lib/ui.svelte.ts` is that check written once.
- **No mouse event bubbling, and a painted child occludes its parent's hitbox.** (Key events are
  the exception: a `keyDown` reaches the focused element *and* every focusable ancestor that
  listens, so a root shortcut handler also hears what is typed into an `<input>` below it.) A child
  with a `background-color` (or `position: absolute`) swallows clicks meant for a clickable
  ancestor — put `hitbox="self"` on the clickable element and the renderer ships
  `pointer-events: none` for every descendant that has no listener of its own, is not an
  input-taking native type (`INTERACTIVE_TAGS`), is not focusable (`tabindex`/`autofocus`) and does
  not scroll; a nested button keeps its hitbox (and shields its own decoration), and adding or
  removing a listener later restyles that element. An explicit `pointer-events` on the descendant
  wins. GPUI also doesn't capture the pointer on mousedown: for drags, put `mousemove`/`mouseup` on
  the surfaces the cursor may cross (or show a window-sized `position: absolute` overlay for the
  drag's duration, as `Scroller` does) and treat a move with `pressedButton == null` as the release
  (see the sliders in `examples/liquid-glass/LiquidGlass.svelte`). A left mousedown also starts a
  text selection that every later move extends across whatever text lies in between, unless the
  element under the pointer (or an ancestor) has `user-select: none` — put it on every drag handle.
- `motion={{ initial, animate, transition }}` animates `left`/`top`/`width`/`height`/`opacity`/
  `borderRadius` natively (durations in seconds) — used for the toggle knobs in the liquid-glass
  example.
- Paint order is document order, so anything that must sit on top (a modal, a toast, a popover)
  goes inside `<Portal>`, rendered from wherever it is needed; its children position against the
  window. Content that should sit beside a trigger goes in `Tooltip` / `Popover`, or the native
  `<anchored>` they build on; its child sizes to content, so it is no use for a scrim.
- `div`/`text` accept only `autoFocus`, `tabIndex`, `testId`, `motion`, `highlight`, `role` and
  `aria-label` / `-description` / `-id` / `-expanded` / `-selected` / `-valuetext` / `-level` as
  props; other attributes are dropped for built-ins and forwarded for custom element types.
  `normalize_prop` turns the string forms Svelte hands over for static attributes into the JSON
  types native reads (`aria-expanded="true"` → `true`, `aria-level="2"` → `2`); native ignores a
  mistyped one silently. GPUI reports roles as AccessKit names (`Button`, `Heading`), which is
  what `getA11yTree()` on the test renderer shows.
- `highlight={{ query } | { ranges: [[start, end], …], color, radius }}` paints GPUI's native
  search highlight behind the matching text (character offsets into the element's text) and fires
  `onhighlight` with `e.matchCount`. A find bar is `TextSearch` from `src/search.ts`
  (`highlight={search.spec} onhighlight={search.on_highlight}`, then `query`, `total`, `active`,
  `next`/`prev`/`go_to`): native's `createTextSearchController` behind `createSubscriber`. Its
  `getSnapshot()` both builds a fresh spec and records the options `next()` counts against, so
  `search.ts` calls it once per change, before every move, and keeps an unchanged spec's identity —
  Svelte's `set_attribute` skips an identical value, which spares a `setCustomProp` per reported
  count.
- `bind:` is refused by the compiler under `customRenderer`. To get hold of an element use
  `{@attach (node) => ...}` (or `use:`); the node is the renderer's shadow node, and `node.nativeId`
  is what `get_native()`'s handle wants for `getScrollOffset()` / `getElementBounds()`
  (`{ x, y, width, height }`; a clipped child still reports its full size). The scroll offset moves
  after the wheel event returns, so read it from `onscroll` a frame later, as `Scroller` does.
- Examples import the package by name (`import { render_hot } from 'gpuix-fractalsvelte'`) via the
  self-reference in `exports`.

## Releasing

`.github/workflows/release.yml` runs release-please on every push to `main`: it keeps a release
PR open from the conventional commits since the last release (`release-please-config.json`:
`release-type: node`, `bump-minor-pre-major` so a pre-1.0 breaking change bumps the minor,
`include-component-in-tag: false` for `vX.Y.Z` tags; `.release-please-manifest.json` is the last
released version), and merging that PR tags, creates the GitHub release, runs `npm test` +
`npm run consume` on macOS, then `npm run publish:npm` and `npm publish` in
`packages/create-gpuix-fractalsvelte` on Linux with npm trusted publishing (OIDC, `id-token: write`;
provenance is automatic). Each package has its own trusted publisher on npmjs.com:
`khromov/gpuix-fractalsvelte`, workflow file `release.yml`. release-please's `extra-files` keeps
`packages/create-gpuix-fractalsvelte/package.json`'s version equal to the root's, and the scaffolder
writes `^<its own version>` into the app it creates (so `starter/package.json`'s own pin can lag).
**PR titles must be conventional commits** (`feat:`, `fix:`, `docs:`, `chore:` …) — squash merges
make the title the commit, and release-please ignores anything else. With the default
`GITHUB_TOKEN` the release PR does not trigger `test.yml`; a `RELEASE_PLEASE_TOKEN` PAT secret
fixes that.

`starter/` is the template `create-gpuix-fractalsvelte` copies (its `prepack` syncs it into the package's
gitignored `template/`; run from the repo, `index.js` reads `starter/` directly) and so the app
`npm run consume` installs the packed tarball into (under `$TMPDIR`, so the checked-in one stays
pristine). It has its own tsconfig with the `paths` for the nested svelte and its own
`AGENTS.md` (and a `CLAUDE.md` that imports it) for the consumer's agents, and is excluded from
the root `tsconfig`, eslint and `files`.

## Runtime

Node 26 (`.nvmrc`; `nvm use` before anything). Install with `bun install` (CI: `--frozen-lockfile`;
a locked version moves within its range with `bun update <pkg>`), run scripts with
`npm run <script>`; packing and publishing stay on npm (`npm pack` bundles the vendored svelte and
its dependencies, and `npm publish` does the OIDC trusted publishing). Keep the source
runtime-agnostic — `node:*` builtins only, no `Bun.*` calls and no `bun` imports outside
`src/plugin.ts`, `scripts/compile.ts` and `scripts/web.ts` (Bun is the bundler there). Import types
with `import type`, and components import the renderer's types (`ShadowNode` for `{@attach}`,
`GpuixEvent` for handlers) from `'gpuix-fractalsvelte'`; `.svelte` files use `<script lang="ts">` — the
compiler strips the types itself, and svelte-check (part of `typecheck`) checks them.

## Working in this repo

- Make file changes with the Edit/Write tools so every change shows as a diff; Bash is for
  reading, running scripts and tests, and scratch files under `$TMPDIR`. Anything worth
  remembering goes in this file, not in Claude Code's memory directory.
- The headless renderer (Metal) and every window crash under Claude Code's Bash sandbox ("Swift
  Fatal error: Array index out of range", hiservices XPC errors) — run `npm test`, `consume` and
  the demos with the sandbox disabled.
- Sibling checkouts: `../gpuix` is the fork this repo was extracted from and lags upstream (native
  0.7.0) — read upstream release tags instead (see "Regenerating the styling reference");
  `../svelte` (khromov/svelte) is the local copy of the custom-renderer PR stack, on its
  `custom-condition` branch (check it out before reading; it is force-pushed about weekly);
  `../substrate-gpuix-fractalsvelte` (khromov/substrate-gpuix-fractalsvelte, private) is Substrate, the "second
  brain" app that consumes the published package. Wherever this file says "Substrate's `x`", the
  path is relative to that checkout. Its `bun run test` is the largest consumer suite there is; to
  run it against this checkout, swap its `node_modules/gpuix-fractalsvelte` for a symlink to
  `../../gpuix-fractalsvelte`, and `bun install` there restores the published copy.
- `typescript` is pinned `^5.9`, not 7 (the Go port changes defaults such as `types: []`);
  `@types/node` is pinned explicitly (bun-types' `*` would float); `types/node-ffi.d.ts` adds
  `float32`/`float64`, which `node:ffi` accepts but `@types/node` omits. Bun and tsc silently
  map a stale `./x.js` specifier onto `x.ts`; Node's own stripping does not, so only the Node
  suite catches one.
- A mutation sweep (inverting each assertion in turn; every one failed its run) found two guards
  that survive source mutation because no reachable state distinguishes them:
  `first_native_after`'s `n.attached` check (every id-bearing node the scan reaches is attached or
  a portal, and `!is_portal` already excludes those) and `flush_var_warnings()` sitting above
  `commit()`'s empty-queue return (a var read always queues the `setStyle` that read it, so moving
  it below would at worst defer a warning one frame). Both are deliberate belt-and-braces; don't
  "cover" them, and don't delete them on the grounds that no test fails.
- `check:svelte` talks the MCP streamable-HTTP protocol over `fetch` (initialize → tool call,
  answered as one-message SSE) rather than pulling in a client library, and the npm script passes
  `--use-env-proxy` so it works behind one. Its `FILTERS` table drops two classes that can never
  apply here, each shown with its reason in the run's header: `a11y_*` for the reason
  `svelte.config.js` filters them (they are DOM advice — keyboard handlers beside click handlers,
  roles on static elements — and the examples were not written against them), and the autofixer's
  "you are calling `x` inside an `$effect`" heuristic, which fires on *any* call in an effect and so
  hits every `on_window_key` / `setInterval` subscription — all of which need the teardown
  `$derived` has no way to hold. Matching is on message text, since suggestions carry no error
  code, so a reworded message fails open. The surviving "stateful variable X is assigned inside an
  `$effect`" class is deliberately **not** filtered: every current hit is an async fetch, a timer
  or a two-way sync, but it is the class that caught tic-tac-toe's score tally. A one-shot
  subscription with nothing reactive in it (`on_selection_change` in `examples/desktop-apis`) goes
  through `onDestroy` instead of an `$effect`, which keeps it out of that class. A clean run reports
  0 issues and a couple of suggestions.
- `demo:glass-ffi` renders as an opaque dark slab over bright backdrops on every native version
  tested: attaching the NSGlassEffectView itself turns the window opaque (the shim never opts into
  behind-window sampling), not a renderer regression.


## License

MIT

# gpuix-fractalsvelte starter

The smallest project that consumes `@fractaldesign/gpuix-fractalsvelte` from npm: a counter in a native GPUI window.
`npm create @fractaldesign/gpuix-fractalsvelte@latest` copies it into a new directory; then:

```bash
npm install          # gpuix-fractalsvelte brings its own Svelte build
npm start            # opens the window; edit App.svelte and save to hot-reload
npm test             # headless: mounts App.svelte, clicks through GPUI's real hit testing
npm run typecheck    # tsc --noEmit, then svelte-check over App.svelte against GPUI's element types
npm run build        # the app for this platform: a .app on macOS, an .exe on Windows, a binary on Linux; needs Bun
```

`npm start` and `npm test` run through the `@fractaldesign/gpuix-fractalsvelte` bin, which starts Node (or Bun, under
`bun run start` / `npx @fractaldesign/gpuix-fractalsvelte --bun app.ts`) with the module conditions Svelte's custom
renderer needs and the `.svelte` loader installed. Spelled out:

```bash
node --conditions custom-renderer --conditions development --import @fractaldesign/gpuix-fractalsvelte/register app.ts
bun  --conditions custom-renderer --conditions development --preload @fractaldesign/gpuix-fractalsvelte/plugin app.ts
```

## Files

- `app.ts` — the entry: `render_hot` opens the window and remounts `App.svelte` on every save.
- `App.svelte` — the component. Styling is a `<style>` block of class rules plus
  [fractalstyler](https://www.npmjs.com/package/@fractaldesign/fractalstyler)'s classes from
  `styles/`; see [docs/styling.md](https://github.com/khromov/gpuix-svelte/blob/main/docs/styling.md)
  for what CSS reaches GPUI and [styles/README.md](styles/README.md) for the copies.
- `styles/` — the design system's layers, imported by `App.svelte` as `./styles/index.css`. The
  import registers every class and tag rule app-wide and applies the `:root` tokens; each
  `[data-mode='light']`/`['dark']` block becomes a palette, and the mode button calls
  `use_palette(mode)` to switch. Edit the values in place (`rem` to `px`, a colour, a size).
- `standalone.ts` and `build.ts` — `npm run build` compiles `standalone.ts` into the platform's
  app with Bun: `dist/<name>.app` on macOS, `dist/<slug>.exe` on Windows, `dist/<slug>` on Linux
  (the slug is the name lowercased, with dashes). The name, identifier, version and icon are the
  `app` options `standalone.ts` hands `render()`; the icon is the gpuix-fractalsvelte one until `icon`
  names your own PNG. It is built for the machine it runs on, so build on macOS, Windows and Linux
  in turn to ship all three; the release workflow below does that. `bun build.ts --archive` also
  writes the archive to distribute and the fragment an update manifest is made from.
- `.github/workflows/release.yml`, `release-please-config.json`, `.release-please-manifest.json` —
  on GitHub, release-please keeps a release PR open from your conventional commits; merging it
  builds the app on every platform and uploads the archives and an `update.json`. The scaffolder
  asks whether to include them (`--github owner/repo` or `--no-github` decides without asking),
  and with the repository named it fills in the `update` line of `standalone.ts`; otherwise
  uncomment that line yourself. The app then checks that manifest through `check_for_update()`
  from `@fractaldesign/gpuix-fractalsvelte/update` (`App.svelte` shows the banner). See
  [docs/updating.md](https://github.com/khromov/gpuix-svelte/blob/main/docs/updating.md).
- `test.ts` — a headless test through `@fractaldesign/gpuix-fractalsvelte/test`; plain script, exits 1 on failure.
  Runs on macOS and Windows, where the headless renderer is built.
- `svelte.d.ts` — declares `*.svelte` and `*.css` modules for `tsc`.
- `tsconfig.json` — `nodenext`, and a `paths` entry so `tsc` finds the Svelte that is nested
  inside the package. `svelteOptions.namespace` and the `@fractaldesign/gpuix-fractalsvelte/html` type entry make the
  editor and svelte-check type `App.svelte`'s markup as GPUI elements rather than DOM ones.
- `AGENTS.md` — instructions for coding agents, pointing at the docs' `llms.txt`; `CLAUDE.md`
  imports it for Claude Code.
- `svelte.config.js` — editor and svelte-check only: switches off Svelte's DOM a11y advice.
- `bunfig.toml` — preloads the `.svelte` loader for Bun. A plain `bun file.ts` still needs the two
  `--conditions` flags above, so go through the bin.

`@fractaldesign/fractalstyler` is a dependency for its type declarations and `registry.json`; the
stylesheet itself lives in `styles/` as a local copy, so a value can be edited in place.

Needs Node >= 24 or Bun >= 1.4.

# @fractaldesign/create-gpuix-fractalsvelte

Scaffolds a [gpuix-fractalsvelte](https://github.com/khromov/gpuix-svelte) app styled with
[fractalstyler](https://www.npmjs.com/package/@fractaldesign/fractalstyler): Svelte components
rendered into a native, GPU-accelerated desktop window through GPUI.

```bash
npm create @fractaldesign/gpuix-fractalsvelte@latest my-app
cd my-app
npm install
npm start
```

The same thing without npm's `create` prefix, which is also the form Bun takes:

```bash
npx @fractaldesign/create-gpuix-fractalsvelte my-app
bunx @fractaldesign/create-gpuix-fractalsvelte my-app
```

Needs Node >= 24 or Bun >= 1.4, on macOS (arm64), Windows (x64 or arm64) or Linux (x64).

The app it writes is styled with [fractalstyler](https://www.npmjs.com/package/@fractaldesign/fractalstyler):
its CSS layers come along as editable copies under `styles/`, imported once from `App.svelte`, with
a light/dark switch calling `use_palette`.

It asks whether to add a GitHub Actions release workflow (release-please cuts versions, every
platform builds, and the app updates itself from the release's manifest) and for the repository
to point the app at. `--github owner/repo` answers both without asking, `--no-github` leaves the
workflow out:

```bash
npm create @fractaldesign/gpuix-fractalsvelte@latest my-app -- --github you/my-app
```

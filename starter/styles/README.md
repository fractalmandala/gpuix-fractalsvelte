The layers of [fractalstyler](https://www.npmjs.com/package/@fractaldesign/fractalstyler),
copied here so the values can be edited in place — `rem` to `px`, a different type scale, a
colour of your own. `index.css` imports them in the order the cascade needs.

They are local copies, not a dependency's files: `npm view @fractaldesign/fractalstyler` tells
you what changed upstream, and re-copying a layer is a diff. The package is still in
`package.json` for its type declarations and `registry.json`.

What GPUix cannot take is skipped with one line per kind, printed on startup: `@media` and
`@supports` blocks, descendant and attribute selectors, and properties GPUI has no field for
(`box-shadow`, `transform`, `transition`, `z-index`, `letter-spacing`, `text-transform`).

Two edits on top of the published layers, both marked in the files: `--theme-color-sub` and
`--theme-color-alt` (read by `.themed:hover`, `.link:hover` and `.themed.selected`) are defined
in `colors-themes.css`, since no layer defines them upstream.

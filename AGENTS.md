# AGENTS.md

gpuix-fractalsvelte is coupled with fsgpui, both projects together driving integration between Svele and GPUI, with enhanced tooling and custom config for fractalstyler styling system.

> In a broad sense the objective we are pursuing:
> Incorporating `fractalstyler` into gpuix-fractalsvelte.

> What does "incorporating" mean?
> It means that the gpuix-fractalsvelte package must be edited such, that when other projects use `npm create gpuix-fractalsvelte` and install it, fractalstyler classes and tokens recognition must be activated in their projects.
> They should not need to set up cssvars or other functions/tooling themselves.
> There is no difference between gpuix-svelte and gpuix-fractalsvelte otherwise!

**Always See `DEVLOG.md` for details.**

## Rules

### 1. Devlogging

Every code editing/adding/removing, every feature, every addition, every activity must be logged. Tasks are opened from DEVLOG, list is managed there, and each work stream or session is logged in a document of its own at `devlogs/` folder. 

### 2. Responsibilities

User opens tasks from description/listing in DEVLOG, or
User opens task by creating doc in `devlogs/` and adding task description.

⭐ Agents run tasks, must maintain DEVLOG and `devlogs/`.
⭐ Always maintain `README` of the starter app up to date - [README](starter/README.md)

### 3. Verification

Agents must use `~/ars-docs/alldocs/90skills/create-verification-skill` create verification skill, and use verification tests to validate work before presenting it. Do not proceed if you do not have a verification locked for the work.

⭐ Maintain indexed list of created skills at Verification Skills Index - `alldocs/04canonicals/verification-skills-index.md`.
⭐ Always check index if skills/test already exist for your work.

Create skills in this folder - `~/ars-docs/alldocs/90skills`.

### 4. Markdown and YAML

All docs in `devlogs/` folder must have YAML frontmatter:

```YAML
---
title:
description:
---
```

⭐ Do not add `#` H1 title in documents. Do not begin with any headings. 
⭐ Linking should be `[linked text](path-to-item)`. Do not use `[[` backlinking system.


## Gpuix-fractalsvelte Docs

- [Overview](docs/package/01overview.md): what the package is, setup, how it differs from Svelte on the web, TypeScript config
- [Styling](docs/package/02styling.md): every CSS property and value GPUI accepts, what is dropped, theming with var() and set_css_vars
- [Components](docs/package/03components.md): Scroller (scrollbars, virtual lists), Portal (modals, menus, toasts), Tooltip, Popover and the native <anchored> they build on
- [Guide](docs/package/04guide.md): forms and inputs, keyboard shortcuts and focus, window and desktop helpers, state that survives hot reload
- [Testing](docs/package/06testing.md): headless tests through gpuix-svelte/test: mount, click, type, read back, screenshot; gpuix-svelte/automation drives a running window
- [Shipping](docs/package/05shipping.md): standalone binaries with Bun, macOS signing, running in a browser on WebGPU


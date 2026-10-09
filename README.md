# @blackpaw/ui — Blackpaw Design System

Single source of truth for all Blackpaw/Hakiqa brand tokens, design utilities, and shared React components.

## Download logos

No GitHub account or tools needed. Click a link and the file downloads.

**Ready-made packs** (rebuilt automatically every time this repo changes; retired logos left out)

| Pack | What is inside |
|---|---|
| [blackpaw-logos.zip](https://blackpaw-innovations.github.io/bp_design_system/downloads/blackpaw-logos.zip) | Every current Blackpaw logo, PNG and SVG |
| [blackpaw-everything.zip](https://blackpaw-innovations.github.io/bp_design_system/downloads/blackpaw-everything.zip) | Logos, icons, print, backgrounds, logo animations |
| [hakiqa-logos.zip](https://blackpaw-innovations.github.io/bp_design_system/downloads/hakiqa-logos.zip) | Every current Hakiqa logo, incl. the 15 vertical logos and the woven alternative |
| [hakiqa-vertical-logos.zip](https://blackpaw-innovations.github.io/bp_design_system/downloads/hakiqa-vertical-logos.zip) | Only the vertical logos (duka, gym, optical, ...) |
| [haki-mascot.zip](https://blackpaw-innovations.github.io/bp_design_system/downloads/haki-mascot.zip) | Haki: poses, occasions, 17 industries (happy and calm) |
| [hakiqa-everything.zip](https://blackpaw-innovations.github.io/bp_design_system/downloads/hakiqa-everything.zip) | All Hakiqa files: logos, icons, Haki, motion, stickers |

**The main logos, one click each**

| Logo | PNG | SVG |
|---|---|---|
| Blackpaw main logo (bp mark, light backgrounds) | [PNG](https://blackpaw-innovations.github.io/bp_design_system/src/assets/brand/blackpaw/logo/mark/transparent/bp-mark-color-transparent.png) | [SVG](https://blackpaw-innovations.github.io/bp_design_system/src/assets/brand/blackpaw/logo/mark/transparent/bp-mark-color-transparent.svg) |
| Blackpaw main logo (bp mark, dark backgrounds) | [PNG](https://blackpaw-innovations.github.io/bp_design_system/src/assets/brand/blackpaw/logo/mark/transparent/bp-mark-color-dark-transparent.png) | [SVG](https://blackpaw-innovations.github.io/bp_design_system/src/assets/brand/blackpaw/logo/mark/transparent/bp-mark-color-dark-transparent.svg) |
| Blackpaw stacked (name under the mark, dark backgrounds) | [PNG](https://blackpaw-innovations.github.io/bp_design_system/src/assets/brand/blackpaw/logo/stacked/transparent/bp-stacked-color-dark-transparent.png) | [SVG](https://blackpaw-innovations.github.io/bp_design_system/src/assets/brand/blackpaw/logo/stacked/transparent/bp-stacked-color-dark-transparent.svg) |
| Hakiqa main logo (light backgrounds only) | [PNG](https://blackpaw-innovations.github.io/bp_design_system/src/assets/brand/hakiqa/logo/symbol/hakiqa-mark-full.png) | [SVG](https://blackpaw-innovations.github.io/bp_design_system/src/assets/brand/hakiqa/logo/symbol/hakiqa-mark-full.svg) |
| Hakiqa woven alternative (campaigns, merch) | [PNG](https://blackpaw-innovations.github.io/bp_design_system/src/assets/brand/hakiqa/logo/alternatives/hakiqa-mark-woven-boucle.png) | — |

**Looking for one file on GitHub?** Open the folder from the table below, click the file, then click the download button (arrow) at the top right of the preview. GitHub cannot download a whole folder; use the packs above for that.

Not sure which logo goes on which background? Read the brand book first: [Blackpaw](https://blackpaw-innovations.github.io/bp_design_system/docs/brand/blackpaw-brand-book.html) · [Hakiqa](https://blackpaw-innovations.github.io/bp_design_system/docs/brand/hakiqa-brand-book.html).

## Find it fast

Laid out like the Brand Kit folder (`Documents\Brand Kit`). Same numbers, same order.

**0 · Start here:** [`docs/brand/`](docs/brand/README.md) has both brand books, the 9 Oct resolutions (the current rules) and the Copilot document prompt. Live site: <https://blackpaw-innovations.github.io/bp_design_system/>

**Blackpaw** (`src/assets/brand/blackpaw/`)

| Brand Kit | Repo folder |
|---|---|
| 1 Logos · A bp symbol (main logo) | `logo/mark/` |
| 1 Logos · B Symbol and name, stacked | `logo/stacked/` |
| 1 Logos · C Symbol and name, side by side | `logo/horizontal/` |
| 1 Logos · D Tagline | `logo/tagline/` |
| 1 Logos · E Wordmark and type lockups | `logo/wordmark-lockups/` |
| 1 Logos · F All logos, transparent | `logo/transparent-pack/` |
| 1 Logos · G Without tagline | `logo/no-tagline/` |
| Old logos, do not use | `logo/z-retired/` |
| 2 App icons and favicons | `digital/` |
| 3 Print | `print/` |
| 4 Backgrounds, patterns and stickers | `graphics/` |
| 6 Logo animations | `motion/logo-animations/` |

**Hakiqa** (`src/assets/brand/hakiqa/`)

| Brand Kit | Repo folder |
|---|---|
| 1 Logos · A Symbol only (main: `hakiqa-mark-full`) | `logo/symbol/` |
| 1 Logos · B Name only (wordmarks) | `logo/wordmarks/` |
| 1 Logos · C Symbol and name, side by side | `logo/lockups/horizontal/`, `horizontal-script/` |
| 1 Logos · D Symbol and name, stacked | `logo/lockups/stacked/`, `stacked-script/` |
| 1 Logos · E Duka and Connect names | `logo/product/` |
| 1 Logos · F Vertical logos | `logo/product/verticals/` |
| 1 Logos · G Material alternative (woven) | `logo/alternatives/` |
| 1 Logos · Z Old logo, do not use | `logo/z-retired/` |
| 2 App icons and favicons | `digital/` |
| 3 Haki the mascot | `mascot/` (+ `occasions/`, `industries/excited/`, `industries/calm/`) |
| 4 Motion graphics · A Logo animations | `motion/logo-animations/`, `motion/logo/` |
| 4 Motion graphics · B Sonic logo | `motion/sonic/` |
| 5 Stickers, stamps and patterns | `stickers/`, `applications/`, `textures/` |

**Not in the repo, on purpose:** 3D renders, video ads, drafts and the Kenyan flag set. These are campaign media and stay in the Brand Kit folder.

**Everything else**

| Need | Where |
|---|---|
| Which file to use, by stable ID and status | `src/assets/asset-manifest.json` |
| Colours, spacing, motion tokens | `src/tokens/` |
| One switch for a look across every app (role tokens: card, button, input, chip, hero, vertical family) | `src/tokens/roles.css` |
| React components | `src/components/` |
| Fonts | `font-library/` |
| Checks (`npm run check:brand`, `check:experience`) | `scripts/`, `conformance/` |
| Old handoffs and decision records | `docs/history/`, `docs/brand/history/` |

## Brand platform

Open the unified public [Brand & Design System](docs/index.html) first. The
approved strategy, message hierarchy and application rules live in
[`docs/brand/`](docs/brand/README.md). Review the
[Blackpaw Brand Book](docs/brand/blackpaw-brand-book.html),
[Hakiqa Brand Book](docs/brand/hakiqa-brand-book.html),
[Brand Guidelines](docs/brand/blackpaw/BRAND_GUIDELINES.md) and
[Voice and Messaging](docs/brand/blackpaw/VOICE_AND_MESSAGING.md) for production work.

The canonical [Design and App-Building Principles](BUILDING_PRINCIPLES.md) are
also available as a dedicated visual page under
[`docs/building-principles/`](docs/building-principles/index.html).

Coding agents must begin with [`AGENTS.md`](AGENTS.md). Approved public exports
live in [`src/assets/brand/`](src/assets/brand/) and must be selected by stable ID
from the [asset manifest](src/assets/asset-manifest.json). Do not redraw assets or
copy them from screenshots.

## Structure

```
blackpaw-design-system/
├── src/
│   ├── tokens/
│   │   ├── brand.css        # Hakiqa brand colors, motion, radius, spacing
│   │   ├── utilities.css    # card-lift, hk-gradient, sidebar, skeleton, etc.
│   │   └── index.css        # import both (use this one)
│   ├── components/
│   │   ├── Skeleton.tsx     # shimmer loading states (+ MetricCardSkeleton, etc.)
│   │   ├── EmptyState.tsx   # blank slate with icon + CTA
│   │   ├── MetricCard.tsx   # KPI card with sparkline + trend
│   │   └── ViewToggle.tsx   # list / card / table switcher
│   ├── lib/utils.ts         # cn() helper (clsx + tailwind-merge)
│   └── index.ts             # all exports
└── tailwind.preset.js       # shared Tailwind config (extend this in each app)
```

## Setup in an app

**Step 1 — Add the dependency** (pnpm workspace — no publishing needed):

```bash
# From the app directory
pnpm add @blackpaw/ui
```

Or add manually to `package.json`:
```json
"dependencies": {
  "@blackpaw/ui": "workspace:*"
}
```

**Step 2 — Import tokens** in your app's `src/index.css`, before your app-specific tokens:

```css
@import '@blackpaw/ui/tokens';

/* Your app-specific token overrides below */
@layer base {
  :root {
    --background: ...;
    --foreground: ...;
  }
}
```

**Step 3 — Extend the Tailwind preset** in `tailwind.config.js`:

```js
import blackpawPreset from '@blackpaw/ui/tailwind'

export default {
  presets: [blackpawPreset],
  content: [
    './src/**/*.{ts,tsx}',
    '../blackpaw-design-system/src/**/*.{ts,tsx}',  // include DS components
  ],
}
```

**Step 4 — Use components**:

```tsx
import { Skeleton, EmptyState, MetricCard, ViewToggle } from '@blackpaw/ui'
```

## What lives here vs in the app

| Here (`@blackpaw/ui`) | In the app |
|---|---|
| Hakiqa brand colors | App-specific theme (light/dark mode tokens) |
| card-lift, hk-gradient, sidebar styles | Page layouts, routes |
| Skeleton, EmptyState, MetricCard, ViewToggle | Business-logic components |
| Tailwind preset | App-specific Tailwind plugins |
| `cn()` utility | App state management |

## Adding new components

1. Create `src/components/YourComponent.tsx`
2. Export from `src/index.ts`
3. All apps get it on next `pnpm install`

## Brand tokens at a glance

| Token | Value | Use |
|---|---|---|
| `--hk-cyan` | #01ECFF | Primary highlight, CTAs |
| `--hk-teal` | #00A5B8 | Secondary actions, links |
| `--hk-orange` | #FD8A03 | Accent, warnings |
| `--hk-navy` | #032053 | Sidebar, dark surfaces |
| `--signal-green` | 142 71% 45% | Success, active |
| `--signal-amber` | 38 93% 51% | Warning |
| `--signal-red` | 0 84% 60% | Error, critical |

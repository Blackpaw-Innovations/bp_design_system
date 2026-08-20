# @blackpaw/ui — Blackpaw Design System

Single source of truth for all Blackpaw/Hakiqa brand tokens, design utilities, and shared React components.

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

**Step 2 — Import tokens** in your app's `src/index.css`, before any app-specific overrides:

```css
@import '@blackpaw/ui/tokens';

/* Override the semantic layer only — never the --bp-* raw layer, and never
   invent a new custom property (--background, --foreground, etc.) that
   brand.css doesn't already define; Tailwind's bg-background/text-foreground
   classes resolve to --color-bg/--color-ink, not to those names directly. */
@layer base {
  :root {
    --color-bg: ...;
    --color-ink: ...;
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

Values live in exactly one place — `src/tokens/brand.css` — as a two-layer model:
raw brand values (`--bp-*`) and a semantic layer (`--color-*`) that components and
apps should consume instead. See `AGENTS.md` for the full model, including the
`[data-identity]` override layer.

| Token | Value | Use |
|---|---|---|
| `--bp-cyan` | #01ECFF | Primary highlight, CTAs |
| `--bp-teal` | #00A5B8 | Secondary actions, links (`--color-accent` default) |
| `--bp-orange` | #FD8A03 | Accent, warnings |
| `--bp-navy` | #032053 | Sidebar, dark surfaces, hero fills |
| `--bp-success` | 153 82% 30% | Success, active — AA-contrast corrected |
| `--bp-warning` | 32 100% 39% | Warning — AA-contrast corrected |
| `--bp-danger` | 0 64% 47% | Error, critical — AA-contrast corrected |
| `--bp-info` | 217 91% 60% | Informational |

Tailwind classes (`bg-hk-cyan`, `text-signal-red`, `bg-card`, `text-muted-foreground`,
etc.) are wired to these same tokens via `tailwind.preset.js` — no class in this
package resolves against a custom property that isn't defined in `brand.css`.

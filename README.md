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

# AGENTS.md

This is `@blackpaw/ui` — the single source of truth for Blackpaw and Hakiqa's
visual identity, design tokens, and shared React components. Read this before
touching anything here, and before building a new product against it.

## What this repo owns

- **Design tokens** — every color, radius, motion duration/easing, spacing
  value, and font role, in `src/tokens/brand.css`.
- **Semantic component styles** that consume those tokens, in
  `src/tokens/components.css` and `src/tokens/utilities.css`.
- **Shared React components** (`src/components/`) — layout shell, command
  palette, status/toast/empty-state/loading patterns, KPI display.
- **The Tailwind preset** (`tailwind.preset.js`) apps extend.
- **The brand-language documentation site** (`docs/`) — generated content
  describing the above, not an independent source of values.
- A **licensed font reference archive** (`font-library/`) — not shipped in
  the npm package; see its own README.

## What this repo does NOT own

- **Hakiqa Duka's own product prototype** (its shell, pages, business logic)
  — that lives in `hakiqa-handoff/` only as reference/audit material for that
  one product, not as part of the shared system. Don't treat anything in
  `hakiqa-handoff/assets/app-shell.css` or `app-shell.js` as canonical for
  new products; treat it as prior art to consult when porting a pattern into
  `src/`, the way `src/tokens/components.css` already did for `.slide-over`,
  `.overlay`, and `.hq-kpi-card`.
- **Odoo modules, email/SMS templates, PDF/report layouts, and Managed Odoo
  client theming** — guidance for these lives in `docs/odoo-branding.md` and
  `communications/`, but the actual Odoo addon code, transactional copy at
  scale, and report templates are each their own workstream in their own
  repo, informed by these tokens, not built here.
- **Terminology and tone-of-voice as ratified policy.** `docs/terminology.md`
  and `docs/tone-of-voice.md` are drafted proposals pending Blackpaw
  sign-off (see each file's own header) — useful defaults, not settled law,
  until someone at Blackpaw confirms them.

## The token model — read this before changing any visual value

Three layers, in `src/tokens/brand.css`:

1. **Raw layer, `--bp-*`.** The only place a literal color/radius/duration
   value is allowed to live. `brand.css` only.
2. **Semantic layer, `--color-*`.** Points at the raw layer. Components read
   *this*, never `--bp-*` directly (except `--bp-radius-*`/`--bp-dur-*`/
   `--bp-ease-*`/`--bp-space-*`/`--bp-shadow-*`, which have no semantic
   indirection because they don't vary by identity).
3. **Identity layer, `[data-identity="…"]`.** Re-points the semantic layer
   per app-brand (`finance`, `planner`, `flamex`, `bicc`). One attribute
   changes the whole look; components never fork.

A fourth, lighter mechanism, `[data-vertical="…"]` (added in `brand.css`
alongside the identity layer), sets only `--color-accent-h` per Hakiqa
vertical (Duka/Gym/Rental/Optical/Garage/Mjengo) — everything else stays the
shared Hakiqa skin. Don't confuse the two: an *identity* is a different
company/product with its own character; a *vertical* is a Hakiqa product
line sharing everything except its accent and icon.

**The rule that was broken and is now enforced by CI:** every `var(--x)`
referenced anywhere under `src/` must resolve to an `--x:` declared in
`src/tokens/brand.css`, `components.css`, or `utilities.css`. Run
`node tooling/check-tokens.mjs` before you push — it's the same check CI
runs, and it exists because this exact rule was silently broken for weeks
(two non-overlapping token vocabularies shipped in the same package; see
`CHANGELOG.md`'s Unreleased section for the specifics).

## The Reconciliation Codex — a known gap, not settled

Component doc comments repeatedly cite a **"Reconciliation Codex"**
(`C1`–`C5` so far) and numbered **"Commandments"** governing rules this code
visibly follows:

| Ref | What it's known to say (from code comments) |
|---|---|
| Codex C1 | One component per UI pattern — never a second markup/class system for something `components.css` already styles (`StatusChip.tsx`) |
| Codex C2 / Commandment 20 | Consolidate duplicate KPI-tile components into one (`KpiStat.tsx`) |
| Codex C3 / Commandment 15 | Retire modals for record editing in favor of the shared slide-over mechanic (`SlideOver.tsx`) |
| Codex C4 | One toast notifier, one visual spec, replacing page-local implementations (`Toast.tsx`) |
| Codex C5 / Commandment 14 | Mascot pose comes from a 7-key `brandAssets` map, never a hardcoded string literal (`HakiTip.tsx`) |
| Commandment 8 | Hero card is scarce — one per row/group, never a flat fill (`KpiStat.tsx`, `components.css`) |
| Commandment 11 | Number formatting: commas below 1,000, `K` above, `M` above 1,000,000, never a bare decimal (`fmtKM`, `KpiStat.tsx`) |
| Canon 1 / Commandment 30 | Signal colors must match `app-shell.css`'s `--pos`/`--warn`/`--neg` exactly — the AA-contrast-corrected values (`brand.css`) |

**This document does not exist anywhere in this repository.** It's evidently
the real constitution the code follows, and it lives somewhere else — most
likely inside the Hakiqa Duka product repo, based on `hakiqa-handoff/
AUDIT_REPORT.md`'s own "Rules for anyone editing" section. Until it's
located and either imported here or linked from this file, treat the table
above as the complete list of what's independently verifiable — don't infer
or invent a "Commandment 9" to fill a gap; ask, or check `hakiqa-handoff/`
and sibling repos first.

## Adding a component

1. `src/components/YourComponent.tsx`. Style it through `components.css`
   classes or Tailwind utilities backed by the preset — no inline hex/px.
2. Export it (and its prop types) from `src/index.ts`.
3. JSDoc with a real usage example (see `EmptyState.tsx`). If it replaces
   page-local duplicates you found in a product, say which ones and where —
   that history is what stops the duplicate from coming back.
4. Run `node tooling/check-tokens.mjs`.

## Changing a token

Edit `src/tokens/brand.css` only. If the change affects a signal color,
radius, or anything cited as matching `app-shell.css` (see the Codex table
above), verify against that file too, not just this repo — they're
documented to be kept in sync by hand, not generated from one source (a real
gap; see `docs/odoo-branding.md`'s note on why this repo doesn't yet own
that reconciliation).

## Releases and downstream updates

Tag `vX.Y.Z`, bump `package.json`'s `version` in the same commit (this was
previously frozen at `1.0.0` across nine tags — don't repeat that). Update
`CHANGELOG.md`. Today, consumption is a pnpm workspace link
(`"@blackpaw/ui": "workspace:*"`) — that only reaches apps inside this same
workspace. A product in its own separate repo cannot currently pull an
update from here at all; that's a real gap (see the Gap Matrix in the
brand-system audit), not a workflow to follow until a registry-publish step
exists.

## What may be overridden vs. what may not

- Apps may override the **semantic layer** (`--color-*`) — that's what it's
  for. Apps must never override or shadow a **raw** `--bp-*` token; if a raw
  value is wrong for an app, that's a bug in `brand.css`, fix it there.
- `AppShell.tsx` exposes two explicit override hooks —
  `--sidebar-border`/`--admin-nav-border`, both with safe CSS fallbacks — as
  the only sanctioned unstyled escape hatches. Don't add another one without
  documenting it here.
- A new `[data-identity]` (a new company/product) or `[data-vertical]` (a
  new Hakiqa product line) both belong in `brand.css`, reviewed by whoever
  owns brand decisions (`CODEOWNERS`) — never invented ad hoc in a
  consuming app.

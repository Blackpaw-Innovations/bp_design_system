# Changelog

All notable changes to `@blackpaw/ui` are recorded here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/); versioning is SemVer
(`MAJOR.MINOR.PATCH`), tagged as `vX.Y.Z`.

Entries through v1.7.1 are reconstructed from existing git tag messages —
`package.json`'s `version` field had been frozen at `1.0.0` since the first
tag and was never bumped alongside them (see Unreleased below). Going
forward, bump `package.json`'s `version` in the same commit as the tag.

## [Unreleased]

### Fixed
- **Token vocabulary fork (critical).** `src/tokens/utilities.css` and
  `tailwind.preset.js` referenced `--hk-*`, `--signal-*`, and shadcn-style
  custom properties (`--background`, `--card`, `--primary`, `--radius`,
  `--duration-*`, …) that `src/tokens/brand.css` never defined — every class
  built on them rendered with no color, radius, or motion. Rewritten against
  the real `--bp-*`/`--color-*` tokens; same fix applied to the same bug
  pattern in `AppShell.tsx`, `CommandPalette.tsx`, and `MetricCard.tsx`'s
  inline styles.
- **Docs shipped a reverted accessibility fix.** `docs/assets/bdl-tokens.css`
  hardcoded the pre-AA-contrast signal colors that `brand.css` deliberately
  replaced. Synced to the corrected values.
- **`package.json` version desynced from git tags.** Bumped to `1.8.0` to
  match this release; wire the bump into future tag pushes (see
  `CONTRIBUTING.md`).

### Changed
- Deduplicated `docs/` and `hakiqa-handoff/` — the latter now holds only
  Hakiqa Duka product-specific material, with a README pointing to `/docs`
  for the canonical brand-language pages.
- Reconciled mascot artwork: `src/assets/`, `docs/assets/`, and
  `hakiqa-handoff/assets/` now match `hakiqa-handoff/assets/mascot/`, the
  documented single source of truth (three diverging copies existed before).

### Added
- `AGENTS.md`, `CONTRIBUTING.md`, `CODEOWNERS`, `SECURITY.md`, `LICENSE`,
  `tsconfig.json`, and a CI workflow (typecheck + a token-consistency check,
  `tooling/check-tokens.mjs`).
- `src/tokens/breakpoints.css` — the responsive scale from Hakiqa Duka's
  `app-shell.css` ported into the shared package.
- `src/components/ImpersonationBanner.tsx` — a shared impersonation pattern.
- `docs/terminology.md`, `docs/tone-of-voice.md`, `docs/odoo-branding.md` —
  see each file's own header for review status; several are explicitly
  flagged as proposals pending sign-off, not ratified policy.
- Hakiqa-vertical accent tokens (`[data-vertical]`) in `brand.css` for Duka,
  Gym, Rental, Optical, Garage, and Mjengo.
- `communications/` — starter transactional email templates built on the
  shared tokens.
- `:focus-visible` styling for `.btn`/`.chip`/`.hk-sidebar-link`/`.tap-target`
  in `src/tokens/utilities.css` (previously undefined anywhere in the shared
  CSS).

## [1.7.1] — 2026-08-12
Include `tailwind.preset.d.ts` in the published `files`.

## [1.7.0] — 2026-08-12
Fix cross-package icon/tailwind-config type collisions.

## [1.6.0] — 2026-08-11
Add `KpiStat` (Codex C2) + `fmtKM`.

## [1.5.0] — 2026-08-11
Add `SlideOver` (Codex C3) + dark-mode fix for the default skin.

## [1.4.0] — 2026-08-11
Add `HakiTip`.

## [1.3.0] — 2026-08-11
Add `Toast` / `useToast` / `ToastProvider`.

## [1.2.0] — 2026-08-11
`StatusChip` icon support + extended status table.

## [1.1.0] — 2026-08-11
Add `StatusChip`; AA-contrast fix; dependency/type fixes.

## [1.0.0] — 2026-07-27
Initial tagged release for cross-repo consumption (`hakiqa-connect`).

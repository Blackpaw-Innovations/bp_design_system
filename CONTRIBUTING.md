# Contributing to @blackpaw/ui

This package is consumed by every Blackpaw and Hakiqa product — a change here
is a change everywhere at once. Read `AGENTS.md` first; it defines what this
repo owns, what it doesn't, and the token/naming rules below exist to enforce.

## Before you open a PR

- **Colors, radii, durations, easings, fonts** come from `src/tokens/brand.css`
  only. Never introduce a new custom property outside that file, and never
  hardcode a hex/px/ms value in a component or utility class — reference an
  existing `--bp-*`/`--color-*` token, or add one to `brand.css` if the value
  is genuinely new.
- Run `node tooling/check-tokens.mjs` before pushing — it fails if anything
  under `src/` references a custom property `brand.css` doesn't define. CI
  runs this on every PR, but it's instant locally.
- A new component: add it under `src/components/`, export it from
  `src/index.ts`, and give it the same usage-example JSDoc style as the
  existing ones (see `EmptyState.tsx`) — that JSDoc is what downstream
  consumers and coding agents actually read.
- If a component replaces several page-local duplicates you found in a
  product, say so in the component's doc comment (see `SlideOver.tsx` for the
  pattern) — that history is what stops the duplicate from coming back.

## Design-token or identity changes

Anything under `src/tokens/`, `tailwind.preset.js`, or a new `[data-identity]`
skin affects every downstream product's visual output. These need a second
reviewer even on a one-line PR — see `CODEOWNERS`.

## Versioning

We tag releases with SemVer (`vX.Y.Z`) and bump `package.json`'s `version`
field in the same commit as the tag — see `CHANGELOG.md` for the convention.
Do not bump the version as part of an unrelated change.

## Reporting a security issue

Do not open a public issue — see `SECURITY.md`.

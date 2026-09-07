# Blackpaw design-system instructions for coding agents

This repository is the canonical source for Blackpaw and Hakiqa brand implementation. Read this file before creating an app, document, presentation, campaign, component, or customer-facing interface.

## Required reading order

1. `BRAND.md` — the quick decision guide.
2. `docs/brand/BRAND_FOUNDATION.md` — purpose, positioning, promise, and doctrine.
3. `docs/brand/BRAND_GUIDELINES.md` — visual and application rules.
4. `docs/brand/VOICE_AND_MESSAGING.md` — approved language and claims.
5. `src/assets/asset-manifest.json` — approved asset IDs and usage metadata.

Use `docs/index.html` as the human-facing navigator. Detailed files remain authoritative when the portal summarizes them.

## Non-negotiable implementation rules

- Use Urbanist in every Blackpaw-built app. Load the repository font files from `font-library/Urbanist/`; do not substitute another UI font.
- Use semantic tokens from `src/tokens/index.css`. Do not copy hex values into application components.
- Default Blackpaw business documents to Clear mode: Light Blue and White, with Purple for focus.
- Choose another expression mode only when the content's job calls for it: Authority, Human, Precision, or Signature.
- Use Hakiqa's own identity tokens and approved assets for Hakiqa surfaces; do not recolour Hakiqa into Blackpaw.
- Preserve the customer experience doctrine: **Low effort in front. High rigour behind.** Aim for one obvious primary action and no more than three meaningful user steps for a core task.
- Use approved assets by manifest ID. Never recreate, trace, stretch, recolour, or improvise a logo.
- Do not invent a tagline, product claim, colour, typeface, mascot pose, or brand rule. If the system does not cover the need, flag it for brand review.

## Where to find things

| Need | Canonical location |
|---|---|
| CSS tokens and themes | `src/tokens/` |
| Tailwind mapping | `tailwind.preset.js` |
| React components | `src/components/` |
| Approved brand assets | `src/assets/brand/` |
| Asset usage metadata | `src/assets/asset-manifest.json` |
| Urbanist font files and licence | `font-library/Urbanist/` |
| Document template | `docs/templates/blackpaw-document.html` |
| Brand rules | `docs/brand/` |
| Public portal | `docs/index.html` |

## Before handing work over

Run `npm run check:brand`. Check keyboard use, contrast, responsive layout, plain-language labels, loading, empty, error, permission, and recovery states. Record any approved exception in the pull request; do not silently create a parallel standard.

## Mandatory consumer gate

Every new or materially changed Blackpaw/Hakiqa application must pin
`@blackpaw/ui`, commit a `blackpaw.conformance.json` route/state/task contract,
and run both the static consumer checker and the shared Playwright conformance
suite in pull-request and main-branch CI. New verticals start with zero
exceptions. Existing products may use only an explicitly approved, owned and
expiring baseline that blocks every regression and has a zero-debt burn-down.

Do not describe a product as design-conformant from screenshots, a manual
review, or a passing build. Conformance requires DS-01–DS-13 evidence tied to
the same release commit and environment. A failed or absent gate blocks
production promotion.

This is independent of Project Ironclad's architecture gate. Car Parts remains
the proving vertical for cross-vertical architecture; this repository remains
the authority for design and experience conformance. Passing either gate does
not imply passing the other, and future verticals must satisfy both applicable
gate families.


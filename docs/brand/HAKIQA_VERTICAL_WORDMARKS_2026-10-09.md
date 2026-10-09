> Applied in design system v1.10.3: files in `src/assets/brand/hakiqa/logo/product/verticals/`, manifest IDs `hakiqa.logo.vertical.<id>.light|dark`, summary rules in `HAKIQA_LOGO_USAGE.md`. Open decision: which Duka file is the default (all-navy `logo/product/hakiqa-wordmark-duka` or the orange-name `verticals/hakiqa-wordmark-duka`).

# Hakiqa vertical wordmarks v3 (approved 9 Oct 2026)

Wordmark-only product logos for every Hakiqa Connect vertical, built on the approved Hakiqa Duka system. Names follow the app names in `hakiqa-connect/src/framework/manifest.ts`; Tailor + Build is split into **Tailor** and **Mjengo**.

## Construction (do not redraw)

- **Hakiqa**: the approved capitalised wordmark outlines, copied verbatim from `logo/product/hakiqa-wordmark-duka.svg`.
- **Half-laptop symbol** (concept 3a, approved): the left screen + left base of the approved Hakiqa symbol, unchanged shapes, downsized to 280 units tall and set 30 units below the baseline. Screen = family colour; base = navy on light, white on dark. On dark files the base is knocked out 22 units around the screen so same-colour panels stay separate.
- **Vertical name**: Urbanist SemiBold (600), lowercase, +16 units tracking, outlined. Sized so its x-height matches Hakiqa's (scale 0.18) and sits on Hakiqa's baseline, so the two read as one word.
- **Spacing**: Hakiqa → symbol 64 units, symbol → name 52 units.
- **Stacked**: Hakiqa centred over a symbol + name row; the row is never wider than Hakiqa.

## Colour families

The name carries one accent per family; **Hakiqa** stays navy on light fields and white on dark.

| Family | Light field | Dark field | Verticals |
|---|---|---|---|
| Orange · commerce & trade | Orange name | Orange name | duka, car parts, imports, events, rentals |
| Teal · care & daily services | Teal name | Cyan #01ECFF name | optical, gym, salon + spa, car wash, dairy |
| Red · making, building & places | Red name | White name (red is 2.9:1 on navy) | tailor, mjengo, field connect, properties, stay |

Orange on white is 2.4:1: use orange-family light versions at logo sizes only (name ≥ 24 px tall), never as small UI text.

## Files (per vertical)

`hakiqa-wordmark-{id}`, `-white`, `-stacked`, `-stacked-white`, each as SVG and transparent PNG.

IDs: `duka`, `car-parts`, `imports`, `events`, `rentals`, `optical`, `gym`, `salon-spa`, `car-wash`, `dairy`, `tailor`, `mjengo`, `field-connect`, `properties`, `stay`.

## Rules

1. Default files on white, warm white or light grey; `-white` files on navy or dark photos.
2. Never retype the name, change the family colour, or change the weight.
3. Horizontal is the default (app headers, web, documents). Stacked is for square or narrow spaces (splash screens, merch, social).
4. Use `hakiqa-mark-full` beside these only as a separate element; no mark + vertical lockups until approved.

## What this changes

- v3 replaces the single-panel v2 draft and the 9 Oct v1 draft (Medium 500 name, larger than Hakiqa's x-height, grey divider), which was never committed.

- `logo/product/hakiqa-wordmark-duka.svg` (all navy) stays valid. `verticals/hakiqa-wordmark-duka` adds the orange-name version; choose one as the Duka default on approval.
- `hakiqa-wordmark-connect` (the platform) is unchanged. `field-connect` is the Field Connect vertical, not the platform.
- Add all files to `asset-manifest.json` under `hakiqa/logo/product/verticals/`.

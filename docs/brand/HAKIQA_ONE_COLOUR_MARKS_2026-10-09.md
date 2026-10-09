> Applied in design system v1.10.2: files in `src/assets/brand/hakiqa/logo/symbol/` (manifest `hakiqa.logo.symbol.red|teal|cyan`), field rules in `HAKIQA_LOGO_USAGE.md`, all `*-full-dark` and `*-gloss` logo files marked deprecated (`*.withdrawn` groups).

# Hakiqa one-colour marks + field rules (approved 9 Oct 2026)

Approved by Marvin on 9 Oct 2026 on `Logo Approval.dc.html` (rounds 5–7). Drop the files into `src/assets/brand/hakiqa/logo/symbol/`, add them to `asset-manifest.json`, and add the rules below to `docs/brand/HAKIQA_LOGO_USAGE.md`.

## New files

| File | Colour | Use on |
|---|---|---|
| `hakiqa-mark-red.svg` / `.png` | Red #D0181F | White, warm white, light neutrals |
| `hakiqa-mark-teal.svg` / `.png` | Teal #00A5B8 | Navy and dark fields |
| `hakiqa-mark-cyan.svg` / `.png` | Cyan #01ECFF (`--bp-cyan`) | Navy and dark fields only |

Same geometry as the approved symbol: the white one-colour SVG with its fill changed. PNGs are 2048 × 2048, transparent.

## Field rules (new)

1. **`hakiqa-mark-full` is the official mark.** Use it for official use and for all logo animation, on neutral fields only: white, warm white, light grey.
2. **Never put the full-colour mark on navy, orange or teal.** One panel disappears.
3. **On a brand-colour or dark field, use a one-colour mark.** White or orange are the defaults on dark.
4. **Pair each colour with a field it contrasts with:**
   - **White:** navy and dark. On orange it is 2.4:1, so use it large only.
   - **Orange:** navy and dark. Not on white (2.4:1).
   - **Teal:** navy and dark. Borderline on white.
   - **Cyan:** navy and dark only. Fails on white.
   - **Red:** white and light fields. Not on navy (2.9:1).
   - **Navy and black:** light fields and print.
5. **No sticker tile is needed** to place the mark on a dark field.
6. **No gloss, shine or glow** on any logo.

## What this replaces

- **`hakiqa-mark-full-dark` is withdrawn.** Its light-blue base (#557CB9) is not a Hakiqa colour. Use a one-colour mark on dark fields instead. Retire `hakiqa-lockup-*-full-dark` in the same way.
- **The guidance to use the full mark with a matched dark file is replaced.** The rule is now: full colour on neutral fields, one colour on everything else.
- Unchanged: `full`, `gloss` (legacy file, not for new work), `orange`, `navy`, `white`, `black`, `duotone-orange-navy`.

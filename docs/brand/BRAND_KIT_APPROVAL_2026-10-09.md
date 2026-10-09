# Brand kit approval / 9 October 2026

Marvin (brand owner) approved the complete Blackpaw and Hakiqa brand kit on 9 October 2026 and asked for it to become the design-system source. This is the versioned record required by `BRAND.md`.

## What is approved

**Blackpaw identity kit v2** (source: `C:\LocalHost\blackpaw-identity-kit`, published 9 Oct 2026)
- **Main logo: the bp symbol** (the gradient mark), in `blackpaw/logo/mark`. When the name must appear, prefer the stacked lockup (`blackpaw/logo/stacked`).
- BLACK/PAW wordmark and type lockups (set 6), in `blackpaw/logo/wordmark-lockups`: approved options, **not** the main logo. Where the kit notes call set 6 "primary", this decision overrides them.
- Logo collection set 5: mark, horizontal and stacked, transparent and on midnight, ink navy, gradient and white backgrounds; taglines.
- Transparent pack, no-tagline masters, digital icons and favicon, print (mono, engraving, thermal receipt), graphics (backgrounds, pattern, signature rules, clear-space guide, stickers).
- Every PNG is the approved original. Each SVG is a vector reconstruction of the same design (see `BLACKPAW_IDENTITY_KIT_V2.md`); proof before colour-critical print.
- Colour rules: midnight `#140F33` for digital, flat ink navy `#0A0A3A` for print, warm white `#FBF7F2` on dark, no pure-black backgrounds, one wordmark B-height of clear space.
- The earlier Blackpaw files in `blackpaw/logo/` (tagline lockups, signature gradient) are now `deprecated`. They remain only so existing consumers do not break.

**Hakiqa**
- **Main logo: the full-colour symbol `hakiqa-mark-full`** (`src/assets/brand/hakiqa/logo/symbol/hakiqa-mark-full.png` / `.svg`, manifest ID `hakiqa.logo.main`). This is the official Hakiqa logo for all official use. Other colour treatments are only for backgrounds where it does not show properly.
- Symbol (8 treatments), capitalised and script wordmarks (script vector trace included), horizontal and stacked lockups (capitalised and script), Duka and Connect product wordmarks.
- App icons, favicons, social avatar; stamp, receipt logo, pattern, shapes and stickers.
- Logo motion (assemble, breathe, lockup reveal: MP4, animated SVG, Lottie) and the sonic logo. Previously review proposals, now approved.
- Haki mascot: core, campaign and occasion poses (from PR #7, now approved) plus the new by-industry sets, excited and calm, 17 verticals each.
- Usage guide: `HAKIQA_LOGO_USAGE.pdf` / `.md` / `HAKIQA_LOGO_GUIDELINES.html`.

## Update, later on 9 October 2026

Red, teal and cyan one-colour Hakiqa marks added, and Hakiqa field rules approved: full colour on neutral fields only, a one-colour mark on brand-colour or dark fields, no gloss on any logo. All `full-dark` and `gloss` Hakiqa logo files are withdrawn (deprecated). See `HAKIQA_ONE_COLOUR_MARKS_2026-10-09.md` and the field rules at the top of `HAKIQA_LOGO_USAGE.md`.

**Vertical logos:** 15 Hakiqa Connect vertical wordmarks (horizontal, stacked, light and dark; 120 files) approved. See `HAKIQA_VERTICAL_WORDMARKS_2026-10-09.md`.

**Logo animations (final set, end of the rendering round):** Blackpaw Infinity, Signature, Sweep and Unfold on midnight, ink navy and warm white; Hakiqa Breathe, Lids, Reveal and Haki on white, warm white and navy. MP4 files named by background, in `src/assets/brand/{blackpaw,hakiqa}/motion/logo-animations/` (manifest `*.motion.logo-animation.<name>`).

## Where it lives

| Need | Path |
|---|---|
| Blackpaw logos | `src/assets/brand/blackpaw/logo/{mark,stacked,horizontal,tagline,wordmark-lockups,transparent-pack,no-tagline}` (main logo = `mark`) |
| Blackpaw icons, print, graphics | `src/assets/brand/blackpaw/{digital,print,graphics}` |
| Hakiqa logos | `src/assets/brand/hakiqa/logo/{symbol,wordmarks,lockups,product}` |
| Hakiqa icons, applications, stickers | `src/assets/brand/hakiqa/{digital,applications,stickers}` |
| Hakiqa motion and sound | `src/assets/brand/hakiqa/motion/{logo,sonic}` |
| Haki mascot | `src/assets/brand/hakiqa/mascot/` (+ `occasions/`, `industries/{excited,calm}`) |
| Usage metadata | `src/assets/asset-manifest.json` (v1.4.0) |
| Hakiqa main logo | `src/assets/brand/hakiqa/logo/symbol/hakiqa-mark-full.png` (`hakiqa.logo.main`) |

## Kept out of this repository

Video ads, draft animatics and 3D material renders (about 180 MB) are campaign media, not design-system assets. They stay in Marvin's Brand Kit folder (`Documents\Brand Kit`) and the LocalHost `output` / `video-output` working folders.

## Brand resolutions (9 Oct 2026)

`BRAND_RESOLUTIONS_2026-10-09.md` settles the contradictions found in the guidelines audit: Blackpaw voice type (Google Sans + JetBrains Mono), Urbanist in every app, one coral on light (#FE635F), the retired colours, the new gradients 1a to 1d, document modes, and the new proposition "We make complex businesses easier to run." Where an older doc in this repo disagrees, the resolutions win.

The proposed tokens are in `brand-tokens-proposed-2026-10-09.css`. They are a draft and are **not** merged into `src/tokens/brand.css` until signed off.

## Still to do

- Swap consumers (apps, blackpawinnovations.com, documents) from the deprecated Blackpaw files to the v2 IDs.
- Warm-white tagline variants and original-source SVG masters remain open items in the Blackpaw kit notes.

# Copilot prompt: Blackpaw documents and proposals

Paste everything between the lines into Copilot (or any AI assistant) at the start of a new document, proposal, profile or report. Fill in the three brackets.

---

You are building a Blackpaw Innovations document. Follow the Blackpaw design kit in the GitHub repo **Blackpaw-Innovations/bp_design_system** (branch main). Do not invent styles.

**Read these first, in this order, and follow them over anything you assume:**
1. `BRAND.md` (messaging hierarchy)
2. `docs/brand/BRAND_RESOLUTIONS_2026-10-09.md` (approved decisions; wins over older docs)
3. `docs/brand/VOICE_AND_MESSAGING.md`
4. `src/tokens/brand.css` and `src/tokens/brand-tokens-additions.css` (use the CSS variables; no raw hex where a token exists)
5. `src/assets/asset-manifest.json` (find logo files here)

**Document:** [type: proposal / company profile / report / one-pager]
**For:** [client or audience]
**Cover option:** [light blue / midnight / navy]

**Layout and colour (proposal look):**
- Inner pages: white #FFFFFF, panels and tables light blue #EBEAFA, accent electric blue #3228CF, text deep navy #0D0D50, secondary text #3D3760.
- Covers, one of three: light blue #EBEAFA with navy text; midnight #140F33 with warm-white #FBF7F2 text and a soft violet #7A2FA8 glow; navy #0D0D50 with white text.
- Section transition pages: one clean abstract image (glass, brushed metal, stone, light) on #09081A. #09081A is used only here and behind a one-colour logo.
- Purple #451D6A only when the document is about one specific product or offering.
- Gradients are thin rules and big numerals only, never backgrounds, never behind the logo:
  - On light: `--bp-gradient` #FE635F → #8441B1 → #3228CF
  - On dark: `--bp-gradient-dark` #FF8A7A → #B455C0 → #6A7BFF
  - Charts and data: `--bp-gradient-offering` #8441B1 → #5946F5 → #3228CF
- Coral: #FE635F on light, #FF8A7A on dark; short labels and buttons only.
- Retired, never use: #F4F3F8, #030347, #00A69C, #F8F7FF, legacy green, the pastel pink-lavender gradient, pure black backgrounds.

**Type:**
- Google Sans (`font-library/Google_Sans/`) for all text: headings 500, body 400. Body 10.5 pt, line height 1.6, never under 9 pt. Headlines in sentence case.
- JetBrains Mono for figures, prices, dates, IDs and short labels (caps, +8% tracking, under four words).
- Do not type in Urbanist (apps only), Newsreader, Manrope, Gotham or Montserrat.

**Logo:**
- Use files from `src/assets/brand/blackpaw/logo/` exactly as supplied. Never redraw, recolour, stretch, rotate, add shadows or retype the name.
- Covers: stacked lockup (`transparent-pack/bp-transparent-stacked-light.svg` on light, `-dark` on midnight or navy).
- Letterhead and running headers: horizontal lockup (`transparent-pack/bp-transparent-horizontal-light-no-tagline.svg`), at least 18 mm wide.
- Footers and slides: the mark (`transparent-pack/bp-transparent-mark-light.svg` / `-dark`).
- One colour: `print/bp-horizontal-mono.svg`, `transparent-pack/bp-transparent-mark-ink.svg`; over photos or brand colour use the `-warmwhite` files.
- Clear space: one wordmark B height on every side.
- Tagline "Inspiring the Extraordinary" only as the supplied tagline files (`tagline-display-*`, `tagline-line-*`), at most once per document, usually the back cover.
- Deprecated, never use: `blackpaw-lockup-tagline-*.png`, `blackpaw-signature-gradient.png`.

**Words:**
- Proposition (cover or opening): "We make complex businesses easier to run."
- Call to action: "Book a consultation".
- Blackpaw Innovations is a partnership; never write "Limited".
- No absolute or unsourced claims ("seamless", "effortless", "automate 80%"). Numbers need a source the client approved.
- Odoo is the engine we build on, not who we are.
- Screenshots use demo data and are labelled "Demo data".

**Before you finish, check:** every colour is from the list above, every logo is a repo file, no text under 9 pt, every text pair is at least 4.5:1 contrast, and nothing from the retired list appears.

---

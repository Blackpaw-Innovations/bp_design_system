# Font library

Licensed reference copies of the typefaces Blackpaw uses or has used, kept here
so a broken Google Fonts fetch (or a `font-display: swap` race baking a
fallback font into a rendered PDF — the bug that prompted this folder) has a
source of truth to recover from. All families are SIL Open Font License
(`OFL.txt` in each family folder) — free to bundle, embed, and self-host.

**This folder is intentionally not published.** It's excluded from the npm
package (`package.json`'s `files` field only lists `src`, `tailwind.preset.*`),
so it adds nothing to `@blackpaw/ui`'s install size. It's a repo-local
reference archive, not a runtime dependency.

## Active in the Blackpaw Design Language

These three are wired into `bdl-tokens.css` (see `hakiqa-connect/design/handoff/assets/bdl-tokens.css`)
and are the ones actually shipping on Blackpaw products today:

| Family | Token | Role |
|---|---|---|
| **Urbanist** | `--bp-font-ui` | UI / body text — the default face across Hakiqa, Connect, Admin |
| **Newsreader** | `--bp-font-display` | Display / headline serif — editorial gravitas (also used standalone, e.g. the BICC identity skin) |
| **Manrope** | `--bp-font-label` | Labels, eyebrows, uppercase micro-text |

When self-hosting any of these (as opposed to linking Google Fonts), pull the
static weight you need from `<Family>/static/`, or the single variable file
at the family root for a full weight range in one file.

## Reference only

Not currently wired into any token file — kept here in case a future product
or identity skin needs them, so nobody has to re-download and re-verify
licensing from scratch:

- **Roboto** — Android system default; useful if a product ever needs to match native platform type
- **Montserrat**
- **Google Sans** — note the large variable-font files (this family alone is ~41MB)
- **Oswald**

## Adding a font here later

Drop the official family folder in as-is (keep `OFL.txt` — it's the license,
not boilerplate) and add a row to whichever table above applies.

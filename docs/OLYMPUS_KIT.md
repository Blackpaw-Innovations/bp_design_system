# Olympus component kit

Status: Wave 0b of the Olympus build · 12 Nov 2026 · copied from the approved renders (`olympus-kit.reference.css`)

The kit is built on the night system (`docs/OLYMPUS_NIGHT_SYSTEM.md`). The components are in `src/components/Olympus.tsx` and the styles in `src/tokens/olympus-kit.css`; both load through `@blackpaw/ui` and `@blackpaw/ui/tokens`. Light is the default. Put `dk` on the screen root for dark mode. The demo page is `docs/examples/OlympusKit.example.tsx`; it shows every part in both modes.

The class names start with `ol-`. The reference uses short names such as `.card`, `.row` and `.light`, which are too generic to ship globally.

| Component | Props | Reference |
|---|---|---|
| `Mast` | `title`, `strong` (the weight-500 part), `sub`, `right`, `kpis: {value, label, note?}[]`, `photo?`, `craft?`, `seed?` | `.mast`, `.mbg`, `.kpis` |
| `Hero` | `kicker`, `title`, `strong`, `chip`, `sub`, `figures: {value, label}[]`, `actions`, `craft`, `children` | `.hero` |
| `Card` | `as`, `selected`, `interactive`, plus any HTML attribute | `.card` |
| `CardTitle` | heading attributes | `.h2` |
| `Row` | `title`, `detail`, `left`, `right`, `selected` | `.row`, `.nrow.sel` |
| `Pills` | `items: {id, label, href?}[]`, `value`, `onChange`, `label` | `.pills` |
| `FilterPills` | `items`, `value`, `onChange`, `label` | `.fpills` |
| `Chip` | `tone`: `neutral`, `ok`, `warn`, `bad` or `info` | `.chip` |
| `OlAvatar` | `name`, `src?`, `size` (default 32) | `.av` |
| `HermesMark` | `size` (default 44), `needsYou`, `night`, `label` | `.hermes` |
| `NeedsYou` | `children`, `active`, `radius`, `gap` | `.tile.led`, `.led` |
| `Ring` | `value`, `total`, `size` (default 22), `stroke`, `label`, `color` | `ring()` in `screens.py` |
| `Bar` | `value`, `total`, `tone`, `label` | `.bar` |
| `Callout` | `title`, `children`, `mark` (default ✓) | `.callout` |
| `AppTile` | `name`, `image`, `details`, `badge`, `href` or `onClick`, `hovered` | `.atile`, `.atile.hov` |

## Rules the components carry

- **Header band.** `Mast` draws its own sky and ends it 30 px under the KPI strip. Light mode gets the day sky, dark mode the night sky, and an app page gets its photo with the dark scrim in both modes.
  - The band bleeds behind the top bar and the rail by `--ol-mast-bleed-top`, `--ol-mast-bleed-left` and `--ol-mast-bleed-right` (90, 130 and 60 px, the renders' shell). The page column must be a stacking context, for example `isolation: isolate`, as `.main` is in the renders.
  - A KPI note that starts with `-` shows red, without the sign.
  - The craft sits 380 px from the right. Below 1100 px it is hidden so it never covers the text.
- **Hero.** It is a night panel in both modes. It carries `dk`, so everything inside it takes the dark values.
- **Selected or locked.** Use `selected` on `Card` or `Row`, or the class `ol-sel` on anything else. You get a night card on light pages and a light card on dark ones. The card redefines the text tokens, so every child that uses them inverts. Chips inside it turn neutral. It cross-fades (`ol-select`). There is never an accent bar on one edge.
- **Hover.** `Card interactive` uses `ol-lift`: the card rises 2 px with a deeper shadow and a darker hairline, and never gets a colour wash. App tiles use the renders' `.atile.hov` look: they grow to 1.07× and show their details. Keyboard focus shows the same look.
- **Needs-you glow.** `NeedsYou` and `HermesMark needsYou` turn the conic LED ring once every 5 s. Under reduced motion the ring stays still.
- **Editorial type** is available as classes: `ol-kick`, `ol-hl`, `ol-hl ol-hl-s`, `ol-stand`, `ol-byl`, `ol-key`, `ol-lbl`, `ol-med`, `ol-light`, `ol-heavy`, `ol-h1`, `ol-h2` and `ol-title`.

## Where it differs from the renders

- `.key` and `.lbl` are set in JetBrains Mono in the renders. The kit uses Urbanist at the same size and tracking, because Urbanist is the one app font.
- `Avatar` already exists (the Hakiqa colour pairs), so the Olympus profile circle is exported as `OlAvatar`.
- The kit has no buttons. On the hero the renders use a white primary and an outlined secondary button (`.hero .btn.p` and `.btn.s`); those belong to a later batch, so for now pass your own.

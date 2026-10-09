# Hakiqa app standards

**Status:** ruled 9 Oct 2026; all open decisions approved the same day. Applies to every Hakiqa vertical (Duka, Car Parts, Imports, Gym, Salon & Spa, Car wash, Dairy, Optical, Tailor & Construction, Field Connect, Properties, Stay, Events, Equipment rental) and to every new one.
**Lives at:** `bp_design_system/docs/HAKIQA_APP_STANDARDS.md`. Every app repo points here from `AGENTS.md` and `.github/copilot-instructions.md`.

## 0 · One system

There is one design system for Hakiqa apps: **`@blackpaw/ui`** (repo `bp_design_system`). Apps do not define their own buttons, cards, chips, tables, dialogs, type scale or colour.

**Precedence, highest first:**
1. This document.
2. Vivid Core tokens: identity, signal, action and the `--v-*` family in hakiqa-connect `src/index.css`. These move into `@blackpaw/ui` next.
3. `@blackpaw/ui` components and `tokens/*.css`, with `guardrails.css` last.
4. App page code.

**Where other rules apply instead:**
- **Marketing:** website, social and print follow the Hakiqa Brand Book, not this document.
- **Printed documents** (`framework/printDocument.ts`) are approved as they are and exempt.
- **Client-branded public surfaces** (the storefront template, workshop landing, public portal) use the client's colours. The function, format and accessibility rules still apply there.

**How each rule is enforced** (the "Enforced by" column in each table below):
- **CSS:** `guardrails.css` overrides the mistake when the page renders.
- **Component:** the `@blackpaw/ui` component makes the mistake impossible through its props.
- **Check:** `scripts/check-brand-rules.mjs` fails or warns in CI.
- **Conformance:** `scripts/check-vertical-conformance.mjs` checks the manifest.
- **Review:** a person checks the screenshots.

## 1 · Getting every vertical onto it

| Step | What | Enforced by |
|---|---|---|
| Import | `@import '@blackpaw/ui/tokens';` first line of the app's `index.css`. Nothing else defines tokens. | review |
| Vertical | `<html data-vertical="…">` set from the manifest id. Family colour comes from `roles.css`; pages never pick a vertical colour. | conformance |
| Theme | `useTheme()` is the only theme switch. Light (no attribute), Warm, Dark. The member portal moves to the same hook and storage key. | check `os-dark` |
| Build pages from components | `PageTitle`, `DecisionPanel`, `StatGroup`, `DataTable`, `Button`, `IconButton`, `ConfirmDialog`, `StatusChip`, `Select`, `DatePicker`, `SlideOver`, `EmptyState`, `Skeleton`, `Toast`, `Money`, `RecordId`. | check `hand-*`, `native-*` |
| Format | `formatMoney`, `formatDate`, `formatDateTime` only. | check |
| CI | `check-brand-rules.mjs` runs with the other `check-*` scripts, with `--baseline` set to today's count, and the baseline only goes down. | CI |
| Code assistants | `AGENTS.md` and `.github/copilot-instructions.md` point here and list the components. | — |
| New vertical | Section 15 checklist. | conformance + review |

## 2 · Themes

- **Three themes:** Light (default), Warm (cream surfaces, hue 83) and Dark.
- **Only surfaces change between themes.** The colour jobs (identity, signal, action, status) stay the same.
- **Never key a rule on `prefers-color-scheme` or `:not([data-theme="light"])`.** Light has no `data-theme` attribute, so that selector matches Light and Warm too. Dark rules use `[data-theme="dark"]`.
- **Surfaces use tokens only:** `v-canvas` (page), `v-surface` (cards), `v-sunken` (wells, table heads), `v-border`. No `bg-white`, no raw Tailwind colours, no hex.
- **Navy surfaces keep their colour in Dark** and gain a 1px edge (`--border-subtle`).
- **Every screen is checked** in all three themes at 400px and 1400px before sign-off.

## 3 · Colour jobs

| Job | Token | Use | Never |
|---|---|---|---|
| Identity | `--identity` #032053 | hero and decision surfaces, flat | gradients, sheens, coloured text on it |
| Where you are | `--signal` #2a6fda | active rail item, active tab, focus ring, secondary buttons, links | primary actions |
| What to do | `--action` #fd8a03 + `--on-action` #071b3c | the one primary action, attention dot, rail attention glow | text on a light ground |
| Status | `--v-pos`, `--v-warn`, `--v-crit`, `--v-info`, `--v-draft` on their own tints | chips, dots, the sentence that states the status | marketing; large fills |
| Family | `--role-family-accent` | wordmark panel, a thin product accent | buttons, nav, status |

- **On navy, text is white at full opacity.** Colour lives in a dot or chip. (CSS)
- **Orange and cyan are fills, never text.** (CSS + check)
- **No gradients, gloss or glow in app UI.** (CSS + check) The allowed exceptions, each needing a comment on the line, are:
  - the rail attention glow;
  - scroll-edge fades;
  - the skeleton shimmer;
  - data visualisation (for example the donut chart);
  - physical medal metal in the badge set;
  - photo scrims.
- **Retired:** the olive, burgundy and orange hero variants (Northstar §16), `hq-gradient`, `hq-btn-gradient` and the `.hero-card` sheen.

## 4 · Type

- **Urbanist everywhere in apps.** Manrope is retired. (CSS + check)
- **Scale:** page headline 26–34px at weight 900. Section title 20–22px at weight 800. Body 15–16px. Labels, chips, tabs and table headers 15px at weight 600–700. Nothing below 13px. (CSS + check)
- **Sentence case everywhere.** No `uppercase` and no wide tracking. Use `data-caps` only for codes such as a number plate. (CSS + check)
- **Figures use tabular numbers.**

## 5 · Page anatomy

Top to bottom:
1. **Shell.** The rail (which app) and AppTop (section title, pill-nav, notifications, one avatar). Provided by `Layout`; pages never draw their own.
2. **`PageTitle`.** One sentence with its number ("7 service requests"), two lines at most. Breadcrumbs only on drill-down pages. The entity appears once, here, and never as a chip or the line "All properties in the selected entity".
3. **`DecisionPanel`**, only when there is a decision. Flat navy, white text, one orange action and at most one white-outline secondary. At most one per view. On desktop it sits in the right column.
4. **`StatGroup`**, up to four related figures. `surface="dark"` is the page's one hero.
5. **Content:** `DataTable`, cards, forms. Facts are grouped by meaning.
6. **Side dock** (desktop, optional): `Dock` / `DockSection` / `Facts`.

**Never on a page:**
- decorative photos or objects inside data cards;
- a second hero;
- carousels with more than one set of controls;
- repeated entity chips.

## 5a · Snapshot carousel (Home)

The Home snapshot is the one carousel allowed in an app, and it follows a fixed recipe. Reference build: `Hakiqa Business Snapshot.dc.html`. Component: `<SnapshotCarousel pages={…} showAllHref renderLink />` in `@blackpaw/ui` (`src/components/SnapshotCarousel.tsx`, styles in guardrails §8, example in `docs/examples/SnapshotCarousel.example.tsx`).

**Structure**
- **Up to four pages of three cards** (12 cards). Each page is named after what it is about ("Needs you", "Money", "Space", "Leasing"), not "1–3".
- **Each page has one primary action** that matches it ("Review the offer", "Match bank lines"). "Show all 12" opens the full list on its own page.
- **The first page is always "Needs you".** Pages with nothing in them are left out.

**Desktop and tablet**
- Three cards per page, separated by hairlines, all on one flat navy surface.
- Arrows sit top right, the dots act as page buttons, and the arrows move one page at a time.

**Phone (under 600px)**
- **One card per swipe**, about 296px wide, with the next card peeking in.
- Never squeeze three metrics onto one phone page: the label and the figure end up fighting for one line, and the charts lose their shape.
- Cards sit on `--identity-3` #0a3170 inside the `--identity` surface. The header reads "Business snapshot · {page}" with "4 of 12".
- The arrows move one card. The four dots mark the pages.
- Swipe, arrow keys and the buttons all work. Each card is a link to its list.

**Inside each card**
- The label goes on its own line, then the figure (a small currency unit plus the number at 42–44px, tabular figures), then one note line.
- Status is a 9px dot before the note: orange means it needs you, cyan means good or available. The note text stays white.

**Charts:** only where the shape matters.
- Arrears by days past due: horizontal bars.
- Occupancy: one split bar with a legend.
- Enquiries by stage: four columns.
- Chart fills are flat white, orange or cyan; tracks use `rgba(255,255,255,.18)`. No gridlines, no axes, no gradients.

**Never**
- autoplay;
- a second set of arrows;
- Haki or photos inside the snapshot;
- coloured note text;
- more than four pages.

**Motion:** the slide transition is 320ms and turns off under reduced motion.

**Large figures:** use `fmtKM` on cards (KES 192.5M). Show the full amount on the detail page.

## 6 · Navigation

- **Two levels only.** The rail icon picks the app; the top pill-nav picks the view. No tab bars inside pages and no extra rail icons for sub-screens. (Conformance)
- **Six rail menus at most**, labelled, with the flyout on hover or keyboard focus and one open at a time. (CSS for the flyout; Conformance for the count.) Approved 9 Oct 2026.
- **Seven tabs per pill-nav at most.** Settings is split into Business, Money and Data menus. (Conformance)
- **One attention glow at a time,** on the most urgent rail item. (CSS keeps the first glow; the app should order rail items by urgency.)
- **Active state is always Signal Blue.** Identity navy never marks "you are here".
- **Mobile:** a bottom bar with up to five `mobilePrimary` items and labels of at least 13px. The active item is a Signal Blue pill behind the icon, and the label below it is in Signal Blue text.
- **Rail items:** 72px wide, at least 58px tall, a 22px lucide icon above a 13px label. The active item is a Signal Blue fill with a white icon and label. The attention glow sits on at most one item, never the active one. Utility items (Support, Settings) sit below a divider.

## 7 · Buttons

Use `<Button>`, `<ButtonLink>` or `<IconButton>` only. One recipe covers every vertical: Urbanist 700, 16px, 14px corners, at least 44px tall.

| Variant | Look | When |
|---|---|---|
| `primary` | orange fill, navy ink | the one thing to do on this view. One per view; in lists, per-row actions are secondary. |
| `secondary` | Signal Blue outline | other actions |
| `tertiary` | Signal Blue text | Cancel, dismiss, "Show all" |
| `destructive` | red outline | delete, close, revoke. Always behind a `ConfirmDialog`. |
| `on-dark` | white outline | the second action inside a `DecisionPanel` |

**Sizes:** `md` is 44px (the default) and `lg` is 52px for the main action on phone layouts. There is no smaller size.

**States:**
- **Hover:** a tint.
- **Pressed:** scale to 0.98.
- **Focus:** a 2px Signal Blue ring.
- **Disabled:** the disabled token pair (`--v-disabled-surface` / `--v-disabled-ink`), never faded opacity.
- **Loading:** a spinner beside the label, and repeat clicks are blocked.

**Labels:**
- verb first, sentence case, three words or fewer ("Save reading", "Review the offer");
- no "Click here";
- no icon-only buttons without `label` (`IconButton` requires it).

**Behaviour:**
- `type="button"` unless the button submits its form.
- Links that navigate are links (`ButtonLink`); actions are buttons.
- Never put `onClick` on a `div`.

**Enforced by:** CSS restyles the legacy `hq-btn-*` and `.btn-primary` classes. Check `hand-button`, `button-type`, `disabled-opacity` and `one-primary`.

**Decided 9 Oct:** the secondary button is a Signal Blue outline, never a filled Signal Blue button, so it never competes with the primary. The guardrails restyle the filled `.hq-btn-navy` to the outline until callers move to `<Button>`.

## 8 · Forms

- **Text inputs:** `hq-input` (`Input` component to follow), 44px tall, 15px.
- **Choices:** `<Select>`, not a native select.
- **Dates:** `<DatePicker>`, not `type="date"`.
- **Labels:** above the field, 15px, sentence case. Optional fields say "(optional)"; required ones are not starred.
- **Help text** goes under the field at 13–15px in `v-muted`. **Errors** go under the field in `v-crit`, saying what to do.
- **Save:** one primary Save per form. Disable it while saving, show a toast when saved, and never wait on a page reload.
- **Destructive form actions** go through `ConfirmDialog`.

## 9 · Tables and lists

- **`<DataTable>` with typed columns:**
  - `id` never wraps;
  - `money` is right-aligned and formatted;
  - `date` is formatted;
  - `status` is a `StatusChip`.
- **Header:** 15px, sentence case, on `v-sunken` with ink text in every theme.
- **Empty state:** one honest line. Use `EmptyState` with Haki only for a first-run empty state.
- **Pagination:** "Showing 1–7 of 7", with disabled arrows drawn using the disabled tokens.
- **Rows** open a detail page or a `SlideOver`, and the whole row is the link.

## 10 · Status

- **One table:** `STATUS_TONE_MAP` in `StatusChip.tsx`. A new state is a new row there, never a local colour map. (Check `local-status-map`)
- **One chip per record.** The chip label matches the sentence in the headline.

## 11 · Feedback and overlays

| Need | Use | Never |
|---|---|---|
| Confirm or decide | `ConfirmDialog` | `window.confirm`, `alert`, `prompt` |
| Saved, sent, failed | `useToast()`: one at a time, bottom right, with the next step | coloured banners stacked on the page |
| View or edit a record without leaving | `SlideOver` | hand-built `fixed inset-0` layers |
| Tip | `HakiTip` | modal tips |

**Stacking order:** `--z-raised` 10, `--z-sticky` 30, `--z-rail` 40, `--z-flyout` 50, `--z-overlay` 60, `--z-panel` 61, `--z-toast` 70, `--z-tooltip` 80. No raw `z-[n]`.

## 12 · Money, dates, numbers

- **Money:** `formatMoney(92000)` gives "KES 92,000". Decimals appear only when there are cents. Never type "Ksh" or "KSh" by hand, and never use `.toFixed(2)` on money.
- **Dates:** `formatDate()` gives "4 Sep 2026" and `formatDateTime()` gives "9 Oct 2026, 09:48". Never "Sept", never ISO dates in the UI.
- **Date-only values** ("2026-06-07") are local dates, so never pass them to a time formatter. Doing so shows 03:00 in Nairobi, which matches the inspection time seen in the Properties screens.
- **Big numbers:** `fmtKM` (12K, 1.20M) only in charts and small tiles; full amounts everywhere else.

## 13 · Icons and imagery

- **Icons:** the app uses `lucide-react` through `APP_ICONS` for the rail, and lucide directly elsewhere. Icons are 18–20px and `currentColor`, with no emoji in place of icons.
  - **Decided 9 Oct:** lucide stays for apps. The "no icon library" rule in the Hakiqa Brand Guidelines applies to marketing only.
- **Haki:** use the repo PNGs only. Empty states and tips are fine. No celebrating Haki on errors, no sad Haki on routine empty states, and no Haki inside data cards.
- **No decorative stock objects** (pots, whisks) in hero or data cards.

## 14 · Accessibility and function

- **Touch targets:** every control is at least 44px.
- **Focus** is visible: a 2px Signal Blue ring with a 2px offset.
- **Contrast:** text is at least 4.5:1 on its ground, in all three themes.
- **Labels for non-text content:**
  - `img` always has `alt` (`alt=""` if decorative);
  - icon buttons have a label;
  - links with `target="_blank"` carry `rel="noopener noreferrer"`.
- **Keyboard:** everything clickable is a `button` or `a`, and dialogs close on Escape and return focus.
- **Reduced motion is respected.** Never make a task wait for an animation.

## 15 · New vertical checklist

1. **Manifest entry:**
   - id, `data-vertical` family (commerce, care, or make/place);
   - six rail menus at most, each with up to seven tabs;
   - `mobilePrimary` limited to five items;
   - the Settings split into Business, Money and Data.
2. **Vertical wordmark** from the kit (`hakiqa-wordmark-<id>.svg` plus its `-white` version). Never redraw it.
3. **Haki industry pose** from `mascot/industries/` if there is one.
4. **Screens built only from the section 1 components.** Name the source screen for each surface before building, and if there is none, say so and ask.
5. **Seed data** from one idempotent script, with realistic names (no "Tenant Two" or "Vendor"), demo-labelled, and no "(seeded)" in labels.
6. **Checks pass:** `check-brand-rules` (no new errors), `check-vertical-conformance`, `tsc -b`, `eslint`.
7. **Screenshots** in Light, Warm and Dark at 400px and 1400px, added to the Vertical Hub for Marvin's sign-off.

## 16 · Decisions (approved 9 Oct 2026)

- **Six rail menus at most:** approved. Every vertical moves to the labelled rail with flyouts, as on the Properties branch.
- **Secondary button:** Signal Blue outline.
- **Icon library:** lucide stays in apps; marketing keeps "no icon library".
- **Member portal:** moves onto `useTheme` (key `hakiqa_theme`, Light, Warm and Dark) and the shared tokens and components. The `gp-*` classes are retired as screens move.
- **`--fs-label`:** becomes 15 px in Vivid Core (`src/index.css`), with `--fs-micro` at 13 px.
- **Labels and type:** 15 px, sentence case and Urbanist everywhere in apps, as set out in section 4.

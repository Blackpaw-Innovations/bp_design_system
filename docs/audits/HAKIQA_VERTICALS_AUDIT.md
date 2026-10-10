# Hakiqa Connect: all-verticals audit against the app rules (9 Oct 2026)

Source: `Blackpaw-Innovations/hakiqa-connect@main` (69c6469), all 189 files in `src/pages/`, plus `src/framework/manifest.ts`, `src/hooks/useTheme.ts`, `src/index.css`. Static code audit using the same patterns as `scripts/check-brand-rules.mjs`. Property code on `claude/relaxed-gates-8qkzvs` is newer than main; its screens were reviewed in pass 4 (HAKIQA_CONNECT_AUDIT.md). Other verticals have no screenshots in the hub yet, so this pass is code only.

Rules: Vivid Core (app colour), Hakiqa type rules (Urbanist, labels 15 px, sentence case, solid text), hub house rules (two-level nav, six menus, seven tabs max, one hero, one primary).

## 1 · Scorecard (rule breaks per 1,000 lines, lower is better)

Breaks counted: text under 13 px, all-caps, wide tracking, faded text, gradients, Manrope, orange text, hand-written "Ksh".

| Area (src/pages/…) | Vertical | Files | Lines | Breaks | Per 1k |
|---|---|---|---|---|---|
| pages/ | Car Parts storefront pages | 2 | 300 | 70 | **233** |
| crm/ | shared CRM | 5 | 781 | 87 | **111** |
| inventory/ | Car Parts, Duka stock | 5 | 2,911 | 288 | **99** |
| gym/ | Gym | 31 | 4,357 | 391 | **90** |
| vertical/ | shared vertical screens (Construction, Tailor, Reports) | 11 | 2,439 | 219 | **90** |
| construction/ | Tailor & Construction | 6 | 463 | 41 | 89 |
| core (root pages) | Dashboard, VerticalHome, SignUp, Login, Payments… | 22 | 5,314 | 438 | 82 |
| optical/ | Optical | 2 | 358 | 28 | 78 |
| events/ | Events | 5 | 688 | 49 | 71 |
| settings/ | all verticals | 15 | 3,814 | 261 | 68 |
| workspace/ | shared | 4 | 765 | 52 | 68 |
| sales/ | Car Parts, Duka | 1 | 894 | 60 | 67 |
| carparts/ | Car Parts | 23 | 6,873 | 361 | 53 |
| rentals/ | Equipment rental | 4 | 650 | 34 | 52 |
| property/ (main) | Properties | 8 | 1,227 | 54 | 44 |
| hospitality/ | Stay | 4 | 627 | 26 | 41 |
| imports/ | Imports | 9 | 1,835 | 73 | 40 |
| salon/ | Salon & Spa | 4 | 471 | 19 | 40 |
| tailor/ | Tailor | 5 | 303 | 11 | 36 |
| retail/ | Duka | 2 | 367 | 10 | 27 |
| dairy/ | Dairy | 12 | 992 | 17 | **17** |
| analytics/ | shared | 7 | 266 | 4 | **15** |

Every vertical breaks the type rules. Dairy and Analytics are closest to clean; the storefront pages, CRM, Inventory, Gym and the shared vertical screens are worst.

## 2 · Type

- **Text under 13 px:** 1,591 uses. Worst: Car Parts 274, Gym 268, Settings 206, core 195, Inventory 176. Worst files: `inventory/InventoryProducts.tsx` (87), `settings/CarPartsSettings.tsx` (75), `carparts/PartRequests.tsx` (74), `inventory/InventoryPurchaseOrders.tsx` (57), `sales/SalesOrders.tsx` (43).
- **All-caps:** 371 `uppercase`, plus 279 `tracking-wide/wider/widest`. Worst: Gym and core (65 each), Inventory 44, Car Parts 41.
- **Manrope:** 199 uses. Worst: shared vertical screens 57 (`VerticalReports.tsx` 20, `ConstructionProjects.tsx` 16, `TailorJobs.tsx` 11), core 39, Inventory 26, storefront pages 24, Car Parts 20, Imports 11. The main `src/index.css` has 8 more. Dairy, Gym, Events, Property, Optical and Stay use none.
- **Faded text:** 82 uses (`text-white/70` and similar). Almost all in core: `VerticalHome.tsx` 16, `PlatformAdminSignIn.tsx` 11, `SignUp.tsx` 7. Plus CRM 8, Gym 6.

## 3 · Colour and themes

- **Theme bug affects Light too, not just Warm.** `useTheme()` removes `data-theme` for Light. Any `:not([data-theme="light"])` selector therefore matches Light. Guardrails §2 is corrected to `:not([data-theme="dark"])`.
- **Colours that ignore the theme:**
  - 157 `bg-white`: core 57, Gym 39, Inventory 19, Events 13, Settings 11. These render as white cards in Dark mode.
  - 113 raw Tailwind palette classes (`bg-slate-100`, `text-green-700` and so on): shared vertical screens 28, core 26, Gym 23, Car Parts 15. None of them change between Light, Warm and Dark.
- **Green:** the status colour itself is allowed (`--v-pos`), but 52 places use raw Tailwind green or emerald instead of the token. Worst are the shared vertical screens (15) and Gym (10).
- **Gradients in pages:** 14. Gym 5, core 5 (VerticalHome, SignUp), onboarding 3, Settings 1. `src/index.css` has 16 more gradient lines; the hub's own "Hakiqa Air" rule had already retired most of them.
- **Vertical-specific styling:** `index.css` only has `[data-vertical]` blocks for Gym, Car Parts, Property and Imports, about 27 each. The other ten verticals run on the defaults, so their look depends entirely on page code.
- **Orange text:** 15 places, spread across verticals.

## 4 · Money and dates

- **"Ksh" written by hand:** 57 places. Imports 18 (`ImportsParser.tsx` 10), Construction 16, shared vertical screens 8, Property 5, Rentals 5, Stay 3, Optical 2, Salon 3, Tailor 3.
- **`.toFixed(2)`:** 7 places. **Hand-formatted dates** (`toLocaleDateString`, ISO slice): 107. Gym 20, core 11, Car Parts 10, shared vertical screens 8, Sales 7. This is why "Sept", "2026-09-20" and "4 Oct 2026" appear side by side.

## 5 · Structure and navigation

| Vertical | Rail icons | Tabs in largest menu | Notes |
|---|---|---|---|
| Tailor & Construction | **17** | Settings 10 | widest rail |
| Properties (main) | 16 | Settings 10 | the branch already moves this to 6 labelled menus |
| Salon & Spa | 14 | Settings 10 | |
| Equipment rental | 13 | Settings 10 | |
| Stay (hospitality) | 13 | Settings 10 | |
| Duka | 12 | Settings 10 | 5 tab groups |
| Optical | 12 | Settings 10 | |
| Car wash | 11 | Settings 10 | |
| Events | 11 | Settings 10 | |
| Car Parts | 10 | **Settings 13**, Service 8 | most routes (75) |
| Gym | 9 | **Ops 11** | |
| Imports | 9 | — | |
| Dairy | 9 | Settings 9 | |
| Field Connect | — | — | no own manifest block (inherits) |

- **Menus:** every vertical breaks the six-menus rule (it is proposed, not yet approved). Only the Properties branch has the labelled six-menu rail. Port its `railLabels` and flyout to the other verticals once the guardrails fix the double-open bug.
- **Seven tabs:** Settings breaks it in 12 of 13 verticals (9–13 tabs). Split it into Business, Money and Data once, in the shared settings route builder, so every vertical gets the fix. Gym Ops (11) and Car Parts Service (8) also need splitting.
- **One primary action:** 14 files have more than three orange buttons. These include `AutomotiveOperations`, `PartRequests`, `WarrantyClaims`, `GymLeads`, `GymTrainerWorkspace`, `ImportsOrderDetail`, `InventoryProducts`, `InventoryPurchaseOrders`, `OpticalPatients`, `SalesOrders`, `CarPartsSettings` and `Dashboard`. Some will be list rows (one per record, which is fine); check each one.
- **Page titles:** 60 of 189 page files have no `<h1>` or shared title component. The rule needs one headline sentence per screen; move them to `<PageTitle>`.
- **Stacking:** 31 raw `z-[n]`, mostly in core, Settings, Car Parts, Inventory and Duka. Move them to the named scale.
- **Shared components are barely used:** `<StatusChip>`, `<PageHeader>`, `<MetricLedger>` and `<SealedCard>` appear 69 times across 189 files. `KpiStat` and `hq-kpi-card` appear 100 times, mostly in Construction, Stay, Property, Rentals and Optical. Most screens hand-build their cards, so a design-system fix doesn't reach them until they adopt the components.

## 6 · Claims

Two uses of "offline" (Dairy 1, Gym 1). Both look like device or connection state, which is allowed (see pass 1). Check the Dairy one.

## 7 · What the guardrails fix automatically, and what they don't

**Fixed at render once `guardrails.css` ships:**
- tiny text and caps (`text-xs`, `text-[9–12px]`, `uppercase`, `tracking-*`, `.t-label`, `.chip`, `.hq-label`);
- Manrope;
- faded and coloured text on navy;
- `.hero-card` sheen;
- the Tailwind gradient utilities;
- orange text classes;
- the Light and Warm theme leak;
- rail z-index, the flyout double-open, the glow cap and the second avatar.

**Not fixed by CSS (needs code, and the checker will flag it):**
- the 57 hand-written "Ksh", the dates, and `.toFixed(2)`;
- `bg-white` and raw Tailwind colours in Dark mode;
- inline `style={{ background: 'linear-gradient…' }}`;
- tab counts and rail size (manifest);
- multiple primary buttons;
- missing page titles;
- decorative photos.

## 8 · Order of work

1. Ship the guardrails (fixes most of the type and colour breaks in every vertical at once). Re-screenshot each vertical in Light, Warm and Dark at 400 and 1400 px.
2. Ship `SnapshotCarousel` (standards §5a) and swap it into VerticalHome. Every vertical gets the new Home snapshot at once, because it is shared code.
3. Shared code next: Settings split (12 verticals), shared vertical screens and CRM (Manrope, raw colours), core VerticalHome (faded text, gradient).
4. `formatMoney` and `formatDate` sweep: Imports, Construction, shared vertical screens, then the rest. Then switch on the `currency-literal` rule as an error.
5. Per vertical, worst first: Gym, Car Parts with Inventory and Sales, Events, Optical. Dairy, Duka and Tailor need the least.
6. Port the Properties labelled-rail navigation to every vertical (six-menu rule approved 9 Oct).
7. Get screenshots for every vertical into the Vertical Hub, so the next pass can check layout and copy, not just code.


## 9 · Second sweep: function and consistency (all 428 files in src/)

Scope: `components`, `pages`, `portal`, `storefront`, `workshop-landing`, `public-portal`, `framework`, `hooks`, `lib`, `index.css`. Checked against the full standards in `bp_design_system/docs/HAKIQA_APP_STANDARDS.md`.

**Buttons:** 1,002 buttons, built from **313 different visual recipes**.
- Only 136 use the shared classes: 124 `hq-btn-primary`, 4 `hq-btn-navy`, 8 `hq-btn-secondary`.
- 67 are hand-filled Signal Blue, 11 hand-filled orange and 10 navy.
- 20 different red "destructive" treatments.
- Six corner radii: rounded-xl 104, hq-lg 57, 2xl 42, full 34, lg 32, hq-md 23.
- 115 buttons use text-xs, 101 have no `type` (they submit by accident inside a form), and 202 fade when disabled (fails contrast).
- About 160 icon-only buttons may lack a label. That count is a heuristic, so check each one.
- **Fix:** `<Button>`, `<IconButton>` and `<ButtonLink>` (one recipe, five variants). The guardrails restyle the legacy classes in the meantime.

**Forms:**
- 43 native selects (126 already use `<Select>`).
- 12 native date inputs (21 already use `<DatePicker>`).
- 477 raw inputs against 406 using `hq-input`. Many of the raw ones are checkboxes or radios, which still need a shared style.

**Overlays and feedback:**
- 29 hand-built modal layers (52 already use `<SlideOver>`), with z-index rising to 65, 110, 120 and 130.
- 10 browser alert/confirm calls: `PhotosPanel`, `PlatformAdminSignIn`, `PagesWebsite` ×2, and others. The popup-blocked alert in `printDocument.ts` is exempt.
- **Fix:** `<ConfirmDialog>` and the named z scale.

**Status:** 29 local status colour maps in 22 files, against 72 `<StatusChip>` uses. **Fix:** fold them into `STATUS_TONE_MAP`.

**Shared components:** the premium set (`PageHeader`, `MetricLedger`, `SealedCard`) has **0 uses**. `KpiStat` has 99 uses in 23 files. Screens are hand-built, which is why one fix in the design system rarely reaches them. Migrating screens onto the components is the main job.

**Accessibility:**
- 11 `target="_blank"` links without `rel`;
- 6 images without `alt`;
- 18 clickable `div`s.

**Theme hooks:** the member portal (`src/portal`, 54 files) is a separate design system:
- its own `gp-*` classes and token set, with `--ink-soft` #8895ae, the value the main app had already brightened;
- its own theme state under the localStorage key `hakiqa-color-mode`, separate from the main app's `hakiqa_theme`, with Light and Dark only (no Warm);
- 11 px caps chips and labels, and sheen on the hero;
- a gradient toast, plus olive and burgundy heroes, which Northstar §16 retired.

Guardrails now cover the portal's labels and hero sheen. Approved 9 Oct: it moves onto `useTheme` and the shared tokens (standards §16).

**Design system itself** (`bp_design_system`):
- `roles.css` set the primary button and focus to teal-ink, contradicting Vivid Core. Fixed.
- `components.css`: `.btn-primary` is teal with a coloured shadow (restyled by guardrails), `.c-kpi` has a gradient top bar (flattened) and `.hero-card` has a sheen (removed).
- `.haki-tip` variants use green, yellow and pink backgrounds outside the palette. Re-tone them to ice, sand and `v-crit` tints next.
- `design/handoff/assets/bdl-tokens.css` in hakiqa-connect still names Newsreader and Manrope. It is a stale handoff file; mark it legacy or delete it, so assistants don't copy from it.

## 10 · Checker dry run (main @69c6469)

**3,011 errors and 933 warnings in total.**

| Rule | Count | Rule | Count |
|---|---|---|---|
| tiny-text | 1,708 | currency-literal | 73 |
| caps-label | 419 | theme-raw-colour | 70 |
| tracking | 311 | tiny-css | 54 |
| manrope | 224 | gradient | 46 |
| disabled-opacity | 202 | native-select | 43 |
| theme-white | 148 | raw-z | 40 |
| hand-date | 121 | custom-modal | 29 |
| faded-text | 108 | local-status-map | 29 |
| hand-button | 106 | caps-css | 25 |
| button-type | 101 | click-div | 18 |
| orange-text | 16 | one-primary | 14 |
| native-date | 12 | blank-rel | 11 |
| native-dialog | 10 | img-alt | 6 |

Start CI at `--baseline 3011`. About 2,800 of these errors (type, Manrope, tracking, faded text) are already corrected at render by `guardrails.css`, so the screens improve the day the design system ships, and the code is cleaned up screen by screen after that.

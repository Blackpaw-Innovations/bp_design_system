# Hakiqa Duka — Design Language Notes (persistent, read every session)

This file is the shared vocabulary for the Hakiqa prototype. When the user names a term below, they mean the exact component/pattern described — use it to scope "sweeping" (every page) vs "dedicated" (one page/card) change requests.

## Shell (assets/app-shell.css — loaded by every app page)
- **Rail** — left 76px icon column (`.rail`). Logo mark, Home icon, app icon (active state = filled navy), Calendar icon, spacer, Settings gear, avatar.
- **App-top** — the header row per page: back-button + `<h1>` (`.back-title`), **pill-nav** (center), **actions** (search-box + bell icon-btn + avatar-chip) on the right. Never wraps (fixed after the July 2026 audit); pill-nav shrinks/scrolls before anything wraps.
- **Pill-nav** — the segmented nav in app-top. Scoped per app group (Analytics has 5 tabs, CRM/Sales/Inventory have 2-3). Rule: links stay within the app's own group; Home/back always exit to `Home Screen Concept.html`.
- **Search-box** — the pill-shaped search input used in app-top and toolbars. One visual spec system-wide via `.app-top .search-box` / `.toolbar .search-box`.

## Hero card (assets/app-shell.css — the "premium card" system, added 15 Jul 2026)
The deep, glowing dark-card treatment the user singled out from `design_system.html`'s "Mapato MTD" tile. **Say "hero card" or "premium card" to mean this.**
- Recipe: solid deep-color fill (NOT a bright flat color, NOT a 3-stop diagonal gradient) + a soft radial corner glow (`::before`) + a barely-visible diagonal sheen (`::after`) + white text.
- Variants: `hero-navy` (`var(--navy)`), `hero-olive` (`#2f3819`), `hero-burgundy` (`#47121f`), `hero-orange` (`#6b3410` — deep rust, not the bright flat `--orange`).
- Already wired to existing class names system-wide, so most pages needed zero HTML changes — only their old duplicate per-page background rules were deleted: `.kpi-navy`, `.kpi-olive`, `.kpi-burgundy`, `.kpi-orange` (Analytics Revenue/Inventory/Reports/Customers/Sales Leaderboard, CEO Command Screen) and `.pj-strip-item.contract/.actual/.margin` (Project Control) all now inherit the glow automatically from the shared rule.
- New cards: add class `hero-card` plus one variant, e.g. `class="kpi-card hero-card hero-olive"`.
- **Rule of hierarchy: only ONE hero card per row/group.** Everything else in that row stays plain white — that's what gives the hero card weight. Don't hero-ify a whole row.
- Home's Business Snapshot carousel (`.hero-page`/`.hero`) now uses the navy hero tones directly (`#0e1b32 → var(--navy) → #0a1425`), matching the rest of the hero-card system — no longer a separate near-black species.

## Other named patterns (for future reference)
- **Quick-edit slide-over** — the right-hand panel pattern (CRM Pipeline deal editor, Sales Orders detail panel, Expenses add-expense panel). Slides in via `.overlay`/`.slide-over` + `.open` class toggle.
- **Kanban board** — CRM Pipeline's drag-and-drop deal columns (`.pipe-col`), each with colored top border + count badge.
- **Ledger table** — the table pattern used in Expenses/Sales Orders/Sales Leaderboard: `th`/`td` with uppercase 11.5px headers on a tinted background row, comma-formatted amounts right-aligned via `.amount`/`.amount-h`.
- **fmtKM()** — the canonical number formatter (Project Control, Pipeline column totals): commas below 1,000; K above 1,000; M above 1,000,000 — never a bare decimal like "0.03M".

## Responsive contract (added 22 Jul 2026)
Following the Responsive & Design-System Audit, the shell now targets tablet and phone, not just desktop.
- **Breakpoints (standardized — use these, not ad hoc values):** `1024px` (desktop→tablet, `.main` padding only), `720px` (tablet→phone: app-top wraps — pill-nav drops to its own full-width row, search collapses to an icon-button that expands via `.search-open`, back-btn/icon-btn/avatar-chip grow to 44px touch targets), `600px` (rail becomes a bottom tab bar, fixed, full-width; `.main` gets bottom padding to clear it).
- **Viewport meta** is injected once by `assets/app-shell.js` (synchronously, before layout) — no page should add its own.
- **Wide tables** must sit inside a `.table-wrap` (shared, `overflow-x:auto`) with a `min-width` on the `<table>` — see Purchase Orders / Expenses / Sales - Orders for the pattern. Don't let a ledger table force page-level horizontal scroll.
- **Multi-column content grids** reflow via a shared class list in `app-shell.css` (2-col ≤1180px, 1-col ≤600px; stat bands like `.hero-stats`/`.*-hero` drop their border-left dividers and go 2-col ≤720px). Add a page's primary grid class to that list rather than writing a per-page collapse rule. `.pipe-board` (kanban) and Home's `.qa-grid` are intentionally excluded.
- **Home Screen Concept.html** now links `app-shell.css` (before its own `<style>`, so its bespoke home layout still wins on conflicts) — it is under the shared system and inherits the token scale; it previously left `--card-bg`/`--surface-*`/`--pos` undefined. Its home-specific styles (hero carousel, qa-grid, fav cards) remain local.
- **Dark mode** is automatic for any page-local component built on color tokens (`var(--card-bg)`/`--surface-*`/`--line`/`--pos` etc.) — choice-card, wiz-card, ledger tables and stat bands all follow it with no per-page dark rules. Customer-facing Storefront/Events pages use their own always-light `--v-*` brand theme by design.
- **Slide-over panels/overlays** (Quick-edit, Members, Bookings, Access Control, Trainer, Tasks, Purchase Orders, etc.) are governed by one shared rule in `app-shell.css` (`.slide-over`/`.overlay`, matched against every page's existing class name — `.qe-panel`, `.mem-panel`, `.roster-panel`, `.session-panel`, `.pol-panel`, `.tk-panel`). A page only needs to declare its own panel `width`; position, dimming, transform, and shadow come from the shell. Don't re-declare those mechanics per page.
- **Spacing / radius / shadow tokens** now exist in `app-shell.css` (`--space-1..8`, `--radius-xs..4xl` + `--radius-pill`/`--radius-circle`, `--shadow-sm/md/lg/panel`, with dark-mode shadow variants). Shared shell components consume them; page-local components should adopt them for new work rather than hardcoding radii/shadows.
- Full findings and rationale: `Responsive & Design-System Audit.html`.

## Design rules (enforced project-wide, added 16 Jul 2026)
- **No emoji as icons, anywhere.** Every icon is inline SVG (stroke-based, matches the rail/pill-nav/app-top style already in `app-shell.css`). This includes card icons, list bullets, badges, buttons. Emoji only appear if the user is quoting real chat content (e.g. WhatsApp Operations mockup bubbles) — never as a stand-in for a proper icon.
- **Hero card is scarce.** One hero card per row/group, reserved for the single most important number in that context (a KPI, a composite score). Every screen with a "headline" score/total should render it as a hero card (`hero-card` + a variant), not a plain white card — Readiness Score, single-KPI banners, etc.
- **Every new page needs a reason to exist and a real entry point.** Before adding a page, name where it's reached from and why that's the right place — don't add a pill-nav tab just because a feature was built there. Prefer surfacing new capabilities as a card/link inside an existing, purposeful page over growing pill-nav tab counts. Pill-nav tabs are for an app's own core sub-views, not every adjacent feature.
- **Teaser/gated features must say what unlocks them.** Any "coming with scale" or eligibility-gated card states the concrete condition (score threshold, cohort size) — never a vague "coming soon".

## Ground rules for sweeping changes
- One shared source of truth: `assets/app-shell.css`. A "sweeping" request to a named component/pattern above should be implemented ONCE there (or in the relevant shared file) and should require touching individual pages only to remove now-redundant local overrides — not to redefine the pattern per page.
- A "dedicated" request (naming one page/card) should NOT touch the shared file unless the user says to change the pattern itself.
- No bright yellows/lilacs; navy/burgundy/olive/orange only. Numbers always comma-formatted except K/M-abbreviated KPI heroes.

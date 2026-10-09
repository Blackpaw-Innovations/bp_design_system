# Hakiqa Duka — Project Audit Report v2
Date: 19 Jul 2026 · Full A–Z audit · **UPDATE (same day): all §3 issues below were FIXED and live-verified** — see §3 status notes. Supersedes the 15 Jul report.

## 1. Verdict in one paragraph
The prototype is structurally healthy: **zero broken internal links, zero unresolvable icon references, zero console errors on loaded pages, zero horizontal overflow, no NaN/undefined/[object Object] leaks, every page reachable from a real entry point.** The shell system (rail / app-top / pill-nav / hero cards / Haki tips / support widget) is genuinely centralized and consistently consumed. The two real problems are (a) the **mode-awareness claim is overstated — over half the pages load `business-mode.js` but never call it**, and (b) a handful of **emoji-as-icon violations** of the project's own design rules.

## 2. What was verified working (do not regress)
- **Link graph:** every `href`/`src` target exists on disk. Every Hakiqa page has ≥1 inbound link. Entry chains verified: Login → Home; Sign Up → App Setup; Settings → Data Export / Business Passport / Support; Purchase Orders → Supplier Catalog Import / Returns & Disputes / Supplier Scorecard / Landed Cost / Shipment Tracker; Home → Exception Cockpit; Access Control → Kiosk Check-In; Shipment Tracker → Fulfilment Orchestration / Currency & FX.
- **Icon system:** 37 symbols in `assets/icons.svg`, injected by `app-shell.js` fetch. Every `<use href="#...">` on every page resolves (sprite or inline). No missing symbols.
- **Live load (54 pages):** all render rail + app-top (except intentionally shell-less Login / Sign Up / App Setup / Kiosk Check-In / Home). No page JS errors, no layout overflow. "Empty container" flags (hkSpBody, soBody, moneyUseGrid, batchRows, cat-list-*) are all lazily-filled panels/slide-overs/image-slots — correct behavior.
- **Prior confirmed issues now FIXED:** K/M notation (fmtKM gates M at ≥1e6 everywhere — no more "0.03M"); random project-type/deadline:'TBD' placeholder logic removed from Pipeline's won→project flow; Expenses module built; CRM - Projects.html exists as its own page (Pipeline no longer hosts #projGrid).
- **Haki tip dismissal:** `hakiqa-dismissed-tip:<path>:<id|title>` keys, enhance-on-load, works app-wide via app-shell.js.
- **localStorage contracts** (all `hakiqa-` prefixed, consistent): access-policies, crm-stages, crm-rules, projects, exception-cockpit, decision-log, expenses, theme, pos-session, kiosk-devices, offers, roles-access, business-mode, preview-role. `bicc-*`/`hd-*` belong to non-Hakiqa pages.
- **Role lock system:** ROLE_LOCKS (cashier/kioskdevice) with landing + allow-lists via `applyRoleLock()`.

## 3. Issues found — ALL FIXED 19 Jul 2026
### 3.1 Mode-awareness gap — CLOSED
Every page now sits in an explicit, implemented tier:
- **Data-driven**: Home, Analytics ×6, Sales - Orders (mode-keyed hero copy + KPI sets for restaurant/tailor/construction/gym/dropship), Notifications (full mode-specific feeds ×6), Expenses (mode-filtered/renamed money-use categories), Calendar (mode-specific operational events merged into seeds), Inventory - Products (mode-aware favorites vocabulary), CRM - Pipeline (gym stage set), POS, Style Catalog, Offer Builder, Roles Access, Purchase Orders.
- **Mismatch banner** (`bmModeCheck`): gym pages (Members/Bookings/Equipment/Access Control/Trainer Workspace/Member Profile), Dropship ×3, CRM - Contacts/Activities (tailor/construction/gym/mixed), CRM - Projects/Project Control (tailor/construction/mixed), Supplier Catalog Import + Scorecard (all modes except gym).
- **Mode-context line** (`bmContextLine`, new shared `.bm-context`): Company Brief, Company Map, CEO Command Screen, Business Readiness Profile, POS Daily Close — “Viewing as <mode> — <focus>” with a Settings link.
- **Intentionally mode-agnostic** (include still needed for role-lock enforcement): Statement, Support, Ambient Mode, WhatsApp Operations, App Setup, Settings - Business Passport/Data Export/Data Sharing/Reports/Kiosk Devices/Currency & FX.
New shared helpers in `business-mode.js`: `bmPick(objByMode)`, `bmModeLabel()`, `bmContextLine()`, plus auto-swap of `data-bm` / `data-bm-focus` / `data-bm-mode` attributes on load.
Live-verified across gym/dropship/restaurant/construction/tailor/mixed/retail: KPI swaps, notification feeds, banners, and context lines all render; no JS errors, no NaN/undefined leaks.

### 3.2 Emoji-as-icon violations — CLOSED
All converted to inline stroke SVG: Inventory - Products favReason badges (pin/repeat/flame/eye), CRM - Pipeline toast (🎉 removed), Calendar dc-meta (clock/folder SVGs), Company Map + CEO Command Screen flame glyph (SVG flame), and every literal ✕ close button app-wide (~20 instances incl. app-shell.js support panel) now uses the shared SVG X at 1em.

### 3.3 Minor — CLOSED (except one deliberate keep)
- Stale PRD print copy deleted; duplicate uploads (feature-map ×2, haki-*.png ×5) deleted — no references existed.
- Login ‘Forgot password?’ and Sign Up ‘Resend email’ now show inline sent-confirmations instead of dead links.
- `Home - Dark Concept (Violet).html` kept deliberately as a design-exploration archive (0 inbound links is intentional; do not “fix”).
- Filenames with `&`/`()` left as-is — browser-safe; only affects some scripting tools.
### Historical detail of the 3.1 finding (pre-fix)
Claim was "all 50+ pages respond to Business Mode at the data layer." Reality: **29 pages included `business-mode.js` but made ZERO calls to it**.

## 4. Untested / unverifiable in this audit
- Interaction flows (drag-and-drop to Won, quick-edit save, POS full session, Offer Builder composition) — load-clean but not exercised end-to-end this pass.
- Chart tooltips' number formatting — spot-checks only.
- Mobile responsiveness — known desktop-only; not audited.

## 5. Known remaining work (carried forward)
Mobile responsiveness · backend enforcement · more Report Pack templates · deeper mode-specific Analytics chart data.

## 6. Rules for anyone editing (unchanged)
- One source of truth: `assets/app-shell.css` / `app-shell.js`. Never fork the shell per page.
- Pill-nav stays within an app's group; rail Home + back-btn → Home Screen Concept.html.
- Commas on all numbers; K/M only in KPI heroes; never sub-1M "0.0XM".
- No emoji as icons; inline stroke SVG only. One hero card per row/group.
- Preserve all `hakiqa-*` localStorage shapes listed in §2.
- Blackpaw/BICC/design_system/uploads/export files are out of Hakiqa scope.

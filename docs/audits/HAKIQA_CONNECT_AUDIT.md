# Hakiqa Connect audit, pass 1 (9 Oct 2026)

Source: Blackpaw-Innovations/hakiqa-connect@main, `src/` (code search; partial scan, 267 of 427 files). Checked against the Hakiqa Brand Guidelines PDF and the Hakiqa Brand Book.

## Findings

1. **Manrope is the label face across the app** (`font-manrope` in AvatarMenu, DemoBanner, EmailComposeModal, ExpenseSummary, PhotosPanel, dairy Farmer/Rider views, workflow StageBoard, and more). The rule says Urbanist in every app. Open decision D14: migrate or allow.
2. **Labels are 9–10 px, uppercase, `tracking-widest`** (e.g. `text-[9px]`, `text-[10px]`). The smallest Hakiqa sentence is 15 px, and wide-tracked caps hurt reading on phones. Proposed: labels 13–15 px, Urbanist 800, sentence case or light tracking.
3. **Muted white text on colour** (`text-white/50`, `text-white/75` in hero labels). On navy, text is white only, at full opacity, to keep AAA contrast.
4. **Printed documents** (`framework/printDocument.ts`): APPROVED by Marvin 9 Oct as they are (Google Sans, Manrope figures, accent gradient totals). Exempt from the app rules; do not change.
5. **Two token files in design/handoff** (`bdl-tokens.css`, `blackpaw-apps/bp-tokens.css`) need checking against `brand-tokens-additions.css` so the apps and the brand share one source.
6. **Claims:** no "offline", "AI-powered" or "seamless" in the UI copy found so far. eTIMS appears only in code comments that say it is not built. The gym door-reader `"offline"` status is device state, which is fine.

## Pass 2: Dashboard (src/pages/Dashboard.tsx)
Score 2/5. Date as H1 with a 10 px white/50 weekday; two competing primary actions (header plus icon and FAB); active visit uses white/50 and white/75 text and a pulsing bar; KPI cards lead with decorative icon tiles; hq-gradient-bar accents; "Performance" label in 10 px Manrope caps. Rework: `Hakiqa Connect Dashboard Rework.dc.html` (greeting headline, one full-width New visit button, solid white on navy, 15 px Urbanist labels, tickets on sand, week as one progress bar).

## Pass 3: app colour reconciled (9 Oct, evening)
App UI follows **Vivid Core** (hakiqa-connect `src/index.css`, ruled 15–16 Sep 2026). It is authoritative for app screens; the brand palette governs marketing.
- Identity navy #032053: hero cards, flat. Signal Blue #2a6fda: active nav, tabs, focus, secondary. Action orange #fd8a03 with ink #071b3c: the one primary action, the attention dot, the orange "needs attention" glow (ruled, LU-02).
- Status inks (pos #16865a, warn #ad6200, crit #c53b43, info #2a6fda, draft #5d6675) are app-only, on their own tints. Green stays in the app; never used in marketing.
- Themes: Light, Warm (cream, hue 83), Dark. Only surfaces change.
- Not deviations (withdrawn from the screenshot review): electric-looking blue on tabs and nav, orange glow on nav icons.
- Still deviating: `--fs-label: 11px`, `.hq-label` Manrope 10 px caps; blue-to-navy gradient on the Business Snapshot card (breaks Northstar rule 13); amber and green text on navy; light grey helper text; entity chip repeated on every screen; mixed currency format (use KES, no decimals on whole shillings).
- Sample: `Hakiqa Connect Sample Screens.dc.html` (Light, Warm, Dark; mobile and desktop).

## Pass 4: Vertical Hub screenshots, Properties (9 Oct)
Source: uploads/Hakiqa Vertical Hub (standalone).html, 44 desktop (1400) + 44 phone (400) shots, 25 flows. Judged against Vivid Core + the hub's own house rules (screen-recipe, two-level-navigation, six-menus-max-seven-tabs).

**Working:** headline-sentence recipe; one navy decision panel with one orange button, right column on desktop; rail + pill-nav everywhere; statement/P&L previews; honest empty states; sample data labelled.

**Fix, in priority order**
1. Labels: tiny caps at ~9–11 px (KPI labels, chips, table heads, rail labels, BUSINESS/MONEY/DATA in Settings pills). Set --fs-label 15 px, sentence case, Urbanist; retire .hq-label.
2. Header stack repeats the page name up to four times (top bar, breadcrumb, eyebrow, H1) and adds entity select + "All properties in the selected entity" + PROVISIONAL chip on every screen. Keep top bar + H1; breadcrumb only on drill-downs; entity once in the top bar.
3. Currency: Ksh 92,000.00 / KES 92,000 / KSh 16,000 / 5,000.00 KSh a month. One formatter: KES 92,000 (decimals only when non-zero).
4. Decorative photos in hero cards (clay pot on Garden Court and Shop G12, fly-whisk on a contact). Not data, not Haki. Remove.
5. Business Snapshot: gradient and two sets of carousel arrows. Flat --identity, one control set (or no carousel: show the top 3 and "Show all").
6. Settings has 12 tabs in one pill row; the hub's own rule is seven max. Split by Business / Money / Data as menus, not inline caps labels.
7. Orange text on white ("Needs a follow-up", "Tax settings not reviewed", "Still owed KSh 3,000", deduction underline). Use --action-text #b35600 or --v-warn #ad6200 at 15 px+, or a warn chip.
8. Rail glow on three icons at once (Leasing, Work, Money) stops meaning "look here". Cap at one, the most urgent.
9. Destructive "Close" is a pale pink fill. Use outline --v-crit.
10. Two avatars on desktop (rail bottom orange + top-right navy). Keep one.
11. Imports: olive / brown / burgundy state buttons, sheen on the batch card, ISO dates (2026-09-20). Move to Vivid Core status tokens and "20 Sep 2026".
12. Pipeline columns each get a different top-border colour. Colour only the column that needs action.
13. Muted text (#6B7F97-like helper lines, disabled pagination) is under 4.5:1. Use --v-muted #5d6675 minimum.
14. Long headlines run to three lines ("Imara Retail Ltd's offer for Office 2B, Ksh 1,920,000.00 a year, waiting for approval"). Cap at two; move the figure to the decision panel.

**Seed / sign-off hygiene** (screens are for Marvin's approval): placeholder names (Tenant, Tenant Two, Owner, Vendor, Leasing Plaza), "(seeded)" in account names, "Product Sales" in a property P&L, a 03:00 inspection time, "Your logo" and a five-times "NAIROBI" marquee on the public site. Fix in the seed script (house rule idempotent-seed).

**Public website** uses the client storefront theme (green). It is the client's brand, so exempt from the Hakiqa palette, but the format and placeholder fixes still apply.

## Pass 5: snapshot carousel and preview renders (9 Oct, night)
Renders: `Hakiqa Connect Fixes Preview.dc.html` (four breaks before and after, in Light, Warm and Dark: snapshot, enquiries list, rail and flyouts, work-order buttons) and `Hakiqa Business Snapshot.dc.html` (the redesigned carousel, desktop and phone, all three themes, working controls).

**Live snapshot, as found** (VerticalHome and AttentionCards):
- blue-to-navy gradient and a white sheen;
- 10–11px caps labels at 70–75% white;
- green and amber note text on navy;
- two arrow sets (top and bottom) plus dots and a separate "Show all" pill;
- pages are arbitrary slices ("1–3 of 12") with no name;
- no primary action tied to the page;
- Haki in the corner.

**Rebuilt as:**
- four named pages (Needs you, Money, Space, Leasing), one control set and one primary action per page;
- flat `--identity`, white text, colour only in 9px dots and chart fills;
- three charts where the shape carries meaning (arrears by age, occupancy split, enquiries by stage);
- on phone, one card per swipe with a peek. The first rebuild put three metrics on one phone page, and the labels and figures clamped against each other (user review, 9 Oct). Fixed, and now a standards rule.

**Also confirmed in render:**
- rail flyouts must stack above the page (`--z-rail` and `--z-flyout`), with only one open at a time;
- one attention glow;
- the destructive Close goes behind a ConfirmDialog;
- the disabled state uses the disabled tokens.

**Standards updated:** §5a (snapshot carousel recipe), §6 (rail and bottom-bar items). `SnapshotCarousel` is drafted in `repo-ready/bp_design_system/src/components/SnapshotCarousel.tsx` (not yet committed or run).

**Figures in the renders** come from the demo workspace screenshots. The charts use only those numbers; no trend lines were invented.

## Pass 6: Insight Spotlight kept (9 Oct, night)

**User ruling:** keep the navy spotlight with its object and white action, as in Car Parts, but with rules. My DecisionPanel replacement in the fixes preview (orange button, object removed) is withdrawn for this card. DecisionPanel stays for in-page decisions that have no object.

**What breaks in the live card** (`InsightSpotlight.tsx`):
- a 10px caps eyebrow at weight 900 with wide tracking;
- body text at 75% white, 14px;
- a 14px CTA;
- the object set 115% wide, so it runs under the text column.

**APPROVED 1c (user, 9 Oct).** Ruled: standards §5b. Render: `Hakiqa Insight Spotlight.dc.html` (1a live, 1b withdrawn, 1c approved), shown in four tones and three themes, desktop and phone.

**Correction:** standards §3 called the burgundy and olive tones retired across the board. Vivid Core §06 keeps them for the spotlight only, and §3 now says so.

## Pass 7: attention dot approved; Home attention cards and quick actions (9 Oct, night)

**Approved:** 2a, the dot. It replaces `.hq-led-glow` (blurred radial gradient, pulsing forever, several at once). The updated sections are in `UPDATED_SECTIONS_2026-10-09_attention-dot.md`.

**AttentionCards.tsx, as found:**
- "Watch · Open Requests" in 11px caps;
- a 6px brown warn stripe and an orange icon tile on every card;
- the insight at 12px, truncated;
- "KSh 214K";
- auto-fit columns that leave a hole with three cards.

**QuickLink, as found:** icon and label tiles with no outcome line. "Copy workshop queue" copies silently.

**Options:** turn 3 in `Hakiqa Home Attention and Quick Actions.dc.html`. Needs attention 3a (action list), 3b (figure tiles), 3c (lead and queue). Quick actions 4a (action row), 4b (tiles with what happens), 4c (one main action, the rest listed). **Approved 3b and 4a (10 Oct).** Updated sections: `UPDATED_SECTIONS_2026-10-10_home-attention-quick-actions.md`.

**Intelligence brief replaced** by Haki's focus note (5c, approved 10 Oct, standards §5e). The old brief repeated the Needs you counts, used '!' warn icons, 'Watch' labels, a left stripe, KSh, an em dash and an unsupported 'before it drifts' line.

## Next pass
- Read the main screens (Dashboard, VerticalHome, Clients, PaymentsHub, OnboardingHub, Login, SignUp) for layout, hierarchy and copy.
- Score each screen; rebuild the weakest two or three as Hakiqa-correct mockups.
- Turn the fixes into app design-system rules.

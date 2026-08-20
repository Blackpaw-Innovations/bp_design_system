# Hakiqa Duka — handoff material

This folder is **product-specific**, not brand-system-wide: it's the audit trail and
prototype reference for the Hakiqa Duka build, kept here only because that's where it
was produced. It should not be read as part of the canonical Blackpaw Design Language.

For the canonical, versioned brand-language docs (foundations, tokens, components,
identities), see [`/docs`](../docs) — this folder used to carry a byte-identical copy
of those same three pages; that copy has been removed so `/docs` is the one place
they're maintained. If Hakiqa Duka's prototype work outgrows "reference material for
one product," it belongs in Duka's own repository rather than here.

## What's actually here

| File | What it is |
|---|---|
| `AUDIT_REPORT.md` | Duka prototype audit (link graph, icon system, mode-awareness) |
| `DESIGN_SYSTEM_NOTES.md` | Duka's shell/pattern vocabulary and responsive contract |
| `Hakiqa - Product Requirements Document.html` | Duka PRD |
| `Responsive & Design-System Audit.html` | The audit `DESIGN_SYSTEM_NOTES.md` references |
| `Style Catalog.html` | Duka's rendered style catalog |
| `assets/app-shell.css`, `assets/app-shell.js` | Duka's own shell (rail / app-top / pill-nav) — **not** `@blackpaw/ui`'s `AppShell.tsx`; see `AGENTS.md` at the repo root for how the two relate |
| `assets/mascot/` | **The single source of truth for Haki mascot art** — see its own `README.md`. `@blackpaw/ui`'s `src/assets/` and `docs/assets/` mirror these files; if they ever drift again, this folder is the one to trust |
| `assets/hakiqa-logo.png`, `assets/hakiqa-logo-cut.png`, `assets/icons.svg` | Duka-specific logo lockup and icon sprite |

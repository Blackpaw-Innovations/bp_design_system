# Managed Odoo Branding — guidance, not a module

> **Status: guidance only.** This is deliberately *not* a working Odoo addon.
> Odoo theming is XML/Python/QWeb in Odoo's own module system, which can't be
> authored responsibly without a real Odoo instance to verify against —
> fabricating one here would mean shipping code that looks tested but isn't.
> This file scopes what a real `bp_odoo_theme` module (built and verified in
> Odoo's own toolchain, in Odoo's own repo) should consume from this package,
> so that work starts from the right tokens instead of reinventing them.

## What a Managed Odoo theme module should consume from `@blackpaw/ui`

Odoo's backend is server-rendered QWeb, not React — this package's
*components* don't port directly. Its *tokens* do, and are the actual
integration point:

| From `@blackpaw/ui` | Into Odoo as |
|---|---|
| `src/tokens/brand.css`'s `--bp-*`/`--color-*` values | SCSS variables in the Odoo theme's `primary_variables.scss` — hand-mapped once, not auto-generated, and re-checked whenever `brand.css` changes (see the "known gap" below) |
| `--bp-font-ui` / `--bp-font-display` / `--bp-font-label` (Urbanist / Newsreader / Manrope) | `$font-family-*` overrides in the same SCSS |
| `--bp-radius-*` | Bootstrap's `$border-radius*` variables (Odoo 17+ backend is Bootstrap-based) |
| The `[data-identity]` / `[data-vertical]` mechanism | **Does not port as-is.** Odoo's per-database theming is closer to `[data-identity]` (one deployment, one look) than `[data-vertical]` (one deployment serving many product lines) — a Managed Odoo instance is one Customer, so it needs exactly one resolved set of values, not a runtime attribute switch. |
| `ImpersonationBanner`'s copy and warning-tone treatment (`components.css`) | A server-rendered QWeb banner in the Odoo theme, reusing the same copy pattern ("You are viewing this account as: …") and the same `--bp-warning`-derived color, not React |

## The specific surfaces named in the platform brief

Login screen, app navigation, forms/buttons/status indicators, loading
states, error pages, favicon, client-logo handling, report styling, the
impersonation banner, and Blackpaw support entry points — all need this
mapping applied once in the Odoo theme module, then inherited by every
Managed Odoo deployment. None of them should be styled ad hoc per client
install; that's exactly the fork risk client white-labeling needs to avoid
(see the audit's Client / White-Label section).

## Client override boundary (proposed, mirrors the brief's hierarchy)

```
Blackpaw Design System  (this repo — brand.css)
        ↓
Managed Odoo Base Theme  (a new bp_odoo_theme module, consuming the table above)
        ↓
Client Brand Configuration  (per-Customer: logo, --color-accent override, login image)
        ↓
Client Deployment
```

A client should be able to override, per Managed Instance: their logo, one
accent color (`--color-accent`, not the raw `--bp-*` layer), a login-screen
image, and an optional "Managed by Blackpaw" footer line — through
configuration, not by forking the theme module's SCSS. Anything beyond
those four is a fork risk and should require the same review as a new
`[data-identity]` (see `AGENTS.md`).

## Known gap this doesn't close

There is currently no automated way to regenerate the Odoo SCSS mapping
when `brand.css` changes — it has to be updated by hand in the (not yet
created) `bp_odoo_theme` module. That's a real follow-on need once that
module exists, tracked here rather than solved speculatively before the
module does.

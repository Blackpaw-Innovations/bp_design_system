# Terminology

> **Status: PROPOSED — pending Blackpaw sign-off.** No canonical vocabulary
> existed anywhere in this repository before this file; a repo-wide search
> for "terminology," "tenant," and "organization" returned zero matches.
> These definitions are a reasonable starting point, drafted from how the
> codebase already uses these words (see the "Evidence" column) — not a
> ratified decision. Whoever owns product/brand decisions at Blackpaw should
> confirm or correct each row before this is treated as binding.

Different products already risk naming the same concept differently — the
exact failure this file exists to prevent. Where a term below conflicts with
something already shipped, that's a real conflict to resolve deliberately,
not a reason to silently keep both.

| Term | Definition | Evidence this is already the working meaning |
|---|---|---|
| **Customer** | The person or business that pays Blackpaw — may be a Managed Odoo client, a Hakiqa subscriber, or a Blackpaw platform customer. | Used loosely across `hakiqa-handoff/AUDIT_REPORT.md`; not yet distinguished from Tenant anywhere. |
| **Tenant** | One isolated account/data boundary within a multi-tenant product (a Hakiqa PWA install, a Managed Odoo instance). A Customer may have exactly one Tenant, or several. | `ImpersonationBanner`'s worked example ("Tenant: Hassan Electronics") — the one place this repo already uses the word with a specific meaning. |
| **Organization** | Reserved for a Customer's *internal* structure (departments, branches) inside one Tenant — not a synonym for Tenant. | No prior usage found; defined here specifically to stop it becoming one. |
| **User** | A person with login credentials to a product, scoped to one Tenant (or to Blackpaw internally). | `StatusChip`'s `STATUS_TONE_MAP` (`available`, `busy`) implies individual Users throughout. |
| **Administrator** | A User with elevated rights *within their own Tenant* — distinct from Blackpaw staff, who are never "Administrators" of a customer's Tenant, only impersonators of one (see `ImpersonationBanner`). | Inferred from the impersonation model; not previously named. |
| **Product** | One deployable thing a Customer subscribes to or is deployed to — a specific Hakiqa vertical (Duka, Gym, …), Nerve Centre, or a Managed Odoo deployment. | `[data-vertical]` in `brand.css` models exactly this granularity. |
| **Plan** | A priced tier of a Product (features/limits), independent of Subscription (the billing record). | Not previously used in this repo; defined for the pairing with Subscription below. |
| **Subscription** | The billing relationship between a Customer and a Product at a given Plan — has its own lifecycle (`trial`, `grace`, `suspended`, `cancelled`, …). | `StatusChip.STATUS_TONE_MAP`'s lifecycle keys are already exactly this vocabulary — this file just names what they were describing. |
| **Cell** | Not yet defined anywhere; if the platform brief's infrastructure sense (a deployment unit) is intended, define it alongside Environment below rather than overloading Tenant. | No usage found. |
| **Managed Instance** | One running Managed Odoo deployment for one Customer — the infrastructure counterpart to a Tenant's data boundary. | No usage found; proposed to avoid conflating "the data" (Tenant) with "the running thing" (Managed Instance). |
| **Environment** | `Production`, `Staging`, or `Development` — a deployment stage, orthogonal to Tenant/Customer. | No usage found. |
| **Workspace** | Avoid as a product-facing term until it's clear it means something distinct from Tenant or Organization — three names for the same idea is the specific problem this file exists to prevent. | Flag, don't define, until a real product needs it. |
| **Support** | Blackpaw's help channel, surfaced consistently as "Support" in the UI (see `hakiqa-handoff/DESIGN_SYSTEM_NOTES.md`'s shell notes) — not "Help," "Contact," or "Get help" interchangeably. | Existing Duka shell convention. |
| **Deployment** / **Release** | *Deployment*: putting a specific version live for a specific Customer/Environment. *Release*: a versioned, tagged build of a Product (see `CHANGELOG.md`) — a Release gets Deployed, not the reverse. | Modeled on this repo's own `CHANGELOG.md`/git-tag convention. |

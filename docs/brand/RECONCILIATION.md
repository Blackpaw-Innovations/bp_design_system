# Brand Reconciliation Record

Date: **2026-09-02**  
Inputs: Project Ironclad brand section, Blackpaw Operating System 2026, current
Blackpaw website, legacy `blackpaw_brand` repository and current
`bp_design_system` implementation.

## Finding

Blackpaw has accumulated several valid ideas from different stages of the
company, but they have been presented as peers. The result is avoidable ambiguity
about whether Blackpaw is an entrepreneurship organisation, an Odoo implementer,
a technology architecture studio, a business-transformation consultancy or a
software product company.

The reconciled answer is:

> Blackpaw is an African business-systems and technology architecture company.
> It understands operations, then designs, builds and operates connected systems
> that make complex businesses easier to run.

Odoo is an important engine, not the whole identity. Hakiqa is the product family,
not a synonym for Blackpaw. Transformation is the outcome, but “business
transformation company” alone is too broad to differentiate the company.

## Decisions

| Existing expression | Decision | Reason |
|---|---|---|
| Inspiring the Extraordinary | Retain as corporate tagline | Established logo equity; too abstract for the primary sales proposition |
| It just works | Retain as brand promise | Memorable expression of simplicity, reliability and ownership; requires qualification |
| You call Blackpaw when you want it done right | Retain as reputation aim | Strong and credible when earned; not another tagline |
| Build Africa's future on honest technology | Retain as mission | Distinctive moral and strategic direction |
| Technology Architecture Studio | Reframe | Useful category cue but “studio” can understate operational delivery and managed support |
| Business transformation company that happens to use technology | Reframe | Correct philosophy, too broad as the sole market category |
| Odoo Implementers in Kenya | Use for service/SEO context only | Describes a capability and location, not the master brand |
| Entrepreneurship, inclusion and community-building language | Retire from primary company positioning | Reflects an earlier thesis and conflicts with the current operating model |
| Global enterprise/government leadership | Treat as ambition, not present-tense proof | Preserves direction without overstating current scale |
| Automate 80% / perfect harmony / seamless | Retire unless evidenced | Absolute or numeric claims require scope and proof |
| Businesses have 99 problems | Use only as occasional campaign copy | Memorable but too playful and borrowed to carry the enduring purpose |

## Visual reconciliation

The legacy repository establishes Blackpaw's corporate equity in Gotham, deep
navy and a purple–violet–coral signature gradient. The current design system
primarily expresses Hakiqa through navy, cyan, teal and orange.

Both can coexist when their roles are explicit:

- corporate Blackpaw retains its restrained legacy palette and formal authority;
- Hakiqa retains its brighter, accessible product language;
- shared components consume semantic tokens rather than hard-coded brand colours;
- product-specific identities may override semantics without redefining Blackpaw.

The additive corporate tokens in `src/tokens/brand.css` preserve compatibility
with existing products while making this distinction machine-readable.

## Website correction priorities

1. Replace the primary hero with the customer proposition and a concrete proof-led subhead.
2. Rebuild About around the mission, current position and actual operating model.
3. Remove duplicated sections and legacy entrepreneurship copy.
4. Replace broad industry claims with demonstrated case studies.
5. Qualify absolute claims such as “perfect harmony” and numeric automation promises.
6. Present Odoo, integrations, products and managed support as capabilities under one method.
7. Label future platform capabilities as roadmap rather than current service.

## Governance note

This reconciliation changes messaging authority, not the approved logo artwork.
Logo source files remain in the private legacy repository pending a deliberate,
licence-aware asset migration.


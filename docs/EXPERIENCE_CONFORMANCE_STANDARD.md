# Hakiqa Experience Conformance Standard

Status: Proposed v1.0 · Owner: `bp_design_system` · Review date: 2026-10-07

## Purpose

This standard turns “Low effort in front. High rigour behind.” into a release
contract. Car Parts supplies reference evidence, but is not a pixel template.
Every vertical may express its domain while preserving the same interaction,
layout, state, accessibility and delivery invariants.

## Authority

- `blackpaw_brand` owns approved identity assets.
- `bp_design_system` owns tokens, fonts, primitives, page archetypes and these gates.
- `hakiqa-connect` owns the shared application shell and route contract.
- A vertical owns only its domain vocabulary, workflows and specialist views.
- Platform infrastructure owns production delivery and runtime headers.

## Blocking gates

| Gate | Contract | Minimum evidence |
|---|---|---|
| DS-01 Dependency | An approved, pinned `@blackpaw/ui` version and canonical token entrypoint are used. | Dependency and CSS import scan. |
| DS-02 Tokens | No unapproved font, raw colour, radius, shadow or arbitrary spacing value enters product code. | Static scan with zero new violations. |
| DS-03 Composition | Page gutters, containers, card padding, section rhythm and grid gaps use named tokens/archetypes. | Computed-style checks at required viewports. |
| DS-04 Shared components | Shell, dialogs, drawers, KPIs, status, empty states, view toggles and toasts are not locally cloned. | Import and similarity scan. |
| DS-05 Shell/navigation | Route manifest owns navigation, active state and deterministic parent back targets. | Every route and deep link exercised. |
| DS-06 Interaction honesty | Click affordances act; selection, navigation and disclosure are visually distinct; opposite-impact actions are separated. | Keyboard/click tests and action inventory. |
| DS-07 State completeness | Loading, empty, error, populated, disabled and permission states are deliberate and recoverable. | State matrix per page archetype. |
| DS-08 Responsive | No clipping, hidden action, horizontal overflow or viewport-trapped overlay. | 390×844, 768×1024 and 1440×900. |
| DS-09 Accessibility | WCAG 2.2 AA contrast, names, landmarks, focus, keyboard use, reduced motion and 44px targets. | Automated scan plus manual keyboard proof. |
| DS-10 Visual regression | Approved reference captures do not change silently. | Deterministic screenshots and reviewed diffs. |
| DS-11 Task effort | A frequent core task has one obvious primary action and at most three meaningful steps unless an approved safety requirement adds one. | Golden-path task ledger. |
| DS-12 Release conformance | All blocking evidence is tied to one commit and environment. | Signed machine-readable report. |
| DS-13 Production delivery | A production build—not a development server—is served; the app renders with required security/cache headers and no fatal console/network errors. | Header, asset, blank-page and console smoke tests. |

## Spacing and layout

The canonical spacing scale is 4, 8, 12, 16, 24, 32 and 48 pixels through
the `--bp-space-*` tokens. Page archetypes must declare their container and
gutter; pages may not invent a new outer geometry. A different density is a
named archetype or mode, not a page-local number.

## Page contract

Every route must declare: capability, parent route, page archetype, primary
action, permitted roles, data authority, and its six required states. A page
that cannot be reached from the manifest, cannot return to its parent, or has
no recovery from failure does not pass.

## Exceptions

An exception is a versioned record with the gate, affected files/routes,
business reason, owner, evidence, approval and expiry date. Inline suppression
without a matching live exception fails. New verticals start at zero exceptions;
legacy baselines may only prevent regression when paired with a dated burn-down.

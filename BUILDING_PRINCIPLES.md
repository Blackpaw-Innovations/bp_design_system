# Blackpaw design and app-building principles

Status: Canonical · Version 1.0 · Approved 2026

## The Blackpaw Way

**Low effort in front. High rigour behind.**

We build software that makes complex businesses easier to run. The user should not carry the complexity of our architecture, processes, integrations, controls, or edge cases. The system carries that weight through thoughtful defaults, automation, validation, traceability, and recovery.

For a core task, aim for:

- one obvious primary action;
- no more than three meaningful user steps; and
- an unambiguous confirmation of what happened and what comes next.

Three steps are a design constraint, not an excuse to hide risk or compress necessary understanding. A meaningful step is a decision or action—not every click, field, or system event.

## Eleven principles

### 1. Begin with the outcome

Name what the user is trying to accomplish before choosing screens, components, data structures, or technology. Use the user's language in navigation, headings, instructions, and actions.

### 2. Make the next action obvious

Each state should have a clear priority. Use one primary action, finite choices, and progressive disclosure. Secondary actions must not compete visually with the task that moves the user forward.

### 3. Let the system carry complexity

Move complexity into orchestration, defaults, automation, pre-filling, reconciliation, and background work. Never remove the user's control over consequential decisions.

### 4. Prevent before explaining

Constrain invalid choices, validate early, explain requirements near the point of action, and preserve entered work. An excellent error message is still second-best to preventing the error.

### 5. Close every loop

After an action, show what happened, what changed, whether anything remains, and how to recover. Avoid silent success, indefinite loading, and dead-end confirmation screens.

### 6. Design the whole state machine

A screen is incomplete without its loading, empty, partial, error, permission, offline, success, and recovery states. Design those states as part of the primary experience—not as later exceptions.

### 7. Reuse before invention

Build in three layers: components, patterns, and screens. Select a canonical screen recipe first; compose approved patterns second; create a new pattern only when the existing system cannot express the user outcome.

### 8. Build for real operating conditions

Assume interrupted work, slow or unreliable networks, small screens, shared devices, incomplete data, and users under pressure. Save progress, make status visible, and keep critical paths resilient.

### 9. Make trust inspectable

Consequential actions require clear permissions, auditability, dates, ownership, source information, and reversibility where possible. Do not use visual simplicity to conceal consequences.

### 10. Ship safely and learn continuously

Release small, observable changes. Use staged environments, automated gates, rollback paths, monitoring, user evidence, and a named owner. Improvement is part of the product lifecycle.

### 11. Earn “It just works”

Reliability is a user experience. Performance, security, accessibility, supportability, and operational readiness are product qualities—not backend concerns.

## The application manufacturing loop

1. **Understand** — define the user, outcome, constraints, risk, and success measure.
2. **Select** — choose the closest canonical flow, screen recipe, pattern, and identity.
3. **Configure** — apply permissions, terminology, data, and business rules without forking the system.
4. **Assemble** — compose approved components and semantic tokens.
5. **Validate** — exercise every state, breakpoint, permission, and critical task.
6. **Release** — promote through controlled environments with evidence and rollback readiness.
7. **Observe** — monitor reliability, effort, abandonment, errors, and support demand.
8. **Improve** — feed proven improvements back into the shared system.

## The reusable product stack

| Layer | Purpose | Examples |
|---|---|---|
| Components | Small interaction and presentation contracts | Button, field, dialog, card, table, alert |
| Patterns | Repeated task behaviours | Search and filters, approval, upload, stepper, bulk action |
| Screens | Complete functional work surfaces | Record list, detail, onboarding, invoice, work queue |
| Flows | Connected outcomes across screens | Lead conversion, reconciliation, support resolution |

The shared system should become the default menu. Bespoke work is justified by a distinct user need, not a preference for novelty.

### Page structure: quiet authority (premium set, 2026-10-08)

Richness comes from restraint, not more decoration. Five rules, each with its component:

1. **One hero per page.** Pages open with `PageHeader`, a compact title row. The record (a lease, a unit, a passport) is the hero, never a page banner repeating the tab name.
2. **Space before frames.** Group with space and one hairline (`Dock` + `DockSection` + `Facts`). A bordered box inside a bordered box is a defect, and so are pale tinted info boxes used as containers.
3. **Ledgers, not tiles.** Related numbers share one surface (`MetricLedger`), and parts of a whole share one bar (`MetricProportion`). Use `KpiStat` only for a number that genuinely stands alone.
4. **Dark means it matters.** `SealedCard` (`--color-sealed`) is for identity, a secret shown once, or the total someone must act on. At most two per screen.
5. **Confirmations whisper.** `useToast` shows one small dark notice at a time, bottom right, with the next step (`action`) and an optional `detail` line. A new notice replaces the current one.

## Definition of done

A Blackpaw application or material change is not done until it has evidence for:

- brand identity, Urbanist, tokens, and approved assets;
- clear information hierarchy and plain-language actions;
- loading, empty, error, permission, success, and recovery states;
- responsive keyboard, touch, and assistive-technology use;
- security, privacy, roles, and auditability appropriate to the risk;
- performance under representative devices, data, and networks;
- automated checks, visual regression, and critical-task tests;
- deployment, observability, ownership, support, and rollback readiness; and
- the repository's DS-01–DS-13 experience-conformance evidence.

A screenshot, manual review, or passing build alone is not proof of conformance.

## Builder decision path

1. Read `AGENTS.md`, `BRAND.md`, and this document.
2. Search the public design-system portal and shared components before creating anything new.
3. Import `src/tokens/index.css` and `tailwind.preset.js`; use approved assets by manifest ID.
4. Choose the identity and expression mode according to the surface's job.
5. Define the core task in three meaningful steps or explain why safety requires more.
6. Implement all relevant states and breakpoints.
7. Run `npm run check:brand` and `npm run check:experience`.
8. Attach evidence to the same release commit and environment.

If the shared system cannot cover a recurring need, propose a reusable addition. Do not silently invent a parallel standard inside one application.


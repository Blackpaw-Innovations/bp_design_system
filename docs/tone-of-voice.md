# Tone of Voice

> **Status: PROPOSED — pending Blackpaw sign-off.** No tone-of-voice
> document existed anywhere in this repository before this file. What
> follows is extracted from how the shipped components already write copy
> in their own JSDoc usage examples — a consistent, good instinct that was
> never written down as policy. Confirm or correct before treating this as
> binding; see `docs/terminology.md` for the companion vocabulary.

## The instinct already in the code

Every usage example in `src/components/` reads the same way, without anyone
having agreed on it:

- **`EmptyState.tsx`**: *"No invoices yet"* / *"Create your first invoice to
  start tracking payments."* — names the object plainly, says what to do
  about it, no apology.
- **`HakiTip.tsx`**'s worked example: *"No new messages"* / *"When a client
  replies, Haki brings it here first."* — present tense, tells the person
  what will happen, not what the system does internally.
- **`ImpersonationBanner.tsx`**: *"You are viewing this account as: Amina
  Yusuf"* — states the fact plainly, no hedging ("You appear to be…").

## The rule this implies

1. **Name the thing the person recognizes, not the system underneath it.**
   "Create your first invoice," never "Initialize an invoice record." A
   person manages *notifications*, not *webhook config*.
2. **Active voice, present tense.** A control says exactly what happens
   ("Publish"), and the confirmation after it says what happened
   ("Published") — not "Publishing may have succeeded."
3. **State facts, don't hedge.** `ImpersonationBanner` doesn't say "You may
   be viewing this account as…" — impersonation state is a fact, say it as
   one. The same applies to errors: say what's wrong and how to fix it, not
   "Something went wrong, please try again."
4. **No apology, no filler.** Nothing in the shipped copy says "Sorry" or
   "Oops" — a gap ("No invoices yet") is stated as a gap, with the one
   action that closes it.
5. **Technical detail only where the person needs it to act.** A Customer
   sees "Payment failed — update your card to keep your subscription
   active," not an error code; an internal/BICC-identity screen may show
   more, since its audience is explicitly technical (see `[data-identity=
   "bicc"]`'s "elegant & serious — for CEOs" framing in `brand.css`).

## Where this still needs a real decision

This file only covers what the existing components already imply. It does
not yet cover the harder cases named in the platform brief — billing/dunning
language, security notifications, and incident communication — because no
evidence of an existing pattern for those was found anywhere in this repo.
Draft those against real copy from a real flow, not invented here speculatively.

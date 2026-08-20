# Communications

> **Status: starter set, not a full system.** Two real templates exist here
> (`otp.html`, `payment-reminder.html`) to prove the pattern and give
> products something to actually use. The platform brief names ~18
> transactional message types (welcome, invitation, subscription renewal,
> suspension, incident, …) — most have no template yet. Add them here as
> real products need them; don't pre-build the full catalog speculatively
> (see the audit's "Do Not Overengineer" guidance).

## Why these are static HTML, not components

Email clients don't reliably support CSS custom properties, `@import`, or
even `<style>` in some cases (Outlook renders with Word's engine; Gmail
strips embedded `<style>` in certain contexts) — so every color/font value
below is the **resolved value** of a `src/tokens/brand.css` token, inlined
directly, with a comment naming which token it came from. There is
currently no automated way to keep these in sync when `brand.css` changes;
that's a real, open gap (the same one `docs/odoo-branding.md` names for
Odoo's SCSS mapping) — until it's closed, re-check these by hand whenever a
signal color or brand primary changes.

## Tone

Follows `docs/tone-of-voice.md` — state the fact, say what to do about it,
no apology. See each template for the applied example.

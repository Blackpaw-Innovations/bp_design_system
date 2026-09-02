# Brand Guidelines

## 1. Identity model

Blackpaw and Hakiqa are related, not visually interchangeable.

| Identity | Role | Character | Primary cues |
|---|---|---|---|
| Blackpaw | Company, advisory, engineering and trust mark | Quiet confidence, precision, authority | Deep navy, restrained purple–violet–coral signature, generous space |
| Hakiqa | Everyday product family | Clear, useful, encouraging, accessible | Hakiqa navy, cyan, teal and orange; warmer product expression |
| Product identities | Specific tools or verticals | Purpose-led within the system | Semantic overrides through approved design tokens |

Do not apply Hakiqa cyan/orange as the default Blackpaw corporate palette. Do not
apply the corporate gradient to routine product controls.

## 2. Logo

Until approved vector masters are migrated, use the source artwork in
`Blackpaw-Innovations/blackpaw_brand`; never recreate the mark from a screenshot.

### Lockups

- Full mark, wordmark and tagline: formal corporate applications and spacious
  signature moments.
- Mark and wordmark: default corporate use.
- Mark alone: avatar, favicon or established-brand context.
- Reversed lockup: dark navy, sufficiently quiet photography or approved gradient.

### Rules

- Preserve aspect ratio, colour and clear space.
- Use clear space of at least the height of the “B” in the wordmark.
- Do not distort, rotate, outline, recolour individual elements or add effects.
- Do not place the gradient logo on a visually competing background.
- Do not lock a campaign headline into the logo.
- At small sizes, omit the tagline before sacrificing legibility.

## 3. Colour

### Blackpaw corporate palette

| Token | Hex | Role |
|---|---:|---|
| Blackpaw light blue | `#EBEAFA` | Default document field; 10% tint of Electric Blue over white |
| Electric blue | `#3228CF` | Source blue, strong focus and signature gradient end |
| Corporate navy | `#0D0D50` | Primary dark field, authority, formal covers |
| Corporate purple | `#451D6A` | Secondary field and restrained emphasis |
| Gradient start | `#E8547A` | Signature gradient only |
| Gradient middle | `#8540E0` | Signature gradient only |
| Gradient end | `#3228CF` | Signature gradient only |
| Corporate teal | `#00A69C` | Positive emphasis and selected calls to action |
| Coral | `#FE635F` | Human accent; never the universal error colour |
| Off-white | `#F8F7FF` | Soft editorial surface |

Signature gradient:

```css
linear-gradient(135deg, #E8547A 0%, #8540E0 50%, #3228CF 100%)
```

Use the gradient for covers, hero moments, key dividers and signature motion—not
as a background for dense operational interfaces.

### Accessibility

- Body copy and controls must meet WCAG 2.2 AA contrast.
- Never rely on colour alone to communicate state.
- Test text against the exact point of a gradient or photograph where it appears.
- Corporate accent colours are not automatically safe for small text on white.
- Product status colours remain semantic and must not be replaced by brand accents.

## 4. Typography

Urbanist is mandatory in every Blackpaw and Hakiqa application. No product,
vertical or identity skin may replace it. The repository-hosted variable files
are the application source.

The historic Blackpaw identity uses Gotham. Gotham may be used only where the
organisation has a valid licence for the relevant files and distribution method.

| Context | Preferred | Fallback |
|---|---|---|
| All application UI | Urbanist | system sans-serif |
| Generated Blackpaw documents | Urbanist | system sans-serif |
| Approved corporate signature artwork | Gotham | Urbanist, system sans-serif |
| Office documents where Urbanist cannot be embedded | Google Sans candidate, pending licence approval | Arial, system sans-serif |

Do not distribute proprietary Gotham or Google Sans font files through public
packages without confirmed licensing. Newsreader and Manrope may support
editorial experiments but are not application fonts. Use Urbanist weight and
scale to create hierarchy; avoid excessive all-caps and artificial letter
spacing in body content.

## 5. Layout and shape

- Begin with a clear grid and generous negative space.
- Use asymmetry only when hierarchy remains obvious.
- Prefer one strong focal idea to a collage of technology motifs.
- Use the shared radius and spacing tokens in digital products.
- Cards group meaningful objects; they are not decoration for every paragraph.
- Operational screens prioritise density, scanability and state over cinematic effect.

## 6. Imagery

Show capable people doing real work in recognisable environments. Favour African
business reality without turning geography into costume or cliché.

Photography should feel observant, composed and human. Avoid generic handshake
imagery, implausible holograms, anonymous server rooms and images that imply a
client or capability Blackpaw cannot evidence.

3D and abstract forms may express connected systems, flows and transformation.
They must clarify or enrich a story—not compensate for weak content.

## 7. Iconography and diagrams

- Functional icons must be familiar, consistent and labelled when ambiguous.
- Signature illustration may be distinctive but must remain subordinate to meaning.
- Architecture and process diagrams use clear direction, named boundaries and a
  legend where necessary.
- Decorative network lines are not a substitute for a real system model.

## 8. Motion

Motion should explain relationship, state or progress. Keep routine interface
motion short and calm. Respect reduced-motion preferences. Reserve cinematic
sequences for brand storytelling; never delay a user's task for spectacle.

## 9. Product experience

Apply the Blackpaw Way:

- make the next action obvious;
- aim for three meaningful actions or fewer on frequent paths;
- prefill known information;
- reveal advanced complexity progressively;
- preserve user work through failure;
- provide confirmation and recovery guidance; and
- instrument completion, failure and abandonment.

“Simple” is measured through time, error, abandonment and support demand—not by
counting screens alone.

## 10. Documents and presentations

- State the decision or outcome early.
- Label assumptions, forecasts, targets and actuals distinctly.
- Use KES, dates, units and periods consistently.
- Cite evidence close to the claim.
- Use a restrained cover; internal documents need not imitate a campaign.
- Provide version, owner, status and review date for governed material.

## 11. AI-generated work

AI may accelerate drafting and exploration but does not approve brand work.

Every AI-produced public asset must be reviewed for:

- factual and capability accuracy;
- alignment with the message hierarchy;
- inappropriate claims or invented client evidence;
- visual consistency and accessibility;
- cultural representation and unintended stereotypes;
- rights, likeness and provenance; and
- security or confidential information.

## 12. Brand review gate

Before publication, confirm:

- the audience and intended action are explicit;
- the customer problem precedes the technology;
- claims are supported and current;
- only one primary message leads;
- the correct identity and tokens are used;
- logo, type, colour and contrast pass;
- mobile and reduced-motion behaviour pass where relevant;
- the result is understandable without founder explanation; and
- an owner and review date exist.

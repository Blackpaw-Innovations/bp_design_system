# Blackpaw Brand Foundation

Status: **Approved**  
Version: **1.0**  
Decision date: **2026-09-02**  
Decision owner: **Founder, Blackpaw Innovations**

## Locked foundation

- Blackpaw normally feels bright, clear and intelligent.
- White is the canvas.
- Blackpaw Light Blue is the working colour.
- Purple is the focus colour.
- Dark navy is the authority colour.
- Coral is the human-energy colour.
- The signature gradient is reserved for high-impact moments.
- Urbanist is mandatory across every Blackpaw and Hakiqa application.
- Gotham is reserved for approved logo artwork and signature brand moments.
- Google Sans is not approved for distribution; it remains an office-document
  candidate subject to licence verification.
- Blackpaw and Hakiqa are related identities, not interchangeable skins.

## Approved primitive colours

| Token | Hex | Provenance |
|---|---:|---|
| `blackpaw.light-blue` | `#EBEAFA` | Approved 10% tint of Electric Blue over white |
| `blackpaw.electric-blue` | `#3228CF` | Official reference gradient end |
| `blackpaw.purple` | `#451D6A` | Official reference Deep Purple |
| `blackpaw.violet` | `#8540E0` | Official reference gradient middle |
| `blackpaw.coral` | `#FE635F` | Official reference Coral Red |
| `blackpaw.coral-rose` | `#E8547A` | Official reference gradient start |
| `blackpaw.navy` | `#030347` | Official reference Dark Navy |
| `blackpaw.deep-navy` | `#0D0D50` | Official reference Deep Navy |
| `blackpaw.wordmark-navy` | `#12127A` | Official reference Wordmark Navy |
| `blackpaw.white` | `#FFFFFF` | Official reference white |
| `blackpaw.off-white` | `#F8F7FF` | Official reference Off-White |
| `hakiqa.cyan` | `#01ECFF` | Existing product token |
| `hakiqa.teal` | `#00A5B8` | Existing product token |
| `hakiqa.orange` | `#FD8A03` | Existing product token |
| `hakiqa.navy` | `#032053` | Existing product token |

## Four token layers

1. **Primitive:** immutable approved colours and type families.
2. **Semantic:** background, surface, ink, focus, accent and border roles.
3. **Expression:** Clear, Authority, Human, Precision and Signature modes.
4. **Component:** document cover, table header, callout, diagram node and other
   specific uses.

Components consume semantic or component tokens. They must not hard-code a
primitive colour unless the brand guidelines explicitly define that component
as a fixed signature asset.

## Expression modes

| Mode | Combination | Default use |
|---|---|---|
| Clear | Light blue + white + purple focus | Standard Blackpaw documents and information pages |
| Authority | Purple + deep navy + white | Executive, governance, security and enterprise material |
| Human | Coral + white + restrained purple | People, culture, stories and announcements |
| Precision | White + light blue + ink + purple data focus | Technical, financial and architecture material |
| Signature | Purple–violet–blue/coral gradient + white | Covers, launches and rare brand moments |

## Change control

Changes to the mission, proposition, promise, tagline, primitive palette,
mandatory application font or brand architecture require:

1. a written decision with rationale;
2. founder approval;
3. a brand-system version change;
4. token and template migration notes; and
5. verification in at least one representative application and document.


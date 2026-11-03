# Premium patterns

**Status:** v1.25.2, 3 Nov 2026 (v1.25.1: text hierarchy, NeedsYouCard slots; v1.25.2: SelectableRow, MoneyHero `title`, one money format). The phone look every Hakiqa vertical builds its screens from. Change it here once;
every app picks it up with its `@blackpaw/ui` pin bump.
**Code:** `src/components/PremiumKit.tsx` (one implementation per pattern, exported from `@blackpaw/ui`), styles
`src/tokens/premium-kit.css` (`.bp-pk-*`, imported last by `tokens/index.css`). Examples:
`docs/examples/PremiumKit.example.tsx`.
**Origin:** built for Hakiqa Stay in hakiqa-connect (`kit/premium.tsx`, `docs/design/stay-premium-patterns.md`,
2 Nov 2026, after Marvin called Payments bland), moved here so every vertical shares one copy.

## The idea in one paragraph

A screen is a calm page with one navy moment. The navy hero card says the one number that matters, big, in white,
with what it is measured against. Below it, the screen's single orange action (if anything needs a person), then the
evidence: quiet white cards of rows grouped by day, each row reading like a receipt. The day ends with a card you can
send. Everything else stays out of the way. Think Apple Wallet's pass, Revolut's balance, a host's Today tab, in our
own clothes: Urbanist, navy, Signal Blue, one orange.

## Text hierarchy (every card and row)

Every card and row reads in three levels. A reader sees what matters first without parsing a paragraph.

| Level | What it holds | Size / weight | Colour |
|---|---|---|---|
| Heavy | The one thing to act on or the record's name: "1 booking to confirm" | 17/800 | `--c-ink` |
| Medium | Supporting facts, one per line: "Suite 1 · 3 nights", "9 Nov 2026" | 15/600 | `--c-ink` |
| Light | Explanation, one full sentence: "Nothing is billed until you confirm." | 15/500 (13/500 in dense rows) | `--c-muted` |

- One fact per line. A component takes facts as `meta: string[]` and renders each on its own line.
- " · " only joins short labels on one line ("Suite 1 · 3 nights", "14:23 · SO2600134"). Never join different facts
  into a sentence with it.
- Secondary items ("also waiting") are tappable count rows (bold count, plain label, chevron, 44 px), not prose.
- Sentences end with a full stop. Labels, titles and facts do not.
- The slots enforce it: NeedsYouCard `title` / `meta` / `explanation` / `also`; TapRow, PersonCard and FigureRow
  `title` / `meta` / `sub`; ReceiptRow `meta` as one label line or an array of facts.

**Don't** (one grey paragraph, everything the same weight):

```tsx
<NeedsYouCard title="1 booking to confirm" action={<Button variant="primary">Confirm</Button>}>
  Suite 1 · 9 Nov 2026. Nothing is billed until you confirm. Also: 2 guests have not arrived yet · 4 calendar links
  are not reading · 2 guests leave today
</NeedsYouCard>
```

**Do** (heavy title, medium facts, light sentence, also as rows):

```tsx
<NeedsYouCard
  title="1 booking to confirm"
  meta={['Suite 1 · 3 nights', '9 Nov 2026']}
  explanation="Nothing is billed until you confirm."
  action={<Button variant="primary">Confirm</Button>}
  also={[
    { count: 2, label: 'guests have not arrived yet', href: '/today?arrivals' },
    { count: 4, label: 'calendar links are not reading', href: '/settings/calendars' },
    { count: 2, label: 'guests leave today', href: '/today?departures' },
  ]}
  renderLink={link}
/>
```

## House rules (every pattern)

| Rule | Value |
|---|---|
| Font | Urbanist. Mono (`ui-monospace, "JetBrains Mono", …`, no new download) only for codes inside a CodeChip. Never for figures; figures are Urbanist `tabular-nums`. |
| Type steps | 28 / 20 / 17 / 15 / 13. One exception: the hero figure is 44 px (once per screen). |
| Navy | `--pk-hero` = `var(--hero-identity, var(--identity))` (#032053) on the `.hero-card` class (its light and sheen). One navy card per screen. In dark it stays navy and gets a 1 px subtle border. |
| Text on navy | White only, full opacity. Colour on navy only as a fill behind (`--pk-on-hero-fill`, white at 15 %). Never orange, blue, green or amber text on navy. |
| Orange | THE one main action of the screen (`<Button variant="primary">`). It lives in the NeedsYouCard when there is one. No decision waiting: no orange, except on a screen whose job is making something (New order, Add a member); that action is its orange while nothing waits and drops to solid blue while a NeedsYouCard is shown. |
| Signal Blue | Interactive. Solid (`variant="secondary"`) at most once per card; everything else `quiet` or `tertiary`. |
| Surfaces | `--c-surface`, `--c-border`, radius 20 for cards, 28 for the hero. No shadows, no gradients. Flat. |
| Targets | 44 px minimum. A smaller visual (CodeChip, 28 px) carries an invisible 44 px hit area. |
| Theme | Light and dark both from tokens. No hex in pages. The `--pk-*` tokens read the app's own variables first (`--pos`, `--neg`, `--warn`, `--v-*`) and fall back to the Hakiqa values. |
| Words | The vertical's own words for its records; say what happened and what to do. |
| Truth | Every number on screen is computed from loaded data. A figure that might be incomplete says so ("At least"). A comparison that cannot be proven is not shown. |
| Links | `href` plus an optional `renderLink` (the DataTable convention) so an app's router Link wraps the DS link; without it a plain `<a href>`. |

## The patterns

### 1. MoneyHero

`<MoneyHero title? amount currency caption floor? compare? stats? renderLink? />`

- `title` (20/800 white, above the figure) names the record on a detail screen ("Order SO2600134", "Suite 1"), as on
  CountHero; a list screen leaves it out. It is not read into the figure's accessible text.

- Navy `.hero-card`, radius 28, padding 24 top / 20 sides / 16 bottom. First thing on the screen (it replaces the
  page title; the app bar already names the screen).
- Figure: currency 17/800, figure 44/800, tracking -0.03em, `tabular-nums`, white. `floor` adds "At least" (15/700)
  above it.
- Caption under the figure, 17/600, says what the number is: "in today from 18 payments", "sold today so far". No
  eyebrow or label above the figure, ever.
- Count-up: on first show and whenever the value changes, the figure counts from the previous value to the new one,
  700 ms, exponential ease-out (`useCountUp`). A page in the background gets no animation frames, so a timer lands it
  on the final value when the count should be over. The heading's accessible text is the final value (a hidden span);
  the counting span is `aria-hidden`.
- `compare` (`HeroComparison`): one chip under the caption (white 15 % fill, 13/700 white, arrow up/down/equal icon),
  e.g. "KES 36,000 more than yesterday by 14:30". Only when the data proves it. Never "vs last week" from a guess. The
  very first day says so (direction `new`, sparkle icon); a later day after a quiet one shows no chip.
- `stats`: a StatStrip on navy along the bottom (pattern 6). Max 3 items on a phone.

Do: one hero per screen, for the money or count the screen exists for. Don't: a second navy card below it; colour the
comparison green or red (direction is the arrow); buttons inside the hero (the action belongs in the NeedsYouCard).

### 2. ReceiptRow (proof row)

`<ReceiptRow name avatarKey? amount currency meta code? codeLabel? status? fresh? freshLabel? as? rowProps? />` inside a DayGroup.
`meta` is one short label line (string) or facts one per line (`string[]`, medium 15/600 ink).

- Left: `<Avatar calm>` (initials, colour pair from the name). Never a silhouette.
- `fresh` (from `useArrivals(ids, ready)`): a receipt that lands while the screen is open slides in from 8 px above
  (320 ms), gets a soft green wash and a green tick on its avatar for 2 s, a 20 ms buzz where the phone allows it, and
  a polite `freshLabel` ("Just paid") for screen readers. The first load never counts as an arrival.
- Line 1: who (17/800, wraps, never truncated) and the amount at strength on the right (`MoneyFigure`).
- Line 2: time and record reference (15, muted), "14:23 · SO2600134"; a status chip at the right end only when not
  final ("To confirm", TintChip warn).
- Line 3: the provider's code as a CodeChip (pattern 7): "M-Pesa SAMPLE4AB4D51F" with a copy icon.
- Hairline between rows, inset to start after the avatar. No card per row.
- Not a link. When the receipt has a detail page, use TapRow.
- `as` / `rowProps`: an app with a motion library may swap the `<li>` (`as={m.li}`, `rowProps={{ layout: 'position', exit: … }}`) for layout and exit motion.

### 3. DayGroup

`<DayGroup title aside?>rows</DayGroup>`

- Heading 20/800 ("Today", "Yesterday", then "31 Oct"), the day's total on the right (15/600 muted, tabular).
- Rows sit inside ONE white card (radius 20, 1 px border). 24 px below each group.
- Rows that arrive while the screen is open animate through their own `fresh` flag; the first paint does not animate.

### 4. NeedsYouCard

`<NeedsYouCard title meta? explanation? also? alsoTitle? action renderLink? />` with
`NeedsYouAlso { count, label, href?, onClick? }`

- White card, radius 20. A 10 px orange dot with a soft breathing glow (still under reduced motion) before the title.
- `title` (heavy, 17/800) says the count and the thing: "1 payment needs a person". No full stop.
- `meta` (medium, 15/600 ink): the facts, one per line ("Suite 1 · 3 nights", "9 Nov 2026"). No full stops.
- `explanation` (light, 15/500 muted): one full sentence of why, ending in a full stop.
- The action is the screen's orange `<Button variant="primary">`, full width on a phone, verb first, at most three words.
- `also`: the other kinds of waiting, under a small "Also waiting" label (13/700 muted; `alsoTitle` renames it), as
  44 px rows with hairlines: bold count (15/800), plain label (15/500), chevron when the row has `href` or `onClick`.
  Below the action, so the card's main job stays first. Never a sentence of "Also: …".
- Only when something is waiting. Directly under the hero. Never more than one per screen; several kinds of waiting
  become one card, the most urgent as the title and the rest in `also`.
- `children` still renders as the light line for v1.25.0 callers. New code uses the slots.

### 5. DayCloseCard

`<DayCloseCard title? date lines message share? phone? />`

- White card at the bottom of the day's list. "Close the day" 20/800 with the date right (15 muted). The same card
  closes other moments with its own `title` ("Deposit settled", "Trip complete").
- Two to four lines like a till slip: label left (15 muted), value right (15/800 tabular), dashed hairlines between.
- One solid Signal Blue `ButtonLink` "Share on WhatsApp" (MessageCircle icon), full width, opening
  `whatsAppLink(phone, message)` with the same facts in one sentence. `phone` sends it straight to one person.
- Values say "Nothing" rather than "0" when the good outcome is none.

### 6. StatStrip

`<StatStrip items onNavy? renderLink? />` with `StatStripItem { key, label, value, onClick?, href? }`

- 2 to 4 equal columns over a hairline (white 20 % on navy, `--c-border` on a page).
- Label 13/700, value 20/800 `tabular-nums`. On navy both are white.
- An item with somewhere to go (`onClick` or `href`) is a 44 px target with a chevron after the label and a press
  state (white 10–15 % on navy, `--c-selected` on a page). A zero is not tappable.

### 7. CodeChip

`<CodeChip label? value />`

- 28 px tall, radius 8, `--c-sunken`, label 13/700 muted ("M-Pesa"), value in mono 13/600 ink, copy icon.
- Tap copies; the icon turns to a check for 1.6 s and a polite live region says "Copied". 44 px hit area via `::before`.
- For every machine code a person may read out or paste: M-Pesa codes, bank refs, record refs. Never decoration.

### 8. TapRow (list-to-detail affordance)

`<TapRow href?|onClick? renderLink? title meta? sub? figure? leading? label? after? tour? id? glow? />` inside a DayGroup or RowGroup.

- Words in three levels: `title` heavy (17/800), `meta` facts one per line (15/600 ink), `sub` light (15 muted). PersonCard and FigureRow take the same `meta`.

- The whole row is the target (min 56 px), chevron right (18, muted), press state `--c-selected`, focus ring Signal
  Blue inside the row.
- `href` navigates; `onClick` opens a sheet over the screen so closing it returns to the same scroll. Same look.
  `tour` sets `data-tour` for a demo guide.
- `after`: at most one quick action (quiet, never orange) under the row and outside its target.
- With neither `href` nor `onClick` it renders as a plain row: no chevron, no press state (a reader without rights).
- Only rows that open something get a chevron.
- `id` and `glow`: a row just made or confirmed is scrolled to and lit (see "Moments after a change").

### 8a. SelectableRow (pick some, open one)

`<SelectableRow selected onSelectedChange selectLabel? disabled? href?|onClick? renderLink? title meta? sub? figure? leading? label? tour? id? glow? />`
inside a RowGroup or DayGroup.

- A TapRow you can also pick, for bulk actions (send these orders to the supplier, pay these bills). Same words, same
  three levels, same figure and chevron as TapRow.
- Two targets, side by side, never nested: a 44 px checkbox on the left (22 px box, Signal Blue when picked) picks;
  the rest of the row opens the record (`href` / `onClick`, chevron, press state). Picking never opens; opening never
  picks.
- With neither `href` nor `onClick` the whole row picks (a list you only choose from): no chevron, the row is the
  checkbox's label.
- A picked row sits on the info tint. `disabled` holds the checkbox only; the row still opens.
- Screen readers: a native checkbox named by the row's title (`aria-labelledby`). When the title alone is ambiguous
  (two orders for the same customer) pass `selectLabel` ("Pick SO2600134").
- The group heading says what is picked ("2 of 14 orders picked"); the bulk action is the screen's one primary button,
  shown only while something is picked. "Pick all" is a plain button above the group, not a row.

Do: SelectableRow when a screen has a bulk action. Don't: a checkbox inside a TapRow's target, or long-press to select.

### 9. CaredEmpty

`<CaredEmpty image? title action?>how it gets here</CaredEmpty>`

- When a whole screen or list has nothing yet, not per section. White card, the mascot (`image`, 112 px) above a
  20/800 title, one 15 muted line, at most one action.
- Hakiqa apps pass a Haki pose: `waving` first run, `relieved` all clear, `searching` no match, `celebrating` a real
  milestone only. The DS ships the poses under `src/assets/brand/hakiqa/mascot/`; an app may use its own transparent copies.
- The title says what WILL be here ("Your first payment lands here"), not that nothing is ("No payments").

### 10. SettingsList and SettingsItem

`<SettingsList title action?><SettingsItem label value? /></SettingsList>`

- Phone settings and account pages that state how things are set. (The desktop band-and-pill settings layout stays
  `SettingsCard` / `SettingsGroup` / `SettingRow`, §17.9a.)
- Group title 20/800 with at most one quiet action on the right ("Change"); rows in ONE white card, hairlines between.
- Row: what it is, 17/700 ink, said as the outcome ("Orders are paid before collection"), its value under it, 15
  muted, in plain words. Min 56 px. Not a link, no chevron.
- What waits on the owner goes in the page's one NeedsYouCard above the groups.

### 11. CountHero (a count instead of money)

`<CountHero title? count caption floor? headline? chip? progress? stats? renderLink?>children</CountHero>`

- MoneyHero's card for a count: figure 44/800, no currency, counts up the same way; the caption (17/600) says what is
  counted and against what: "of 17 free tonight", "jobs for today", "to collect today, 2 late".
- `title` (20/800 white) names the record on a detail screen; a list screen leaves it out.
- `chip`: one white-on-15 % line, usually who or what is next ("Next: Grace at 15:00").
- `progress` `{ done, total, label }`: a thin white bar on white 20 % with its words above ("3 of 7 done"). Only from
  loaded records.
- `headline` replaces the figure when the day's job is done: a calm check in a white 15 % circle and the words at
  28/800 ("Everyone is in."). Never confetti.
- `children`: a small picture of the figure, white on navy only.

### 12. RowGroup and CardSection

`<RowGroup title? aside?><TapRow …/></RowGroup>` · `<CardSection title aside?>content</CardSection>`

- RowGroup is DayGroup for lists that do not grow while you look. CardSection is the same heading over one white
  card of free content (a history, a note).

### 13. DoneCard (the small celebration)

`<DoneCard title action?>what is now true</DoneCard>`

- When a person finishes real work: a 40 px green check that pops in once (still under reduced motion), the result as
  the title ("Bay 3 is ready"), for whom in one muted line, the next thing as the screen's one orange action.
- Never for routine saves (a toast is enough), never with the mascot.

### 14. InitialsTile

`<InitialsTile name filled />`

- A record's initials (15/800 white) on a 48 px navy tile, ringed by how full it is (`filled`, 0 to 1): a white arc
  over a 22 % track. The leading visual of a TapRow when there is no photo (a place, a branch, a class).

### 15. FigureRow (a breakdown line)

`<FigureRow title meta? sub? figure? />` inside a DayGroup or RowGroup.

- A line that opens nothing and is not a receipt: an item's share, a channel's total. Title 17/800, one muted line,
  the figure on the right (`<MoneyFigure size={17}>`). Min 56 px, hairlines, no chevron, no avatar.

### 16. PersonCard (a person with one job)

`<PersonCard name avatarKey? sub? meta? figure? chips? action? onOpen title? leading? tour? as? rowProps? />` inside a DayGroup.

- The top is one button that opens the person (calm avatar 40, name 17/800, line 2 in desk words, money at strength
  or a green "Paid", chevron).
- Under it, indented to the text: only what is not right yet as warn TintChips, or one green "Ready" when nothing is;
  and the one action for this person on the right. The screen's one orange goes to the next person who is fully ready.
- Codes do not appear on the card; they live in the detail panel as a CodeChip. A record that leads with something
  else (a pickup) passes `title` and `leading`.
- `as` / `rowProps` as for ReceiptRow (a card that leaves the list can fade out while the others close the gap).

### 17. CheckBurst

`<CheckBurst />` at the top of the sheet that follows a real arrival, departure or handover.

- A 72 px green check that draws itself in a soft ring: ring 600 ms scale and fade, tick drawn over 450 ms. Once.
  Reduced motion: the finished check at once.
- Under it one 20/800 line that says what happened by name, one muted line of facts, then the handover (one solid blue).

### 18. ReceiptCard (a bill someone keeps)

`<ReceiptCard title aside? lines totals id?>footer</ReceiptCard>` with `SlipLine { key?, label, sub?, value }`

- A till or folio slip, not a table. White card, radius 20. Title 20/800, optional aside. Lines: label 15 ink (a 13
  muted sub line), amount right (`MoneyFigure size={17}`), dashed hairlines.
- Totals under a 1 px ink rule; the last row at strength (17/800 label, 20 figure). Nothing left: "Nothing" with a tick.
- Footer: how to pay as CodeChips and one quiet "Share on WhatsApp" carrying only what the card shows. Never a
  private link or a door code in a share message.

### 19. The customer's welcome hero (public pages)

- A public page for a customer has no money hero: its one navy `.hero-card` (radius 28) is the welcome (name 28/800,
  what and where 17/600, dates as white 15 % tiles). Built per vertical from the same tokens; no shared component yet.

### 20. DoneNote (the moment after a decision)

`<DoneNote title action?>what happened</DoneNote>`

- After a decision that reaches a customer: a pale positive card (`--pk-pos-tint`, radius 16), a white check in a
  green disc, the title 15/800 says what is now true ("Confirmed: Nyokabi, 2 Nov"), one 15 muted line says what was
  sent and to whom, only what really was.
- One follow-up as the card's blue, full width: Send on WhatsApp (`whatsAppLink(phone, text)`).
- It replaces the row's quick action where the decision was made, `role="status"`, for about 20 s; the toast stays quiet.

### 21. DangerAction (undo or remove)

`<DangerAction icon? onClick>Cancel this order</DangerAction>`

- The last thing in a sheet, over a hairline: red text 15/700 with an optional icon, no fill, no border, 44 px, a pale
  red press state. Always opens a confirm step; never acts on the first tap.
- Never `variant="tertiary"` with a red class: tertiary's Signal Blue wins and it reads as a link.

### 22. Greeting (Home)

`<Greeting name image?>one sentence about today</Greeting>`

- Above Home's hero only: the mascot (`image`, Haki `waving`, 48 px), then "Good morning, Marvin." (17/800, by the
  phone's clock via `greetingFor()`: morning before 12, afternoon before 17, evening after; first name only) and one
  plain line about today (15 muted). Never a card, never a button. Leave `image` out when the mascot is off.

### 23. SwitchRow and TimeRow (settings that save on tap)

`<SwitchRow label hint? checked disabled? busy? onChange />` · `<TimeRow label value onChange />` inside a SettingsList.

- Per-person choices that take effect when tapped: no edit panel, no Save. The caller saves on change.
- SwitchRow: 17/700, one line of why 15 muted, the DS switch (`.bp-switch`) on the right, green when on (a state, not
  an action, so it never spends the card's blue). The whole 56 px row is the button (`role="switch"`). `disabled` holds
  the row while a save runs (wait cursor, no fading); `busy` only sets `aria-busy`.
- TimeRow: label 17/700 and a quarter-hour time Select on the right (128 px), shown only while its switch is on.

### 24. ProfileHero (my account)

`<ProfileHero name detail? role />`

- The account page's one navy moment, as a pass: the DS `Avatar calm` at 64 px (no orange or red pair) with a white 30 % ring, the name 28/800, how
  they are reached (15, white), what they may do as a white 15 % chip ("Manager, Owner"). Replaces the page title.

### 25. The small parts

`<Avatar calm name id? size? />` · `<MoneyFigure amount currency? size? />` · `<TintChip tone?>text</TintChip>` · `moneyParts()` (see Money)

- `Avatar calm`: initials on a calm tint from the name (or `id`): `AVATAR_PAIRS` without orange and red, so a person
  never wears the action or the warning colour. Same name, same colour, every screen.
- MoneyFigure: currency 13/700 muted, figure 20/800 (17 in dense lists) `tabular-nums`; a dash with no amount.
- TintChip: one short state, 13/700 on a tint: `warn` what still needs doing, `pos` good news, `plain` a neutral fact.

### Money (one format, every vertical)

Every amount on every vertical is written the same way: **`KES 15,000`**. ISO code, a space, comma thousands, decimals
only when there are cents (`KES 42.10`), minus before the code (`−KES 350`), a dash for no amount. KES and not KSh: it
matches the bank statement and the M-Pesa receipt, and it is the written rule in `HAKIQA_APP_STANDARDS.md` §12 ("Never
type 'Ksh' or 'KSh' by hand") and `BRAND_GUIDELINES.md` ("Use KES … consistently").

- `formatMoney(amount, currency?, { decimals? })` gives the string, for sentences, captions, chips and `aria-label`s.
- `moneyParts(amount, currency?, { decimals? })` gives `{ sign, currency, figure }` for an amount with its own emphasis.
  `formatMoney` is these parts joined, so a hero, a row and a sentence can never disagree.
- `<MoneyFigure>`, `<MoneyHero>`, `<Money>` and DataTable money columns all go through them.
- Currency: pass the record's ISO code. Missing means KES; "KSh", "Ksh" and "KShs" are read as KES. Another currency
  (USD on an Imports supplier bill) keeps its own code; amounts in different currencies are never summed.
- Big numbers in chart labels and small tiles only: `fmtKM` (KES 1.2M). Everywhere else the full amount.

**App-local formatters delegate.** An app may keep a thin wrapper for its own data shape (a `{ amount, currency }`
contract value, a "currency not set" note), but the wrapper calls `formatMoney` / `moneyParts` and never builds the
string itself: no `` `KSh ${n.toLocaleString()}` ``, no `CUR = "KSh"`, no `Intl.NumberFormat` on money, no
`.toFixed(2)`. Input labels say "Amount (KES)".

### Moments after a change

When a record is made or confirmed and the list re-sorts, the screen scrolls the row into view and lights it
(`<TapRow id glow>`, `.bp-pk-glow`: the info tint held, then faded, 2 s). A sheet opened from a board card opens on its
DoneNote.

## Motion rules

| What moves | How | Duration / easing |
|---|---|---|
| Hero figure | counts from the old value to the new; a timer lands it if the page gets no frames | 700 ms, `1 - 2^(-10t)` |
| A row that arrives (`fresh`) | fades in, slides 8 px down into place | 320 ms, `cubic-bezier(.16,1,.3,1)` |
| A payment that lands while open | green wash + tick on the avatar, then a plain row | 2 s, colour 500 ms |
| Needs-you dot | breathing glow | 2.6 s loop |
| Progress bar | width eases to the new share | 700 ms |
| DoneCard check | pops in once | 420 ms, slight overshoot |
| CheckBurst | ring 0.7 to 1 and fades in; the tick draws | 600 ms; tick 450 ms from 150 ms |
| Presses | background colour only | 150 ms |
| A row just made or confirmed | info tint held then faded | 2 s ease-out; still tint under reduced motion |

Nothing else moves: no entrance on first paint, no bouncing, no parallax, no spinning. Under
`prefers-reduced-motion: reduce` the figure shows its final value at once and every animation above stands still.
The screen must read the same with all motion off. Layout and exit motion for list rows is the app's choice
(`as` / `rowProps`); the DS itself ships CSS only.

## Do and don't

| Do | Don't |
|---|---|
| One navy hero with the one number, big | A title that repeats the hero |
| "KES 36,000 more than yesterday by 14:30", when proven | "+12% vs last week" from a partial list |
| The amount at 20/800 with a 13 px muted currency | All text the same 15 px weight |
| "KES 15,000" from formatMoney / MoneyFigure | "KSh 15,000" or "Ksh15000" built by hand |
| A checkbox beside the row, the row opens (SelectableRow) | A checkbox inside the row's tap target |
| Title heavy, facts one per line, one light sentence | Facts strung into a grey paragraph with " · " |
| "Also waiting" as count rows you can tap | "Also: 2 guests … · 4 links …" as prose |
| The code in a quiet mono chip that copies | The code as a third grey text line nobody can use |
| One white card per day, hairlines between rows | A card per row; shadows; gradients |
| One orange button, in the NeedsYouCard | Orange anywhere else; orange text |
| White text on navy, chips as white 15 % fills | Green "up" text or amber hints on navy |
| Chevron only on rows that open something | Chevrons on everything "for consistency" |
| The mascot on a first-run empty list | The mascot on every empty section or next to errors |
| Count-up once on load and on change | Count-up on every render or on scroll |
| Cancel / Disconnect as red text at the bottom, with a confirm | A blue "Cancel this order" that looks like a link |
| After Confirm: "Confirmed: Nyokabi" and Send on WhatsApp, where it happened | A toast that vanishes while the list re-sorts |

## Adopting it on a screen (checklist)

1. What is this screen's one number? MoneyHero (money) or CountHero (a count). Prove its comparison or leave it out.
2. What needs a person? One NeedsYouCard with the screen's only orange action. Nothing waiting: no card, no orange.
3. The evidence: DayGroup + ReceiptRow (money in) or TapRow / PersonCard (records that open); SelectableRow when the
   list has a bulk action. Codes in CodeChips. Every amount through formatMoney / MoneyFigure (KES).
4. End-of-day screens: a DayCloseCard with Share on WhatsApp.
5. Empty: CaredEmpty with the right pose. Loading and errors stay with the app's query boundary.
6. Check at 375 px in light and dark: no sideways scroll, 44 px targets, white-only on navy, one orange.

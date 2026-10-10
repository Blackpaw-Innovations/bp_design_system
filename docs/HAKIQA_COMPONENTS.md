# Hakiqa app components (standards §17)

**Status:** proposed 10 Oct 2026 (round 2, after Marvin's feedback on Tiers 1–3). Applies to every Hakiqa vertical.
**Lives at:** `bp_design_system/docs/HAKIQA_COMPONENTS.md`. `HAKIQA_APP_STANDARDS.md` §17 points here.
**Code:** `@blackpaw/ui` (`src/components/*`, styles `src/tokens/components.v17.css`, imported last by `tokens/index.css`).
**Reference renders:** `Hakiqa Components Tier 1/2/3.dc.html`, `Hakiqa Components Round 2 Feedback.dc.html` (R1–R7), `Hakiqa Components Round 2 Workflows.dc.html` (W1–W6). Every render has Light, Warm and Dark.

Rules that apply to all of them: 44 px minimum targets, 16 px input text, labels 15 px weight 700, sentence case, tokens only (no hex in pages), one primary per view, a 2 px Signal Blue focus ring, Escape closes layers and focus returns. **Below 640 px every picker, menu and dialog is a bottom sheet** (`useIsPhone`).

---

## Tier 1 · forms, overlays, lists

### 17.1 Select · `<Select>`, `<MultiSelect>`
- Search appears **by itself at 8+ options**, as the first row; the placeholder states the count ("Search 12 suppliers"); it matches anywhere in the label.
- Rows 44 px (52 px in the sheet), 6 visible, then scroll. The chosen row has the selected tint and a check.
- Required: no empty row; the field starts on "Choose a …". Optional: `optional` adds "None" first; the Field says "(optional)".
- Multi: checkboxes, a Done button, two chips in the field then "+n". `selectAll` only over 20 options and only when picking all is a real job.
- Phone: always a sheet titled with the field label; a searchable sheet opens full height.
- Keyboard: arrows, Enter, Escape, type-to-jump.
- **Never:** native `<select>` (check `native-select`), "Please select…", a Select for 2–3 visible choices (Segmented or RadioGroup), a Select whose options are actions (`<Menu>`, 17.23).

### 17.2 Text input and textarea · `<Field>`, `<Input>`, `<Textarea>`, `<CharCount>`
- 44 px, 16 px, 12 px corners, 1.5 px border. Label above; never a placeholder as the label; no stars.
- Help under the field (14 px muted, one sentence). The error replaces it: crit border, icon, and what to type. Shown on blur or Save, never while first typing.
- With 2 or more errors on Save, `<ErrorSummary>` sits at the top of the form and links to each field.
- Disabled: the disabled token pair and help that says why. Read-only facts are plain text.
- Counter only for an enforced limit; it appears at 80 % and turns crit past the limit. Typing is never blocked.
- `prefix` / `suffix` on a sunken segment ("+254", "KES", "kg", "%"); the user never types them.
- Textarea: 3 rows, grows to 8, then scrolls. Width follows content (`width="short"` ≈ 200 px for codes, weights, quantities).

### 17.3 Number and money · `<MoneyInput>`, `<QuantityInput>`
- Separators appear while typing, the caret stays put, and the value is a plain number. Pasting "Ksh 1,200.00" gives 1200.
- Fixed "KES" prefix. A currency choice only where the business really takes two (Imports).
- Whole shillings by default; `cents` allows two places, shown only when typed, never padded.
- **No negative typing.** Direction is a choice (Money in / Money out, Add / Remove stock) with Segmented. Tables show "−KES 2,000" with a true minus.
- Left-aligned in the input, right-aligned in tables, tabular figures. Phone keypad via `inputMode`.
- Limits are help text plus an error on blur ("M-Pesa takes up to KES 150,000 per payment. Split it, or record a bank transfer.").
- QuantityInput for whole counts 1–99.

### 17.4 Date and time · `<DatePicker>`, `<DateRangePicker>`, `timeSlots()`
- Values are local date-only strings ("2026-10-14"). The field shows "14 Oct 2026"; ranges "1 Oct – 10 Oct 2026" (`formatRange`). Weeks start Monday. Typed dates are read day first.
- Ranges: one field, one calendar; the days between take the selected tint. Today has a ring; chosen days are a Signal Blue fill.
- Presets only on report and filter ranges: Today, Yesterday, Last 7 days, This month, Last month. Never on bookings or due dates (`presets={false}`).
- `min` / `max`: outside days are struck through, the month arrow is disabled, and `limitNote` says why.
- Phone: sheet; **presets as a chip row that scrolls sideways** (fixes the cropped chips); one primary that states the result ("Show 1 Oct – 10 Oct").
- Time: its own field next to the date, `<Select options={timeSlots(15)} />`, 24-hour.

### 17.5 Checkbox, radio, switch · `<Checkbox>`, `<RadioGroup>`, `<Switch>`
- **Switch:** takes effect at once, no Save; a toast confirms. **Checkbox:** saved with a form, consent, or several picks.
- **Radio:** one of 2–5 options that need an explanation line. 2–3 short options: Segmented. 6+: Select.
- Checkbox and radio sit left of their label and the whole row is the target. Switch sits on the right of its row.
- Groups: a fieldset with a 16 px weight 800 legend, stacked, 44 px rows (52 px with help). On colour is Signal Blue. Labels state the "on" meaning.

### 17.6 Dialog · `<ConfirmDialog>`, `<FormDialog>`, `<TypeToConfirmDialog>`
- Sizes: `sm` 400 px (confirm), `md` 560 px (form of up to 4 fields). No large dialog.
- A dialog when the user must answer before going on and doesn't need the page. A side panel when they need context, the form has 5+ fields, or it is a record.
- Confirm copy: the title is the question with the object ("Delete quote Q-1042?"), the body is the consequence, the buttons repeat the verb ("Delete quote" / "Keep quote"). Never "Are you sure?" or OK / Cancel.
- Forms: footer fixed, primary right, Cancel as text, Enter submits, errors inline, never closes on an error. `dirty` makes Close ask "Discard your changes?" and stops the backdrop from closing it.
- No dialog on a dialog. Phone: bottom sheet, actions stacked full width.
- **Destructive ladder** (R5): reversible → do it and offer Undo in the toast; one record → `variant="destructive"` (red outline, fills Haki red on hover) + ConfirmDialog; many records, a branch or the account → TypeToConfirmDialog; frequent and trained (void a sale at the till) → `<HoldToConfirm>` (1.5 s).
- `<DangerZone>` at the bottom of settings and record pages: red outline by default; `tone="solid"` (full Haki red) only for closing the account. One per page, never above the fold.
- Haki red #D0181F is for destructive fills only; red text on light grounds is #a3141a; Dark lifts outlines and text to #f07f86.

### 17.7 Side panel · `<SlideOver>`, `<Activity>`, `<ContactActions>`
- Right side only. Width 480 default, 560 for full records with activity, 720 with line items or a table, 960 (activity in its own column, W1b) for records worked on all day, on screens 1440 px and wider. Below 1024 px it is full screen with a back arrow; browser back closes it.
- **Order:** record id and date → title → `facts` (StatusChip + up to 3 facts, the only place the status appears) → `quickActions` (WhatsApp, Call, print) → facts list → line items with a navy total → files → **Activity** → composer → footer.
- **Activity** has three kinds: **messages** (tinted bubble with the channel; theirs left, ours right), **notes** (sunken with an edge, "Note · staff only"), **changes** (one muted line with a dot). Newest at the bottom. Filter: All · Messages · Notes · Changes.
- **Composer** switches between "Message Jane" (sent on WhatsApp, shows the number) and "Internal note" (sunken field). Never one box that does both.
- Footer: the one next step for this record's stage ("Hand over and take payment"), Cancel as text, "Open full page" on the right. Secondary actions go in the header ⋯ `menu`, Delete last and red.
- One panel at a time. A related record replaces the content and shows a back arrow (`onBack`). The opening row keeps its selected tint. `dirty` guards closing.

### 17.8 Table · `<DataTable>` + `<TableFoot>`, `<BulkBar>`, `<SortHeader>`, `<SelectCell>`, `<ColumnFilter>`
- One density: 56 px rows, 16 px. A 44 px compact density only for data-entry grids, never mixed.
- Sortable headers are buttons; only the sorted column shows an arrow; every table states its default sort.
- Selection only when bulk actions exist. The header box selects the page and shows a dash when some are ticked.
- BulkBar replaces the header: "3 selected", up to 3 secondary actions, Clear, no primary. Destructive bulk goes through ConfirmDialog with the count.
- **Header and footer (R4):** sunken head and foot by default (R4a). **Money tables use the navy head and a navy totals footer (R4b):** `data-head="navy"` on the table, `data-navy` on the wrap, `<TableFoot tone="navy" sum="KES 41,450">`. Never on a navy band, and at most one navy table per view.
- **Column filters (W5):** wide tables only (stock, price lists, reports). A 36 px funnel in filterable headers: checkboxes with counts for status, bands plus min–max for numbers, the date range picker for dates. Active filters also show as chips above the table and share state with the FilterBar.
- Row actions: a 44 px ⋯ at the row end opens the same `<Menu>`; the row itself opens the panel.
- Phone: cards (name and money; id, date and chip). Sideways scroll only for reports with 5+ figure columns, first column pinned.

### 17.9 Search and filters · `<FilterBar>`, `<QuickViews>`, `<FilterChips>`
- Directly under PageTitle, above the table, the same width.
- **Quick views (W2):** the 3–5 slices people use (All, Open, Overdue, Ready for pickup, Not assigned) as chips with counts; one is always on. They replace a Status dropdown. They scroll sideways on phone, edge to edge, so the cut-off shows there is more.
- Search on the left, filling the row; the placeholder names what it matches ("Search plate, customer or WO number").
- Up to 3 more filters inline as buttons that state their value ("Technician: Peter"). 4+, and always on phone: one "Filters · n" button that opens a sheet whose primary states the result ("Show 7 work orders").
- Active filters as removable chips; "Clear all" from 2.
- The count lives in two places: the PageTitle sentence ("2 of Peter's open work orders") and the table footer. Filters persist in the URL.
- No results: `<EmptyState state="searching" size="row">` with Clear filters.
- Work-order rows carry what the front desk needs on a phone call: plate (as `<Plate>`), vehicle, job, customer, technician ("Not assigned" in warn), stage, promised time (crit and bold when late), amount.

## Tier 2 · data and feedback

### 17.10 Charts · `CHART_SERIES`, `<SplitBar>`
- Bars: compare up to 12 items or periods. Line: a trend over 8+ points. Donut: 2–5 parts of one total. SplitBar: a 2–3 part share in a tile. A table when exact figures matter. No pies, 3D, stacked areas or radar.
- Series: 1 Signal Blue, 2 teal #00A5B8 (Dark #2fc6d6), 3 grey. One highlighted series. Status colours only for status series. **Never orange** (it means "needs you").
- Three value ticks in fmtKM (13 px), a baseline, no gridlines, dates as "14 Sep". The title says what it shows, with the unit.
- Tooltip on hover (desktop) or tap (phone): label, then the full amount. One at a time.
- Loading: a grey skeleton of the chart shape. Empty: the frame, a baseline and one line. Every chart has an alt sentence that states the finding.

### 17.11 KPI tile · `<KpiStat>` + `<Comparison>`
- Arrows only next to comparison text. Arrow = direction; colour = good or bad from `goodWhen`.
- "+12% vs 1–10 Sep": the same period length and point. Under 1 %: "Same as last month", muted, no arrow. No history: "First month of data".
- fmtKM in tiles; the full amount on the detail page. Up to 4 tiles; 2 per row on phone; no icons.

### 17.12 Status chip · `<StatusChip>`, `STATUS_TONE_MAP`, `<CountBadge>`
- Five tones: **pos, warn, crit, info, draft**, each ink on its own tint, **with the dot** (kept from the code). Old names map automatically (success → pos, warning → warn, danger → crit, accent → info, neutral → draft).
- `live` (navy, pulsing dot) only for work happening now (a job in the bay). At most one kind per screen.
- The same word has the same tone in every vertical. A new state is a row in the map (check `local-status-map`).
- Counts never go on a status chip; `<CountBadge>` goes on filters, quick views, pill-nav and flyouts. Orange is never a status.

### 17.13 Toast · `useToast()`
- Bottom right (full width above the bottom bar on phone), one at a time, the navy capsule with a tone icon.
- **success** "Payment recorded" · **warning** done, but… ("Sale saved, receipt not sent") · **error** "Couldn't send the quote" + what to do · **info** something changed ("Peter moved WO-2291 to Ready").
- 5 s; 8 s with an action or an error; `supportEscalation` (real system failures only) stays until closed and adds "Message us on WhatsApp" and the `reference`.
- `progress` for long actions ("12 of 24 sent"), updated through the same `id`, ending in success.
- One action per toast. **Undo replaces a confirm** for reversible removals.
- A warning that needs a decision is a dialog, not a toast.

### 17.14 Banners, empty, loading and error states · `<Banner>`, `<EmptyState>`, `<ErrorState>`, `<InlineError>`, `<ErrorSummary>`
- **Where a message goes:** just happened → toast; still true → `<Banner>` at the top of the page or card (offline, failed sync, plan renews, storefront live); about one field or row → inline beside it. Never two for one event.
- Banner look: tinted with a solid tone icon (R3a). Success banners only for lasting results (a published storefront, a finished import).
- **Haki per situation (R2)** via `HAKI_STATE`, picked in the manifest, never per page:
  - first run: **empty** (tray), 120 px, with one primary and an import option where one exists;
  - no match: **searching**, 88 px or row 64 px, repeating the query, with Clear filters;
  - offline: **offline** (plug). Say work is saved only where the app really keeps it;
  - long job over 10 s: **waiting** (hourglass), with the count and "Run in background";
  - page not found: **thinking**, with one way home.
- **No Haki** on server errors or failed payments (`<ErrorState>`), and never on routine empties (one line), errors, or inside data cards. Never sad or celebrating here.
- Loading: skeletons in the content's shape after 300 ms; spinners only in buttons; at 10 s, "Still loading. This is taking longer than usual."
- Error wording: "We couldn't [verb] [object]" + what to do + reassurance when true. No codes up front (a `reference` line instead), no "Oops", no blame.
- Retry reruns only the failed request, in place. A failing card shows its own error; the rest of the page stays.

### 17.15 Progress and steps · `<Steps>`, `<ProgressBar>`
- Steps for 3–6 steps of one task. **At least 200 px per step**, label and sublabel centred under a 40 px circle; sublabels are 2–3 words that never wrap ("Done", "Skipped", "Now", "Next"). What was entered goes in a review card, not the stepper (R6a).
- States: done = blue fill with a check (can be reopened); current = blue ring with a halo and a bold label; skipped = a dash with "Skipped" (can be reopened); not yet = grey ring with its number.
- 5–6 step setups (onboarding): `orientation="vertical"` beside the form (R6b).
- Phone: "Step 3 of 4", segments, the step name as the page title, "All steps", and a 52 px Continue pinned (R6c).
- ProgressBar: "3 of 5" for countable things, a percentage for continuous work, never both. Signal Blue on sunken, 10 px; status tones only when the bar is a status (budget).

### 17.16 Help · visible help text, `<Tooltip>`, `<HakiTip>`
- **Terms get a visible help line** (14 px muted) under the label or figure. No "i" icons and no tooltips for definitions (R7a).
- `<Tooltip>` only names icon buttons: 2–3 words, desktop hover after 400 ms and focus, opening below and aligned inside its container. On phone the label shows under the icon instead (R7b).
- `<HakiTip>` teaches a feature, once per user, dismissed with "Got it", one per page:
  - `inline` (pointing, R7c), as in the code today;
  - `announce` (presenting, navy, "New · …", one white action, R7d);
  - `peek` (peeking-side, beside the field it explains, first time only, R7e).
- Retired HakiTip tones: advice, warning, alert. Warnings are banners.
- Never a tooltip on a disabled control; never hide required information in one.

## Tier 3 · specialist

### 17.17 Board · `<Board>`, `<MoveToSheet>`
- Built on the Car Parts workshop board: **every card has "Move to [next stage]"**; drag is optional on desktop. A card that can't move says why and offers the fix ("Can't start yet: assign a technician first").
- 3–6 columns, one per real stage; otherwise a table with quick views. The column is the status: no status chip on cards.
- Column head: a key square in the stage colour, name, count, and the money total where it matters.
- Card: plate or id, job, person (or "Not assigned" in warn), time in this stage (crit after a day), amount. The **live** stage (in the bay) has navy cards. The orange dot means needs you.
- Moves that need input (Quoted needs a price) open the side panel (`needsInput`). The last column is Ready; handed-over jobs leave the board.
- Lanes by technician (W3b) for the workshop manager. Phone: stage chips with counts and one column.

### 17.18 Calendar · `<ResourceDay>`, `<Agenda>`, `<MonthCell>`
- Colour jobs from Vivid Core: **live** navy (in the bay now), **booked** Signal Blue tint, **ready** pos, **pending** warn, **cancelled** draft and struck through, and the **orange dot** for needs you. Resources (bays, chairs, staff) are columns, never colours.
- Hour labels and blocks share one scale, so they always line up. Blocks under 40 px show the title only.
- Desktop opens on Day by resource for workshops, Week for salons and gyms. Phone always opens on today's agenda with a week strip. Month shows counts and the needs-you count, never blocks.
- An empty slot click opens the side panel with the time filled in. The "now" line is crit, 2 px, today only.
- Gantt (Mjengo, Imports, Events): weeks across, a row per task, bars in the same tones, a today line. Phone shows the task list.

### 17.19 Upload · `<FileUpload>`, `resizeImage()`
- Desktop: a dashed drop zone that is one big button, stating types, size and count limits up front.
- Each file is a row: thumbnail or type, name, size, progress, Remove (Cancel while uploading).
- A rejected file stays with a crit border and what to do; the others carry on.
- 10 MB by default; photos are resized on the device to 2000 px on the long side, so a phone photo always fits.
- Phone: "Take photo" (rear camera) as the main button, "Choose from gallery" as text; document fields say "Scan document".

### 17.20 Avatar · `<Avatar>`, `<AvatarGroup>`, `<PersonRow>`, `<Plate>`
- A photo when uploaded, else initials (first and last; businesses use the first two words). Never a silhouette.
- Six fixed pairs from the brand tints, chosen by a hash of the id, so the colour never changes and never means anything.
- Sizes 24 (tables, chips), 32 (cards, groups), 40 (rows, AppTop), 64 (profile).
- PersonRow 64 px: avatar, name 16/800, role or phone, one text action. Groups: 3 faces then "+n" with a total line.
- Number plates use `<Plate>` (sun tint, capitals kept).

### 17.21 Segmented · `<Segmented>` (replaces `ViewToggle`)
- Switches the view of the same data (Cards / Table, Day / Week / Month) or a short choice (Add / Remove). 2–4 segments.
- A sunken track; the chosen segment is a raised surface with a border and weight 800. **No Signal Blue fill** (that is the pill-nav).
- Labels always; icons only when every segment has one, dropped first on phone. A radio group for keyboard and screen readers.
- Never navigation, never filters, never 5+ options.

### 17.22 Signature · `<SignaturePad>`
- The signer sees what they sign: a navy summary (record, subject, total) and 2–4 confirmations above the pad, with their name in the prompt.
- Pad: 220 px (200 px phone), white in every theme, navy ink, an × at the line start, the date on the pad. Undo removes the last stroke; Clear removes all; "Type instead" stores the typed name and the method.
- The confirm button does the real step ("Confirm and hand over") and is disabled until there is ink.
- Signed: a receipt with the signature, a pos "Signed" chip, name, time, method and device, and "Copy sent on WhatsApp" only when it was. "Sign again" replaces only after the new one is confirmed.
- Phone: a "Hand the phone to Jane" screen with the total comes before the pad. Stored with signer, time, record id and method; printed on the job card next to "Released by".

### 17.23 Actions menu · `<Menu>`
- A secondary button with a chevron ("Actions") or a 44 px ⋯. Verbs grouped (make · export · danger); destructive is always the last group, in red.
- A Select picks a value and shows it. A Menu does things. Never mix them, and never a "Choose action…" dropdown.
- Phone: the menu opens as a sheet.

# Hakiqa Gym: build guide (locked)

**Status:** LOCKED 10 Oct 2026 by Marvin's go-ahead on the Gym renders. Changes need a new dated decision in this file, not a code comment.
**Applies to:** hakiqa-connect `src/pages/gym/*` (staff), `src/portal/*` (member app), and the badge render worker.
**Builds on:** `HAKIQA_APP_STANDARDS.md` (Vivid Core, §1–§16) and `HAKIQA_COMPONENTS.md` (§17). Where this file is stricter, this file wins for Gym.
**Reference renders:** `Hakiqa Gym Staff.dc.html`, `Hakiqa Gym Member App.dc.html`, `Hakiqa Gym Member App v2.dc.html`.
**Checks:** `scripts/check-brand-rules.mjs` rules `gym-*`; `src/portal/training/gymGuide.test.ts`.

---

## G1 · What Gym never shows
- No HRV, sleep, recovery, readiness, or activity rings. The gym has no wearable data, so those figures are invented (`gym-invented-health`).
- No emoji medals or trophies (`gym-emoji-badge`). Medals are the rendered art only.
- No figures that are not in the gym's records. Sample data says "Sample data" in a chip.
- No "Sept" anywhere, including the engraved backs (`gym-sept`).

## G2 · Staff member profile (`GymMemberProfile.tsx`)
- **One hero:** a navy identity card on the left holds the name, plan, status chip (a live dot while she is inside), QR code, and three figures (plan left, day streak, this month). White text at 14–15 px; no `opacity-70`, no 10–11 px caps.
- **One primary:** Check in / Check out (orange) under the card. Sell another plan is secondary, Print statement is tertiary. WhatsApp and the Actions menu sit next to the page title.
- **Renewal:** a warn `<Banner>` only within 7 days of the plan end, with the real last amount and method, and a Renew plan button. Never a second card.
- **Attendance:** `<AttendanceGrid>`, 4 weeks × Mon–Sun, today ringed, future days outlined. The pattern line ("Usually Mon, Wed, Fri, around 06:30") shows only with 8+ visits.
- **Badges:** the real medals. Earned ones flip; "being engraved" uses the shimmer plate and its own line; locked ones show a bar and "30 of 90 days". Staff can send an earned medal on WhatsApp.
- **Payments:** a navy money table (R4b) with paid and owed totals in the footer.
- **Trainer view:** the same member, switched with a `<Segmented>` in AppTop (Profile / Training), not a new rail item. Trainers land on Training.
  - The programme card is the hero: block and week, the next session in one sentence, and the progression rule that will fire.
  - Two charts only: sessions per week (bars) and one lift's top set (line).
  - A next-session table with target, last time and rule. Warm-ups and supersets are tagged in grey.
  - Coach notes are internal notes (Activity, §17.7), staff only.

## G3 · Workout logger (`Workout.tsx`)
- **One exercise open** at a time, outlined in Signal Blue. Done exercises collapse to one line.
- **Header (`<ExerciseHeader>`):** name (18/900), one ghost line, How to, remove.
  - The ghost line comes from `ghostLine()` and reads as a sentence per mode: "Last time 50 kg × 5", "8 reps, +5 kg", "2 km in 9:12", "1:15 hold". Distance is never joined to time with × (`gym-ghost-times`).
  - The line never wraps; it ends with "…".
  - No mode chip: the column heads already say what to type.
- **Columns** come from `columnsFor()` (mode decides): weighted kg · reps; bodyweight reps · + kg; assisted reps · assist kg; timed hold; cardio km · time.
- **Ghost** setting: Off · Last time · Best. Before a tick, the target sits under each field in small type. After a tick, it becomes the difference from `fieldDelta()`: pos when better, muted when the same or worse. Lower is better for cardio time and assistance.
- **Rows:** 52 px rows, 44 px fields, a 48 px tick. A hint above the first set reads "Tap a number to change it · tick when the set is done".
- **Sets:** "+ Add set" copies the last set; "Remove last" or a swipe removes one. Removing an exercise offers Undo in the toast; there is no confirm dialog.
- **Tick** starts the rest timer (`restSec`). The bar turns navy, with +30 s and Skip, and vibrates at zero when `prefs.vibrate` is on.
- **Finish** is secondary while sets remain and becomes the orange primary once every set is ticked. A new best shows a pos "New best" chip on its row.
- **Plates:** one line from `describePlates()` under barbell exercises.

## G4 · Editing a set (`<SetEditor>`)
- Tapping **any number** in a set opens the editor under that row; tapping it again closes it. One editor open at a time.
- Each column gets − and + (52 px) and a typed field. Steps:
  - reps 1;
  - load = the smallest plate pair the member owns (2.5 kg by default, 5 lb);
  - time 5 s, typed as `9:05` or seconds;
  - distance 0.1 km.
- The hint line under each field states the step, or "Leave at 0 for bodyweight".
- **Same for later sets** copies this set into every later set that is not done (`copyForward`).
- **Done set** ticks the set (starting the rest timer) and closes the editor. The row tick also closes it.
- Values never go below 0. Loads are stored in kg (`fromDisplay`); typing in lb is converted.

## G5 · How to (every exercise)
- **Every exercise in a workout, the Library and the trainer's plan has a How to.** `formGuideFor()` already guarantees a guide for any exercise, including custom ones; `gymGuide.test.ts` fails if a catalog entry returns a short or empty part.
- In the logger: the **How to** button in the header (soft blue fill, info icon, 44 px) opens `<HowToSheet>`, a bottom sheet capped at 560 px wide on tablets. The inline `HowToToggle` is retired (`gym-howto-toggle`).
- **Sheet order:**
  1. optional media (`GUIDE_MEDIA`: 16:9 muted loop under 1.5 MB, or a photo);
  2. "Think about" plus the key cue, on navy;
  3. Set up, Position, Range of motion and What you should feel, numbered;
  4. Avoid, with the common mistakes;
  5. the safety line "Stop if something hurts, and ask a trainer to check your form."
- **Hand-written guides** go in `OVERRIDES` (by catalog id) for lifts where the generic text misses the point. Added now: `rowing-machine` (stroke order, damper 3–5). Next: back squat variants, Romanian deadlift, kettlebell swing, overhead press, hip thrust, lat pulldown.
- The trainer's `coachNote` shows above the guide in the sheet when present ("From Coach Rita: …").
- Copy style: second person, plain verbs, one idea per sentence, no anatomy jargon without a plain word next to it.

## G6 · Member Home (`portal/screens/Home.tsx`)
- **Order:** check-in state and streak (one navy card), today's workout with one orange Start, next booking. Nothing else above the fold.
- **The streak** shows `<StreakProgress variant="segments">` around the next medal (grey until earned).
- "Close to the next" (G8) replaces the streak line only in the last 10 % of the way (or the last 3 days, whichever is fewer), right after a check-in.

## G7 · Medals (`BadgeMedal3D`)
- **The medal page and the "ready" moment** use `<BadgeMedal3D>`:
  - drag spins it (1° per px) and tilts it up to 18°;
  - on release it settles on the nearest face in 500 ms, with a little momentum;
  - a tap flips it; arrows or Enter turn it 180°;
  - with reduced motion it snaps.
- **Grids** use flat thumbnails; tapping one opens the medal page.
- **Never put a `filter` or a shadow on the rotating element** (`gym-medal-filter`). It flattens 3D and the back never shows. The floor shadow is a sibling.
- **Captions match the art.** Until the render worker has drawn this member's medal, the caption says "Sample art" or the medal shows "being engraved". A caption never shows another member's name, date or serial.

## G8 · Badge moments
- **Earning** (`<EarnMoment>`): earned → engraving → ready.
  - It shows once, over the check-in confirmation, the first time the app opens after the award.
  - Haki celebrating is allowed here and nowhere else in Gym.
  - The generic plate pops in, then swaps to the engraved medal when it is ready.
- **Being engraved** is honest: the grey generic plate with a shimmer, and "Engraving your name now".
- **The case** groups by ladder: earned first, then the rung in progress with its bar, then locked in grey. Counts say "2 of 3 streak medals" and never include proposed ladders.
- **Share card:** WhatsApp Status 1080 × 1920, made on the phone from the engraved front. The gym's name leads, with no Hakiqa branding, and the bottom 25 % is kept clear. It is drafted for the member to send, never auto-posted.
- **Streak progress shapes** (`<StreakProgress>`):
  - `segments` on Home;
  - `track` in the case;
  - `chain` for the nudge after a check-in ("Come in Mon, Tue and Wed. Rest days don't break it.").
- **Nudges** are never push notifications.

## G9 · Badge ladders
- **Live:** day streak 7 / 30 / 90 (`GYM_STREAK_LADDER`, counted in the gym's time zone).
- **Proposed, not live until Marvin approves** (each needs a plate spec in `badge-system/specs/<id>.json` before it can award):
  - streak 180 / 365;
  - total check-ins 25 / 100 / 250 / 500 / 1,000;
  - months as a member 3 / 6 / 12 / 24 / 36;
  - classes attended 10 / 25 / 50 / 100;
  - early starts (before 07:00) 10 / 50 / 100.
- **Workout ladders** (records, sessions logged) wait until training is stored on the gym server, not only on the phone.
- **Render worker:** dates on backs are "23 SEP 2026" (three-letter month). The serial is zero-padded to 6 digits.

## G10 · Member profile (`portal/screens/profile/ProfileHome.tsx`)
- The plan card comes first, with the end date as a warn chip inside 7 days and Renew with M-Pesa (secondary).
- List rows have plain 20 px icons; no coloured icon tiles.
- Appearance offers Light, Warm and Dark. Log out is plain text, not red (it is not destructive).

---

### Decision log
- 10 Oct 2026: locked G1–G10 after the Gym Staff, Member App and Member App v2 renders.

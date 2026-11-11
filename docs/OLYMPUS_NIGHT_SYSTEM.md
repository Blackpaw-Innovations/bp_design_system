# Olympus night system: tokens, sky and motion

Status: Wave 0a + 0c of the Olympus build · 12 Nov 2026 · values copied from the approved renders (`olympus-kit.reference.css`)

The night system is the look of Olympus, the team app. Every Blackpaw app may use it. The files are `src/tokens/olympus.css` (colours, sky, rail) and `src/tokens/motion.css` (motion). Both come with `@import '@blackpaw/ui/tokens'`.

## How to use it

- Light mode is the default. Put the class `dk` on the screen root for dark mode.
- Use the tokens as `var(--ol-ink)`, or in Tailwind as `text-ol-ink`, `bg-ol-card`, `shadow-ol-card`, `duration-ol-quick`, `ease-ol-enter`.
- These are full colour values, not HSL triplets. Don't wrap them in `hsl()`, and Tailwind's `/50` opacity modifier doesn't work on them.
- The names start with `--ol-` because `--bp-ink`, `--bp-surface` and similar names already exist with other values that other apps use.

## Colour tokens

Each token has a light value and a dark (`.dk`) value.

| Token | Light | Dark | What it's for |
|---|---|---|---|
| `--ol-ink` | `#0E0C24` | `#F1F0FB` | Headings and main text |
| `--ol-field` | `#F7F6FB` | `#0E0C24` | Page background |
| `--ol-surface` | `#FFFFFF` | `rgba(255,255,255,.08)` | Inputs, pills, quiet fills |
| `--ol-body` | `#3F3D58` | `#C9C6E4` | Running text |
| `--ol-subtle` | `#6B6985` | `#B4B0D6` | Secondary text |
| `--ol-label` | `#57546F` | `#9A97C0` | Mono labels, kickers |
| `--ol-line` | `rgba(14,12,36,.07)` | `rgba(241,240,251,.1)` | Hairline |
| `--ol-line-strong` | `rgba(14,12,36,.15)` | `rgba(241,240,251,.22)` | Stronger hairline, also the hover hairline |
| `--ol-lilac` | `#ECEBF2` | `rgba(255,255,255,.12)` | Neutral tint fill |
| `--ol-bone` | `#EFEDE8` | `rgba(255,255,255,.05)` | Quiet card variant |
| `--ol-card` | `#FFFFFF` | `#17143A` | Card (always solid) |
| `--ol-card-line` | `rgba(14,12,36,.06)` | `rgba(241,240,251,.08)` | Card hairline |
| `--ol-shadow-card` / `--ol-shadow-card-hover` | | | Card shadow, and the deeper hover shadow |

These tokens have the same value in both modes:

- **Action:** `--ol-accent` `#3228CF` (cobalt, the only action colour: buttons, links, progress and focus) and `--ol-on-accent`.
- **Selected:** `--ol-selected` `#451D6A` (the selected tab, filter pill and light-rail item) and `--ol-on-selected`.
- **Signals:** `--ol-success` `#1F8A5B`, `--ol-danger` `#D64545`, `--ol-warning` `#F5A524` and `--ol-coral` `#FE635F`.
- **Night:** `--ol-night` `#0E0C24`, `--ol-night-raised` `#17143A`, `--ol-on-night` `#F1F0FB`, `--ol-on-night-2` `#C9C6E4`, `--ol-label-night` `#9A97C0`, `--ol-hair-night` and `--ol-on-night-muted`.
- **LED ring:** `--ol-led-1/2/3` (coral, purple and cobalt). Purple appears only as light.

## Sky

| Token | What it is |
|---|---|
| `--ol-sky-night` | `#0E0C24` with a purple glow at the top right and a cobalt corner at the bottom left |
| `--ol-sky-day` | Light mode on pages without a photo: cream `#F7F2E8` to lilac `#F1ECF6`, with a warm glow |
| `--ol-sky-day-line` | Hairline under the day sky |
| `--ol-scrim` | Dark filter over an app photo, in both modes (page header) |
| `--ol-scrim-band` | The same filter for the taller phone band, with a top shade added |
| `--ol-sky-fade` | Dark mode only: the band melts into the page |
| `--ol-shadow-craft` / `--ol-shadow-craft-night` | Drop shadow under the craft object on the day or night sky |

The sky uses these classes. The page decides the band's position and height.

```html
<div class="ol-sky">…stars…<img class="ol-craft" src="…" alt=""></div>            <!-- night -->
<div class="ol-sky ol-sky-day">…stars (day)…</div>                                  <!-- day -->
<div class="ol-sky ol-sky-photo"><img src="…" alt=""><span class="ol-scrim"></span></div> <!-- app photo -->
```

**Stars:** `stars(seed, width, height, { day?, constellations? = 2, filterId? = 'g' })`, exported from `@blackpaw/ui`, returns an SVG string. For the same seed and size, it draws exactly the same stars and two constellations as `night.py` drew for the renders. `npm run check:stars` proves this; it needs Node 22.18 or later. Use the section name as the seed (for example `'Tasks'`). Give each sky on a page its own `filterId`.

## Rail

The rail floats. It is `--ol-rail-width` 68 px wide, sits `--ol-rail-inset` 14 px in, and has a `--ol-rail-radius` of 24 px.

| Token | Light | Dark |
|---|---|---|
| `--ol-rail-bg` | cream `#FBF7EF` | night `#17143A` |
| `--ol-rail-line` | `rgba(14,12,36,.08)` | `rgba(241,240,251,.12)` |
| `--ol-rail-shadow` | soft ink shadow | none |
| `--ol-rail-icon` | ink `#57546F` | `rgba(241,240,251,.6)` |
| `--ol-rail-active-bg` | `#451D6A` | `rgba(255,255,255,.12)` |
| `--ol-rail-active-ink` | `#FFFFFF` | `#FFFFFF` |
| `--ol-rail-me-bg` / `-me-ink` | `#0E0C24` / white | `#F1F0FB` / `#0E0C24` |
| `--ol-rail-mark-ring` | hairline ring around the mark | none |

## Motion

Motion is calm and quick:

- Nothing slides sideways.
- Cards never appear one by one.
- Hover never washes a colour over anything.
- There is no confetti and no rolling counter.
- Nothing moves while someone is typing.

| Token | Time | Phone (0.8×) | Used for |
|---|---|---|---|
| `--ol-dur-press` | 120 ms | 96 ms | Press |
| `--ol-dur-quick` | 180 ms | 144 ms | Hover lift, closing, tab content, tick |
| `--ol-dur-standard` | 260 ms | 208 ms | Select, tab glide, sheets, fold, drag |
| `--ol-dur-show` | 600 ms | 480 ms | A figure or chart arriving |
| `--ol-dur-stage` | 800 ms | 640 ms | The sky fading in when a page opens |
| `--ol-dur-ambient` | 50 s | 40 s | Stars drifting |
| `--ol-dur-glow` | 5 s | 4 s | One turn of the needs-you ring |

The phone values apply at 639 px wide or less, the same breakpoint as `useIsPhone`.

There are three easing curves:

- `--ol-ease-enter` `cubic-bezier(.2,.8,.2,1)` for things arriving;
- `--ol-ease-exit` `cubic-bezier(.4,0,1,1)` for things leaving;
- `--ol-ease-standard` `cubic-bezier(.4,0,.2,1)` for things changing in place.

| Class | What it does |
|---|---|
| `ol-lift` | On hover, rises 2 px with a deeper shadow and a darker hairline. Mouse only. |
| `ol-press` | Shrinks to 98% while pressed |
| `ol-select` | Background, text, border and shadow cross-fade (selecting or locking a card) |
| `ol-glide` | Moves the selected tab pill with transform or width |
| `ol-crossfade` | Quick fade in. Use it for tab content and changing numbers; re-key the element to replay it. |
| `ol-sheet-rise` / `ol-sheet-leave` | A sheet or Hermes rises 12 px as it fades in, and closes faster |
| `ol-toast-rise` | A toast rises 8 px |
| `ol-fold` | Folds its one child away when `data-folded` is set |
| `ol-glow` | The needs-you LED ring, turning every 5 s. Use it only on things waiting for this person. |
| `stage-fade` / `stage-drift` / `bp-spin` | Names kept from the projects app: the sky fades in, the art drifts, the ring turns |

**Reduced motion** (`prefers-reduced-motion: reduce`):

- All movement switches off: lift, press, glide, rise, fold and drift.
- Fades stay, and every duration drops to 120 ms or less.
- The glow becomes a still ring.

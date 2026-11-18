# Report kit (v1.37.0)

Approved by Marvin in the 17 Nov 2026 Hakiqa premium audit (rows 04, 05, 15). Components: `src/components/ReportKit.tsx`; styles: `src/tokens/report-kit.css` (imported by `tokens/index.css`). Colours are existing tokens only. The ghost and heat shades are mixes of navy.

## ReportRangePicker

`<ReportRangePicker value onChange presets? allFrom? compare? max? min?>`. It replaces every report period dropdown and segmented switch.

- **Trigger:** a navy calendar square, the preset name in bold, and the real dates under it ("Last 30 days / 19 Oct – 17 Nov 2026").
- **Compare chip:** sits beside the trigger as "vs 19 Sep – 18 Oct" with an ×. With no comparison it shows a quiet "+ Compare".
- **Popover:**
  - Presets on the left, each with its hint (17 Nov, 7 d, 30 d, Nov, Oct).
  - Typed From and To fields, with a day count.
  - Two months showing the range as one band. Today is underlined in orange, future days are greyed, and comparison days get a grey underline.
  - Three compare cards (previous period, same days last month, same days last year), each showing its dates.
  - Cancel, and Apply in orange.
- **Phone:** a bottom sheet with preset chips, one month and the same compare cards.
- **Value:** `ReportRange = { preset, from, to, compare }`.
  - `reportRange('last30')` gives a starting value.
  - `comparisonOf(r)` gives the comparison days.
  - `compareWords(r)` gives "the 30 days before".
  - `rangeFromSearch` / `rangeToSearch` keep it in the URL. A preset stores only its name, so it rolls forward with the date.
- **Compare rules:**
  - Previous means the same number of days just before.
  - Last month and last year move each end back by a month or a year, clamped to the month's length.
  - All time has no comparison.
- **Options:** `compare={false}` turns comparison off for reports that can't compare. `allFrom` (the first day with data) adds "All time".

## Charts and blocks

| Component | Use |
|---|---|
| `GhostColumns` | Daily count or money columns. `was` is the comparison day's real figure, drawn as a grey ghost column behind. Hover or focus shows both. `legend` names both periods with their totals. |
| `ShareBars` | Share bars. `was` draws a thin grey marker and "was X". |
| `HeatGrid` | `grid[weekday][hour]`, Monday = 0. Darker = busier, with a key from Quiet to Busy. Shows 5am to 10pm, wider when there is data outside those hours. |
| `ReportKpis` / `ReportKpi` | Four tiles: label, figure (`unit` small), comparison (`tone` up shows ▲ in green; down is plain ink, never red), and a `Sparkline`. `value={null}` shows "—" on a sunken tile (the honest empty state). |
| `HakiBrief` | A title and up to three lines, each built from a real record. With no lines, no card is drawn. |
| `FlowBars` | Stage columns (quoted → ordered → invoiced → paid), navy to signal. |
| `RankBars` | Top N, with bars scaled to the leader. |
| `ReportCard` | A card with a title, one light line, then the picture. |

Every chart draws a dashed empty line instead of zeros. Never pass invented figures. The page header is `CountHero` with `headline` (the one answering sentence), `tick={false}`, and `craft` / `action` (v1.33.0 craft card).

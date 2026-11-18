import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Sheet, useIsPhone, useOutside, usePopover } from './Overlay'
import { Button } from './Guarded'
import { fromISO, parseTypedDate, toISO, type ISODate } from './DatePicker'

/**
 * Report kit (17 Nov 2026 premium audit, rows 04 / 05 / 15). Styles: tokens/report-kit.css. Spec: docs/REPORT_KIT.md.
 *
 *   ReportRangePicker  one header trigger (preset name + real dates) and a removable compare chip; the popover has
 *                      presets with their dates, a two-month band, typed From / To and compare options with dates.
 *                      Replaces every report period dropdown or segmented switch.
 *   GhostColumns       daily columns, the comparison period as grey ghost columns behind them.
 *   ShareBars          share bars with a "was" marker for the comparison period.
 *   HeatGrid           day x hour grid, darker = busier ("When members come in").
 *   ReportKpis/Kpi     four numbers, each with its comparison and a sparkline.
 *   HakiBrief          three lines built from real facts only.
 *   FlowBars           stage columns (quote to cash).
 *   RankBars           top-N bars scaled to the leader.
 *
 * Numbers are never invented here: every chart takes the caller's real figures and draws an honest empty line when
 * there is nothing to show.
 */

// ---------------------------------------------------------------- dates

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const day0 = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
/** Same day n months away, clamped to the month's last day (31 Oct - 1 month = 30 Sep). */
const addMonths = (d: Date, n: number) => { const last = new Date(d.getFullYear(), d.getMonth() + n + 1, 0).getDate(); return new Date(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), last)) }
const DAY_MS = 86_400_000

/** Inclusive number of days in a range. */
export function rangeDays(from: ISODate, to: ISODate) { return Math.round((fromISO(to).getTime() - fromISO(from).getTime()) / DAY_MS) + 1 }

/** "19 Oct – 17 Nov 2026"; "19 Oct 2025 – 17 Nov 2026" across years; one day reads "17 Nov 2026". `year: false` drops the year. */
export function rangeText(from: ISODate, to: ISODate, { year = true }: { year?: boolean } = {}) {
  const a = fromISO(from), b = fromISO(to)
  const same = a.getFullYear() === b.getFullYear()
  const right = `${b.getDate()} ${MONTHS[b.getMonth()]}${year ? ' ' + b.getFullYear() : ''}`
  if (from === to) return right
  return `${a.getDate()} ${MONTHS[a.getMonth()]}${same ? '' : ' ' + a.getFullYear()} – ${right}`
}

export type ReportPreset = 'today' | 'last7' | 'last30' | 'last90' | 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'ytd' | 'last12m' | 'all' | 'custom'
export type CompareMode = 'previous' | 'lastMonth' | 'lastYear'
/** What a report shows: the days, and which days it is measured against (null = no comparison). */
export interface ReportRange { preset: ReportPreset; from: ISODate; to: ISODate; compare: CompareMode | null }

export const REPORT_PRESET_LABEL: Record<ReportPreset, string> = {
  today: 'Today', last7: 'Last 7 days', last30: 'Last 30 days', last90: 'Last 90 days', thisMonth: 'This month', lastMonth: 'Last month',
  thisQuarter: 'This quarter', ytd: 'Year to date', last12m: 'Last 12 months', all: 'All time', custom: 'Custom range',
}
export const COMPARE_LABEL: Record<CompareMode, string> = { previous: 'Previous period', lastMonth: 'Same days last month', lastYear: 'Same days last year' }

/** The days a preset covers, ending today. `all` needs the first day there is data (`allFrom`). */
export function reportPresetDates(p: Exclude<ReportPreset, 'custom'>, now = new Date(), allFrom?: ISODate): [ISODate, ISODate] {
  const d = day0(now), t = toISO(d)
  switch (p) {
    case 'today': return [t, t]
    case 'last7': return [toISO(addDays(d, -6)), t]
    case 'last30': return [toISO(addDays(d, -29)), t]
    case 'last90': return [toISO(addDays(d, -89)), t]
    case 'thisMonth': return [toISO(new Date(d.getFullYear(), d.getMonth(), 1)), t]
    case 'lastMonth': return [toISO(new Date(d.getFullYear(), d.getMonth() - 1, 1)), toISO(new Date(d.getFullYear(), d.getMonth(), 0))]
    case 'thisQuarter': return [toISO(new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1)), t]
    case 'ytd': return [toISO(new Date(d.getFullYear(), 0, 1)), t]
    case 'last12m': return [toISO(addDays(addMonths(d, -12), 1)), t]
    case 'all': return [allFrom && allFrom <= t ? allFrom : toISO(new Date(d.getFullYear(), 0, 1)), t]
  }
}

/**
 * The comparison days for a range.
 *   previous   the same number of days straight before (19 Oct – 17 Nov → 19 Sep – 18 Oct).
 *   lastMonth  each end one month back (19 Oct – 17 Nov → 19 Sep – 17 Oct).
 *   lastYear   each end one year back.
 */
export function compareDates(from: ISODate, to: ISODate, mode: CompareMode): [ISODate, ISODate] {
  const a = fromISO(from), b = fromISO(to)
  if (mode === 'previous') { const n = rangeDays(from, to); return [toISO(addDays(a, -n)), toISO(addDays(a, -1))] }
  const m = mode === 'lastMonth' ? -1 : -12
  return [toISO(addMonths(a, m)), toISO(addMonths(b, m))]
}

/** A report's starting value: a preset (default last 30 days) compared with the previous period. */
export function reportRange(preset: Exclude<ReportPreset, 'custom'> = 'last30', compare: CompareMode | null = 'previous', now = new Date(), allFrom?: ISODate): ReportRange {
  const [from, to] = reportPresetDates(preset, now, allFrom)
  return { preset, from, to, compare: preset === 'all' ? null : compare }
}

/** The comparison days of a ReportRange, or null when it has none. */
export function comparisonOf(r: ReportRange): [ISODate, ISODate] | null { return r.compare ? compareDates(r.from, r.to, r.compare) : null }

/** "the 30 days before", "the same days last month", "the same days last year": the words after "vs" in a sentence. */
export function compareWords(r: ReportRange) {
  if (!r.compare) return ''
  if (r.compare === 'previous') { const n = rangeDays(r.from, r.to); return n === 1 ? 'the day before' : `the ${n} days before` }
  return r.compare === 'lastMonth' ? 'the same days last month' : 'the same days last year'
}

/** Percent change, rounded; null when there is nothing to compare with (never "+∞%"). */
export function percentChange(now: number, was: number | null | undefined) {
  if (was == null || was === 0) return null
  return Math.round(((now - was) / Math.abs(was)) * 100)
}

/** Every day of a range as ISO dates, for lining a series up with its comparison. */
export function daysOf(from: ISODate, to: ISODate): ISODate[] {
  const out: ISODate[] = []
  for (let d = fromISO(from), end = fromISO(to); d <= end; d = addDays(d, 1)) out.push(toISO(d))
  return out
}

const DEFAULT_PRESETS: ReportPreset[][] = [['today', 'last7', 'last30', 'thisMonth', 'lastMonth'], ['last90', 'thisQuarter', 'ytd', 'last12m'], ['all']]

function presetHint(p: ReportPreset, now: Date) {
  const d = day0(now)
  if (p === 'today') return `${d.getDate()} ${MONTHS[d.getMonth()]}`
  if (p === 'last7') return '7 d'
  if (p === 'last30') return '30 d'
  if (p === 'last90') return '90 d'
  if (p === 'thisMonth') return MONTHS[d.getMonth()]
  if (p === 'lastMonth') return MONTHS[(d.getMonth() + 11) % 12]
  if (p === 'thisQuarter') return `Q${Math.floor(d.getMonth() / 3) + 1}`
  if (p === 'ytd') return String(d.getFullYear())
  return ''
}

// ---------------------------------------------------------------- range picker

interface MonthGridProps { month: Date; from: ISODate | null; to: ISODate | null; cmp: [ISODate, ISODate] | null; max: ISODate; min?: ISODate; onPick: (s: ISODate) => void }

function MonthGrid({ month, from, to, cmp, max, min, onPick }: MonthGridProps) {
  const today = toISO(new Date())
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const lead = (first.getDay() + 6) % 7
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells: (ISODate | null)[] = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => toISO(new Date(month.getFullYear(), month.getMonth(), i + 1)))]
  const end = to ?? from
  return (
    <div className="bp-rk-month" role="grid" aria-label={`${MONTHS_LONG[month.getMonth()]} ${month.getFullYear()}`}>
      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i} role="columnheader" className="bp-rk-dow">{d}</span>)}
      {cells.map((s, i) => {
        if (!s) return <span key={`b${i}`} />
        const off = s > max || (min != null && s < min)
        const isEdge = s === from || s === end
        const band = !!from && !!end && s >= from && s <= end
        const inCmp = !!cmp && s >= cmp[0] && s <= cmp[1]
        const col = (lead + Number(s.slice(8)) - 1) % 7
        return (
          <span key={s} className="bp-rk-cell" data-band={band || undefined} data-start={s === from || col === 0 || undefined} data-end={s === end || col === 6 || undefined} data-cmp={inCmp || undefined}>
            <button type="button" role="gridcell" aria-selected={band} aria-current={s === today ? 'date' : undefined} disabled={off} data-edge={isEdge || undefined}
              aria-label={`${Number(s.slice(8))} ${MONTHS_LONG[month.getMonth()]}${inCmp ? ', comparison day' : ''}`} onClick={() => onPick(s)}>
              {Number(s.slice(8))}
            </button>
          </span>
        )
      })}
    </div>
  )
}

function TypedDate({ label, value, active, onFocus, onCommit }: { label: string; value: ISODate | null; active: boolean; onFocus: () => void; onCommit: (s: ISODate) => void }) {
  const [text, setText] = useState<string | null>(null)
  const shown = value ? (() => { const d = fromISO(value); return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` })() : ''
  const commit = () => { if (text != null) { const s = parseTypedDate(text); if (s) onCommit(s) } setText(null) }
  return (
    <label className="bp-rk-field" data-on={active || undefined}>
      <small>{label}</small>
      <input value={text ?? shown} placeholder="e.g. 19 Oct" onFocus={onFocus} onChange={(e) => setText(e.target.value)} onBlur={commit} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commit() } }} />
    </label>
  )
}

export interface ReportRangePickerProps {
  value: ReportRange
  onChange: (v: ReportRange) => void
  /** Preset groups, divided by a rule. `all` shows only with `allFrom` (the first day with data). */
  presets?: ReportPreset[][]
  allFrom?: ISODate
  /** false hides every compare control (a report that cannot compare). */
  compare?: boolean
  /** Last day you can pick; defaults to today (reports stop at today). */
  max?: ISODate
  min?: ISODate
  label?: string
  className?: string
}

/**
 * The report range trigger, compare chip and popover (src3 04). Desktop: a popover anchored on the trigger;
 * phone: a bottom sheet with preset chips, one month and the same compare cards.
 */
export function ReportRangePicker({ value, onChange, presets = DEFAULT_PRESETS, allFrom, compare: canCompare = true, max: maxProp, min, label = 'Report dates', className }: ReportRangePickerProps) {
  const now = new Date()
  const max = maxProp ?? toISO(now)
  const groups = useMemo(() => presets.map((g) => g.filter((p) => p !== 'custom' && (p !== 'all' || !!allFrom))).filter((g) => g.length), [presets, allFrom])
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<{ preset: ReportPreset; from: ISODate | null; to: ISODate | null; compare: CompareMode | null }>(value)
  const [editing, setEditing] = useState<'from' | 'to'>('from')
  const [month, setMonth] = useState(() => { const t = fromISO(value.to); return new Date(t.getFullYear(), t.getMonth() - 1, 1) })
  const anchor = useRef<HTMLDivElement>(null)
  const pop = useRef<HTMLDivElement>(null)
  const phone = useIsPhone()
  const style = usePopover(anchor, open && !phone, { width: 860, maxHeight: 640 })
  const close = useCallback(() => setOpen(false), [])
  useOutside([anchor, pop], open && !phone, close)
  useEffect(() => { if (!open) return; const k = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }; document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k) }, [open, close])

  const openWith = (focus: 'range' | 'compare' = 'range') => {
    setDraft({ ...value, compare: focus === 'compare' && !value.compare ? 'previous' : value.compare })
    const t = fromISO(value.to); setMonth(new Date(t.getFullYear(), t.getMonth() - (phone ? 0 : 1), 1)); setEditing('from'); setOpen(true)
  }
  const usePreset = (p: Exclude<ReportPreset, 'custom'>) => {
    const [f, t] = reportPresetDates(p, now, allFrom)
    setDraft((d) => ({ preset: p, from: f, to: t, compare: p === 'all' ? null : d.compare }))
    setEditing('from')
    const td = fromISO(t); setMonth(new Date(td.getFullYear(), td.getMonth() - (phone ? 0 : 1), 1))
  }
  // First click starts a new range, the second ends it (either order); typing in From / To sets one end.
  const pickDay = (s: ISODate) => {
    if (editing === 'from') { setDraft((d) => ({ ...d, preset: 'custom', from: s, to: null })); setEditing('to'); return }
    setDraft((d) => (!d.from || s < d.from ? { ...d, preset: 'custom', from: s, to: d.from ?? s } : { ...d, preset: 'custom', to: s }))
    setEditing('from')
  }
  const df = draft.from, dt = draft.to ?? draft.from
  const cmp = df && dt && draft.compare ? compareDates(df, dt, draft.compare) : null
  const apply = () => { if (!df || !dt) return; onChange({ preset: draft.preset, from: df, to: dt, compare: draft.compare }); close() }
  const shownCmp = comparisonOf(value)

  const presetList = (
    <div className="bp-rk-presets" role="listbox" aria-label="Quick ranges">
      {groups.map((g, gi) => (
        <div key={gi} className="bp-rk-group">
          {g.map((p) => (
            <button key={p} type="button" role="option" aria-selected={draft.preset === p} onClick={() => usePreset(p as Exclude<ReportPreset, 'custom'>)}>
              <span>{REPORT_PRESET_LABEL[p]}</span>{presetHint(p, now) && <em>{presetHint(p, now)}</em>}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
  const fields = (
    <div className="bp-rk-fields">
      <TypedDate label="From" value={draft.from} active={editing === 'from'} onFocus={() => setEditing('from')} onCommit={(s) => { if (s <= max) { setDraft((d) => ({ ...d, preset: 'custom', from: s, to: d.to && d.to >= s ? d.to : s })); setMonth(new Date(fromISO(s).getFullYear(), fromISO(s).getMonth(), 1)) } }} />
      <span className="bp-rk-arrow" aria-hidden="true">→</span>
      <TypedDate label="To" value={draft.to} active={editing === 'to'} onFocus={() => setEditing('to')} onCommit={(s) => { if (s <= max) setDraft((d) => ({ ...d, preset: 'custom', to: d.from && s < d.from ? d.from : s, from: d.from && s < d.from ? s : d.from })) }} />
      {df && dt && <span className="bp-rk-days"><i aria-hidden="true" />{rangeDays(df, dt)} {rangeDays(df, dt) === 1 ? 'day' : 'days'}</span>}
    </div>
  )
  const nextOk = toISO(new Date(month.getFullYear(), month.getMonth() + (phone ? 1 : 2), 1)) <= max
  const months = (
    <div className="bp-rk-months" data-count={phone ? 1 : 2}>
      {(phone ? [0] : [0, 1]).map((i) => {
        const m = new Date(month.getFullYear(), month.getMonth() + i, 1)
        return (
          <div key={i} className="bp-rk-monthwrap">
            <div className="bp-rk-mhead">
              <b aria-live="polite">{MONTHS_LONG[m.getMonth()]} {m.getFullYear()}</b>
              {i === 0 && <button type="button" className="bp-icon-btn" aria-label="Earlier month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft size={16} /></button>}
              {(phone || i === 1) && <button type="button" className="bp-icon-btn" aria-label="Later month" disabled={!nextOk} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight size={16} /></button>}
            </div>
            <MonthGrid month={m} from={draft.from} to={draft.to} cmp={cmp} max={max} min={min} onPick={pickDay} />
          </div>
        )
      })}
    </div>
  )
  const compareRow = canCompare && draft.preset !== 'all' && (
    <fieldset className="bp-rk-compare">
      <legend>Compare with</legend>
      <div className="bp-rk-cmprow" role="radiogroup" aria-label="Compare with">
        {(Object.keys(COMPARE_LABEL) as CompareMode[]).map((m) => {
          const d = df && dt ? compareDates(df, dt, m) : null
          return (
            <button key={m} type="button" role="radio" aria-checked={draft.compare === m} className="bp-rk-cmp" onClick={() => setDraft((x) => ({ ...x, compare: x.compare === m ? null : m }))}>
              <span className="rd" aria-hidden="true" /><b>{COMPARE_LABEL[m]}</b><span>{d ? rangeText(d[0], d[1], { year: m === 'lastYear' }) : '—'}</span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
  const note = canCompare && cmp ? 'Grey underline = comparison days' : df && dt ? rangeText(df, dt) : 'Pick the first day'

  return (
    <div className={`bp-rk-bar${className ? ' ' + className : ''}`}>
      <div ref={anchor} className="bp-rk-anchor">
        <button type="button" className="bp-rk-trigger" aria-haspopup="dialog" aria-expanded={open} onClick={() => (open ? close() : openWith())}>
          <span className="ic" aria-hidden="true"><CalendarIcon size={16} /></span>
          <span className="tx"><b>{REPORT_PRESET_LABEL[value.preset]}</b><span>{rangeText(value.from, value.to)}</span></span>
          <ChevronDown size={16} className="chev" aria-hidden="true" />
        </button>
      </div>
      {canCompare && shownCmp && (
        <span className="bp-rk-chip">
          <i aria-hidden="true" /><span>vs {rangeText(shownCmp[0], shownCmp[1], { year: value.compare === 'lastYear' })}</span>
          <button type="button" aria-label="Stop comparing" onClick={() => onChange({ ...value, compare: null })}><X size={14} /></button>
        </span>
      )}
      {canCompare && !shownCmp && value.preset !== 'all' && <button type="button" className="bp-rk-chip" data-add="" onClick={() => openWith('compare')}>+ Compare</button>}

      {open && !phone && createPortal(
        <div ref={pop} className="bp-pop bp-rk-pop" style={style} role="dialog" aria-label={label}>
          {presetList}
          <div className="bp-rk-main">
            {fields}{months}{compareRow}
            <div className="bp-rk-foot"><span>{note}</span><Button variant="quiet" onClick={close}>Cancel</Button><Button variant="primary" disabled={!df} onClick={apply}>Apply</Button></div>
          </div>
        </div>,
        document.body,
      )}
      {phone && (
        <Sheet open={open} title={label} onClose={close} footer={<Button variant="primary" size="lg" fullWidth disabled={!df} onClick={apply}>{df && dt ? `Show ${rangeText(df, dt, { year: false })}` : 'Pick the first day'}</Button>}>
          <div className="bp-rk-sheet">
            <div className="bp-chips">{groups.flat().map((p) => <button key={p} type="button" className="bp-qv" aria-pressed={draft.preset === p} onClick={() => usePreset(p as Exclude<ReportPreset, 'custom'>)}>{REPORT_PRESET_LABEL[p]}</button>)}</div>
            {fields}{months}{compareRow}
          </div>
        </Sheet>
      )}
    </div>
  )
}

/** Reads a report's range from the URL (?p=&from=&to=&vs=) so a refresh or a shared link keeps it. */
export function rangeFromSearch(search: URLSearchParams, fallback: ReportRange, allFrom?: ISODate): ReportRange {
  const f = search.get('from'), t = search.get('to'), p = search.get('p'), vs = search.get('vs')
  const okDate = (s: string | null): s is string => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s)
  const compare: CompareMode | null = vs === 'none' ? null : vs === 'previous' || vs === 'lastMonth' || vs === 'lastYear' ? vs : fallback.compare
  if (p && p !== 'custom' && p in REPORT_PRESET_LABEL) {
    const preset = p as Exclude<ReportPreset, 'custom'>
    const [from, to] = reportPresetDates(preset, new Date(), allFrom)
    return { preset, from, to, compare: preset === 'all' ? null : compare }
  }
  if (okDate(f) && okDate(t) && f <= t) return { preset: 'custom', from: f, to: t, compare }
  return { ...fallback, compare: fallback.preset === 'all' ? null : compare }
}
/** The URL params for a range (a preset keeps only its name, so "Last 30 days" still means the last 30 days tomorrow). */
export function rangeToSearch(r: ReportRange): Record<string, string> {
  return { p: r.preset, ...(r.preset === 'custom' ? { from: r.from, to: r.to } : {}), vs: r.compare ?? 'none' }
}

// ---------------------------------------------------------------- charts

const EmptyLine = ({ children }: { children?: ReactNode }) => <p className="bp-rk-empty">{children ?? 'Nothing recorded in these days.'}</p>

export interface GhostPoint { label: string; value: number; was?: number | null; wasLabel?: string }

/**
 * Daily columns (src2 04). `was` is the comparison day's real figure, drawn as a grey ghost column behind the
 * column. Hover or focus a day for both figures. `legend` names the two periods with their totals.
 */
export function GhostColumns({ points, format, tick, height = 180, legend, empty }: {
  points: GhostPoint[]; format: (v: number) => string; tick?: (i: number) => boolean; height?: number
  legend?: { now: string; was?: string }; empty?: ReactNode
}) {
  const [active, setActive] = useState<number | null>(null)
  const max = Math.max(1, ...points.map((p) => Math.max(p.value, p.was ?? 0)))
  const hasWas = points.some((p) => p.was != null)
  if (points.length === 0 || points.every((p) => p.value === 0 && !p.was)) return <EmptyLine>{empty}</EmptyLine>
  const a = active != null ? points[active] : null
  return (
    <div className="bp-rk-ghost">
      <div className="plot" style={{ height }} role="img" aria-label={points.map((p) => `${p.label}: ${format(p.value)}${p.was != null ? `, was ${format(p.was)}` : ''}`).join('; ')} onMouseLeave={() => setActive(null)}>
        {a && (
          <span className="tip" style={{ left: `${((active! + 0.5) / points.length) * 100}%` }}>
            <b>{a.label} · {format(a.value)}</b>{a.was != null && <span>{a.wasLabel ? `${a.wasLabel} · ` : 'was '}{format(a.was)}</span>}
          </span>
        )}
        {points.map((p, i) => (
          <div key={i} className="col" data-on={active === i || undefined} tabIndex={0} aria-label={`${p.label}: ${format(p.value)}`} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onBlur={() => setActive(null)}>
            {p.was != null && <i className="was" style={{ height: `${(p.was / max) * 100}%` }} />}
            <i className="now" style={{ height: `${p.value ? Math.max(2, (p.value / max) * 100) : 0}%` }} />
          </div>
        ))}
      </div>
      <div className="axis">{points.map((p, i) => <span key={i}>{!tick || tick(i) ? p.label : ''}</span>)}</div>
      {legend && <div className="legend"><span data-k="now">{legend.now}</span>{hasWas && legend.was && <span data-k="was">{legend.was}</span>}</div>}
    </div>
  )
}

export interface ShareRow { label: string; value: number; was?: number | null; note?: string }

/** Share bars (src2 04 "How members paid"): the bar is now, the thin grey marker is where the comparison period ended. */
export function ShareBars({ rows, format, empty }: { rows: ShareRow[]; format: (v: number) => string; empty?: ReactNode }) {
  if (rows.length === 0) return <EmptyLine>{empty ?? 'Nothing in these days.'}</EmptyLine>
  const max = Math.max(1, ...rows.map((r) => Math.max(r.value, r.was ?? 0)))
  return (
    <div className="bp-rk-share">
      {rows.map((r) => (
        <div key={r.label} className="row">
          <div className="lab"><span>{r.label}{r.note && <small>{r.note}</small>}</span><span><b>{format(r.value)}</b>{r.was != null && <em>was {format(r.was)}</em>}</span></div>
          <div className="bar" aria-hidden="true"><i style={{ width: `${(r.value / max) * 100}%` }} />{r.was != null && <u style={{ left: `calc(${(r.was / max) * 100}% - 1.5px)` }} />}</div>
        </div>
      ))}
    </div>
  )
}

const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const hourText = (h: number) => `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? 'am' : 'pm'}`
const hourShort = (h: number) => `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? 'a' : 'p'}`

/**
 * Day-by-hour heat grid (src2 05): rows Monday to Sunday, columns hours, darker = busier. `grid[weekday][hour]`
 * with Monday = 0. Shows `hours` (default 5am–10pm), widened when there are visits outside them.
 */
export function HeatGrid({ grid, hours = [5, 22], noun = 'check-in', empty }: { grid: number[][]; hours?: [number, number]; noun?: string; empty?: ReactNode }) {
  const total = grid.reduce((s, r) => s + r.reduce((a, b) => a + b, 0), 0)
  if (!total) return <EmptyLine>{empty}</EmptyLine>
  const used = Array.from({ length: 24 }, (_, h) => grid.some((r) => (r[h] ?? 0) > 0))
  const lo = Math.min(hours[0], used.indexOf(true)), hi = Math.max(hours[1], used.lastIndexOf(true))
  const cols = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)
  const max = Math.max(1, ...grid.flatMap((r) => cols.map((h) => r[h] ?? 0)))
  const every = cols.length > 12 ? 3 : cols.length > 8 ? 2 : 1
  const plural = (n: number) => `${n} ${noun}${n === 1 ? '' : 's'}`
  return (
    <div className="bp-rk-heatwrap">
      <div className="bp-rk-heat" style={{ gridTemplateColumns: `40px repeat(${cols.length}, minmax(0, 1fr))` }} role="table" aria-label={`${plural(total)} by day and hour, darker = busier`}>
        <span />
        {cols.map((h, i) => <span key={h} className="hh" aria-hidden="true">{i % every === 0 ? hourShort(h) : ''}</span>)}
        {WEEK.map((d, w) => (
          <div key={d} role="row" style={{ display: 'contents' }}>
            <span className="dd" role="rowheader">{d}</span>
            {cols.map((h) => {
              const v = grid[w]?.[h] ?? 0
              const level = v ? Math.max(1, Math.ceil((v / max) * 4)) : 0
              return <i key={h} role="cell" data-level={level} title={`${d} ${hourText(h)}: ${plural(v)}`} aria-label={`${d} ${hourText(h)}: ${plural(v)}`} />
            })}
          </div>
        ))}
      </div>
      <div className="key" aria-hidden="true"><span>Quiet</span>{[0, 1, 2, 3, 4].map((l) => <i key={l} data-level={l} />)}<span>Busy</span></div>
    </div>
  )
}

/** A small trend line under a KPI. Fewer than two points draws nothing. */
export function Sparkline({ values, height = 30 }: { values: number[]; height?: number }) {
  if (values.length < 2) return null
  const W = 200, max = Math.max(...values), min = Math.min(...values), span = max - min || 1
  const pts = values.map((v, i) => `${((i / (values.length - 1)) * W).toFixed(1)},${(height - 3 - ((v - min) / span) * (height - 6)).toFixed(1)}`).join(' ')
  return <svg className="bp-rk-spark" viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" aria-hidden="true"><polyline points={pts} fill="none" vectorEffect="non-scaling-stroke" /></svg>
}

export interface KpiDelta { text: string; tone?: 'up' | 'down' | 'plain' }

/** One KPI (src3 15): label, figure, its comparison and a sparkline. `value` null = nothing to show yet ("—"). */
export function ReportKpi({ label, value, unit, delta, spark }: { label: string; value: ReactNode | null; unit?: string; delta?: KpiDelta | null; spark?: number[] }) {
  return (
    <div className="bp-rk-kpi" data-none={value == null || undefined}>
      <span className="k">{label}</span>
      {value == null ? <span className="v">—</span> : <span className="v">{unit && <small>{unit} </small>}{value}</span>}
      {value != null && delta && <span className="d" data-tone={delta.tone ?? 'plain'}>{delta.tone === 'up' ? '▲ ' : delta.tone === 'down' ? '▼ ' : ''}{delta.text}</span>}
      {value != null && spark && <Sparkline values={spark} />}
    </div>
  )
}
export function ReportKpis({ children }: { children: ReactNode }) { return <div className="bp-rk-kpis">{children}</div> }

/** Haki's brief (src3 15): a title and up to three lines, each built from a real record. No lines, no card. */
export function HakiBrief({ title = 'This week, in three lines', lines, mascotSrc }: { title?: string; lines: ReactNode[]; mascotSrc?: string }) {
  const shown = lines.filter(Boolean).slice(0, 3)
  if (!shown.length) return null
  return (
    <section className="bp-rk-brief" aria-label={title}>
      {mascotSrc ? <img src={mascotSrc} alt="" width={36} height={36} /> : <span className="haki" aria-hidden="true" />}
      <div><b>{title}</b><ul>{shown.map((l, i) => <li key={i}>{l}</li>)}</ul></div>
    </section>
  )
}

/** Stage columns (quote → ordered → invoiced → paid). Heights scale to the largest stage; labels sit inside. */
export function FlowBars({ stages, format, height = 180, empty }: { stages: { label: string; value: number }[]; format: (v: number) => string; height?: number; empty?: ReactNode }) {
  const max = Math.max(0, ...stages.map((s) => s.value))
  if (!max) return <EmptyLine>{empty}</EmptyLine>
  return (
    <div className="bp-rk-flow" style={{ height }} role="list">
      {stages.map((s, i) => (
        <div key={s.label} role="listitem" data-step={Math.min(i, 3)} style={{ height: `${Math.max(34, (s.value / max) * 100)}%` }}>
          <b>{format(s.value)}</b><span>{s.label}</span>
        </div>
      ))}
    </div>
  )
}

/** Top-N ranking (src3 15): bars scale to the leader, figure on the right. */
export function RankBars({ rows, format, limit = 5, empty }: { rows: { label: string; value: number }[]; format: (v: number) => string; limit?: number; empty?: ReactNode }) {
  const top = [...rows].filter((r) => r.value > 0).sort((a, b) => b.value - a.value).slice(0, limit)
  if (!top.length) return <EmptyLine>{empty}</EmptyLine>
  const lead = top[0].value
  return (
    <div className="bp-rk-rank">
      {top.map((r) => (
        <div key={r.label} className="r"><span className="l">{r.label}</span><span className="bar" aria-hidden="true"><i style={{ width: `${(r.value / lead) * 100}%` }} /></span><b>{format(r.value)}</b></div>
      ))}
    </div>
  )
}

/** A report card: title, one light line, then the picture. */
export function ReportCard({ title, sub, aside, children, className }: { title: string; sub?: string; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`bp-rk-card${className ? ' ' + className : ''}`}>
      <header><div><h3>{title}</h3>{sub && <p>{sub}</p>}</div>{aside}</header>
      {children}
    </section>
  )
}

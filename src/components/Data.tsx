import { useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ArrowDown, ArrowDownRight, ArrowUp, ArrowUpRight, Check, ChevronDown, ChevronLeft, ChevronRight, Filter, Minus, Search, SlidersHorizontal, X } from 'lucide-react'
import { cn } from '../lib/utils'
import { Button } from './Guarded'
import { Checkbox } from './Form'
import { Sheet, useIsPhone, useOutside, usePopover } from './Overlay'
import { CountBadge } from './StatusChip'

/**
 * Data pieces (standards §17.8–17.11, §17.15, §17.20; round 2 R4, R6, W2, W5).
 *   TableFoot, BulkBar, SortHeader, ColumnFilter, SelectCell   additions around <DataTable>
 *   FilterBar, QuickViews, FilterChips                         list pages
 *   Comparison, SplitBar, CHART_SERIES                         figures and charts
 *   Steps, ProgressBar                                         progress
 *   Avatar, AvatarGroup, PersonRow, Plate                      people and vehicles
 */

/* ── Tables ────────────────────────────────────────────────── */
/**
 * Navy treatment (R4b): <DataTable className="…"> inside <div className="bp-table-wrap" data-navy>, table
 * gets data-head="navy", and <TableFoot tone="navy"> carries the total. Money tables only; never on a navy
 * band, never more than one navy table per view. Everything else keeps the sunken head (R4a).
 */
export function TableFoot({ shown, total, totalLabel, sum, page, pages, onPage, tone = 'sunken' }: { shown: [number, number]; total: number; totalLabel?: string; sum?: string; page?: number; pages?: number; onPage?: (p: number) => void; tone?: 'sunken' | 'navy' }) {
  return (
    <div className="bp-table-foot" data-tone={tone}>
      <span style={{ flex: 1 }}>Showing {shown[0]}–{shown[1]} of {total}{sum && <> · {totalLabel ?? 'Total'} <b>{sum}</b></>}</span>
      {pages != null && pages > 1 && onPage && page != null && (
        <span style={{ display: 'flex', gap: 4 }}>
          <button type="button" className="bp-icon-btn" aria-label="Previous page" disabled={page <= 1} onClick={() => onPage(page - 1)} style={{ color: 'inherit' }}><ChevronLeft size={18} /></button>
          <button type="button" className="bp-icon-btn" aria-label="Next page" disabled={page >= pages} onClick={() => onPage(page + 1)} style={{ color: 'inherit' }}><ChevronRight size={18} /></button>
        </span>
      )}
    </div>
  )
}

/** Replaces the table header in place while rows are ticked. Up to 3 secondary actions; no primary. Destructive bulk goes through ConfirmDialog with the count. */
export function BulkBar({ count, noun, actions, onClear }: { count: number; noun: string; actions: { label: string; onClick: () => void }[]; onClear: () => void }) {
  if (count === 0) return null
  if (actions.length > 3 && typeof console !== 'undefined') console.warn('[@blackpaw/ui] BulkBar: 3 actions at most; move the rest to a Menu.')
  return (
    <div className="bp-bulkbar" role="region" aria-label={`${count} ${noun} selected`}>
      <span style={{ flex: 1 }}>{count} selected</span>
      {actions.slice(0, 3).map((a) => <Button key={a.label} variant="secondary" onClick={a.onClick}>{a.label}</Button>)}
      <Button variant="tertiary" onClick={onClear}>Clear</Button>
    </div>
  )
}

export type SortDir = 'asc' | 'desc'
/** Header button for a sortable column. Only the sorted column shows an arrow. Figures and dates sort largest/newest first on first click; text A–Z. */
export function SortHeader({ label, active, dir, onSort, numeric }: { label: string; active: boolean; dir: SortDir; onSort: (dir: SortDir) => void; numeric?: boolean }) {
  const first: SortDir = numeric ? 'desc' : 'asc'
  return (
    <button type="button" className="bp-sort" aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'} onClick={() => onSort(active ? (dir === 'asc' ? 'desc' : 'asc') : first)} style={numeric ? { marginLeft: 'auto' } : undefined}>
      {label}{active && (dir === 'asc' ? <ArrowUp size={16} aria-hidden="true" /> : <ArrowDown size={16} aria-hidden="true" />)}
    </button>
  )
}

/** First-column checkbox. The header version selects the page and shows a dash when some are ticked. Stops the row click. */
export function SelectCell({ checked, onChange, label }: { checked: boolean | 'mixed'; onChange: (v: boolean) => void; label: string }) {
  return <span onClick={(e) => e.stopPropagation()} style={{ display: 'flex', justifyContent: 'center' }}><span className="sr-only">{label}</span><Checkbox checked={checked} onChange={onChange} label="" /></span>
}

export interface ColumnFilterOption { value: string; label: string; count?: number }
/**
 * Precision filter in a column header (W5): wide tables only (stock, price lists, reports).
 * Status columns: checkboxes with counts. Numbers: bands plus an optional min–max. Shares state with
 * FilterBar, so the active filter also shows as a chip above the table.
 */
export function ColumnFilter({ label, options, value, onChange, range, onRange }: { label: string; options: ColumnFilterOption[]; value: string[]; onChange: (v: string[]) => void; range?: [number | null, number | null]; onRange?: (r: [number | null, number | null]) => void }) {
  const [open, setOpen] = useState(false)
  const btn = useRef<HTMLButtonElement>(null)
  const pop = useRef<HTMLDivElement>(null)
  const phone = useIsPhone()
  const style = usePopover(btn, open && !phone, { width: 280 })
  useOutside([btn, pop], open && !phone, () => setOpen(false))
  const active = (value.length > 0 && value.length < options.length) || (range && (range[0] != null || range[1] != null))
  const body = (
    <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <p style={{ margin: '2px 4px 6px', fontSize: 15, fontWeight: 800 }}>Show {label.toLowerCase()} that are</p>
      {options.map((o) => (
        <div key={o.value} style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ flex: 1 }}><Checkbox checked={value.includes(o.value)} onChange={(on) => onChange(on ? [...value, o.value] : value.filter((x) => x !== o.value))} label={o.label} /></span>
          {o.count != null && <span className="bp-help">{o.count}</span>}
        </div>
      ))}
      {onRange && (
        <div style={{ borderTop: '1px solid var(--c-border)', marginTop: 6, paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Or a range</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {[0, 1].map((i) => <div key={i} className="bp-control" style={{ flex: 1, minHeight: 40 }}><input inputMode="numeric" aria-label={i ? 'Max' : 'Min'} placeholder={i ? 'Max' : 'Min'} value={range?.[i] ?? ''} onChange={(e) => { const n = e.target.value === '' ? null : Number(e.target.value.replace(/\D/g, '')); const r: [number | null, number | null] = [range?.[0] ?? null, range?.[1] ?? null]; r[i] = n; onRange(r) }} /></div>)}
          </div>
        </div>
      )}
      {active && <Button variant="tertiary" onClick={() => { onChange([]); onRange?.([null, null]) }}>Clear</Button>}
    </div>
  )
  return (
    <>
      <button ref={btn} type="button" className="bp-colfilter-btn" data-active={active || undefined} aria-label={`Filter ${label}`} aria-expanded={open} onClick={() => setOpen(!open)}><Filter size={15} /></button>
      {open && !phone && createPortal(<div ref={pop} className="bp-pop" style={style}>{body}</div>, document.body)}
      {phone && <Sheet open={open} title={`Filter ${label.toLowerCase()}`} onClose={() => setOpen(false)}>{body}</Sheet>}
    </>
  )
}

/* ── Filter bar ────────────────────────────────────────────── */
export interface QuickView { key: string; label: string; count: number }
/** 3–5 slices people use (All, Open, Overdue, Ready for pickup, Not assigned). One is always on. Scrolls sideways on phone. */
export function QuickViews({ views, value, onChange }: { views: QuickView[]; value: string; onChange: (k: string) => void }) {
  return (
    <div className="bp-quickviews" role="group" aria-label="Views">
      {views.map((v) => <button key={v.key} type="button" className="bp-qv" aria-pressed={value === v.key} onClick={() => onChange(v.key)}>{v.label}<CountBadge n={v.count} /></button>)}
    </div>
  )
}

export interface ActiveFilter { key: string; label: string; onRemove: () => void }
export function FilterChips({ filters, onClearAll }: { filters: ActiveFilter[]; onClearAll: () => void }) {
  if (!filters.length) return null
  return (
    <div className="bp-chips">
      {filters.map((f) => <button key={f.key} type="button" className="bp-chip-x" aria-label={`Remove ${f.label}`} onClick={f.onRemove}>{f.label}<X size={16} aria-hidden="true" /></button>)}
      {filters.length >= 2 && <Button variant="tertiary" onClick={onClearAll}>Clear all</Button>}
    </div>
  )
}

export interface FilterButton { key: string; label: string; active: boolean; onClick: () => void }
/**
 * Sits directly under PageTitle, above the table, same width. Search left, filling; placeholder names what
 * it matches. Up to 3 inline filter buttons that state their value ("Technician: Peter"); 4+ collapse into
 * one "Filters · n" button (`onOpenAll`), which is also the only button on phone. Filters persist in the URL.
 * The count lives in the PageTitle sentence and the table footer only.
 */
export function FilterBar({ query, onQuery, placeholder, filters = [], onOpenAll, activeCount = 0, actions }: { query: string; onQuery: (q: string) => void; placeholder: string; filters?: FilterButton[]; onOpenAll?: () => void; activeCount?: number; actions?: ReactNode }) {
  const phone = useIsPhone()
  const inline = !phone && filters.length <= 3
  return (
    <div className="bp-filterbar">
      <label className="bp-search"><Search size={18} aria-hidden="true" style={{ color: 'var(--c-muted)' }} /><input type="search" value={query} onChange={(e) => onQuery(e.target.value)} placeholder={phone ? 'Search' : placeholder} aria-label={placeholder} /></label>
      {inline
        ? filters.map((f) => <button key={f.key} type="button" className="bp-filter-btn" data-active={f.active || undefined} onClick={f.onClick}>{f.label}<ChevronDown size={16} aria-hidden="true" /></button>)
        : onOpenAll && <button type="button" className="bp-filter-btn" data-active={activeCount > 0 || undefined} onClick={onOpenAll} style={{ color: 'var(--c-signal-text)', borderColor: 'var(--c-signal)' }}><SlidersHorizontal size={18} aria-hidden="true" />Filters{activeCount ? ` · ${activeCount}` : ''}</button>}
      {actions}
    </div>
  )
}

/* ── Figures ───────────────────────────────────────────────── */
/** Chart series order. One highlighted series; comparisons grey. Status colours only for status series; never orange. */
export const CHART_SERIES = ['var(--c-series-1)', 'var(--c-series-2)', 'var(--c-series-3)'] as const

/**
 * Comparison line under a KpiStat figure. Arrow = direction; colour = good or bad from `goodWhen`.
 * Same period length and point ("vs 1–10 Sep"). Under 1 %: "Same as last month", muted, no arrow.
 * No history: "First month of data".
 */
export function Comparison({ change, vs, goodWhen = 'up', unit = '%', noHistory, sameLabel = 'Same as last month' }: { change?: number; vs: string; goodWhen?: 'up' | 'down'; unit?: '%' | ''; noHistory?: boolean; sameLabel?: string }) {
  if (noHistory || change == null) return <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-muted)' }}>First month of data</span>
  if (unit === '%' && Math.abs(change) < 1) return <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-muted)' }}>{sameLabel}</span>
  const up = change > 0
  const good = up === (goodWhen === 'up')
  const Icon = up ? ArrowUpRight : ArrowDownRight
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 700, color: good ? 'var(--v-pos)' : 'var(--v-crit)' }}>
      <Icon size={16} strokeWidth={2.6} aria-hidden="true" />{up ? '+' : '−'}{Math.abs(change)}{unit} vs {vs}
      <span className="sr-only">{good ? '(better)' : '(worse)'}</span>
    </span>
  )
}

/** A 2–3 part share inside a tile ("KES 133K sent · KES 81K not sent yet"). */
export function SplitBar({ parts }: { parts: { label: string; value: number; display: string }[] }) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', height: 14, borderRadius: 999, overflow: 'hidden', gap: 3 }} role="img" aria-label={parts.map((p) => `${p.display} ${p.label}`).join(', ')}>
        {parts.map((p, i) => <span key={p.label} style={{ width: `${(p.value / total) * 100}%`, background: CHART_SERIES[i] }} />)}
      </div>
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: 15, color: 'var(--c-ink)' }}>
        {parts.map((p, i) => <span key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: CHART_SERIES[i] }} /><b>{p.display}</b> {p.label}</span>)}
      </div>
    </div>
  )
}

/* ── Progress ──────────────────────────────────────────────── */
export type StepState = 'done' | 'current' | 'skipped' | 'todo'
export interface Step { label: string; state: StepState; /** 2–3 words, never wraps: "Done", "Skipped", "Now", "Next". The summary of what was entered goes in a review card. */ sub?: string }
const DEFAULT_SUB: Record<StepState, string> = { done: 'Done', current: 'Now', skipped: 'Skipped', todo: 'Next' }

/**
 * 3–6 steps of one task. Desktop: horizontal, at least 200 px per step, labels centred (R6a).
 * 5–6 step setups may use `orientation="vertical"` beside the form (R6b).
 * Phone: "Step 3 of 4", segments, "All steps" (R6c); the step name is the page title.
 * Done and skipped steps can be reopened (`onOpen`).
 */
export function Steps({ steps, orientation = 'horizontal', onOpen }: { steps: Step[]; orientation?: 'horizontal' | 'vertical'; onOpen?: (i: number) => void }) {
  const phone = useIsPhone()
  const cur = steps.findIndex((s) => s.state === 'current')
  if (steps.length < 3 || steps.length > 6) console.warn('[@blackpaw/ui] Steps: 3–6 steps. Under 3 use one page; over 6 group them.')
  if (phone) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span style={{ fontSize: 15, fontWeight: 700 }}>Step {cur + 1} of {steps.length}</span>
      <div className="bp-steps-phone" aria-hidden="true">{steps.map((s, i) => <span key={i} data-state={s.state} />)}</div>
    </div>
  )
  const dot = (s: Step, i: number) => <span className="bp-step-dot" aria-hidden="true">{s.state === 'done' ? <Check size={18} strokeWidth={3} /> : s.state === 'skipped' ? <Minus size={18} strokeWidth={3} /> : i + 1}</span>
  if (orientation === 'vertical') return (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
      {steps.map((s, i) => (
        <li key={s.label} className="bp-step" data-state={s.state} style={{ flexDirection: 'row', alignItems: 'flex-start', textAlign: 'left', minHeight: 60, gap: 12 }} aria-current={s.state === 'current' ? 'step' : undefined}>
          {dot(s, i)}<span style={{ display: 'flex', flexDirection: 'column', paddingTop: 8 }}><span className="bp-step-label" style={{ fontSize: 16 }}>{s.label}</span><span className="bp-step-sub" style={{ fontSize: 14 }}>{s.sub ?? DEFAULT_SUB[s.state]}</span></span>
        </li>
      ))}
    </ol>
  )
  return (
    <ol className="bp-steps" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {steps.map((s, i) => {
        const can = onOpen && (s.state === 'done' || s.state === 'skipped')
        const inner = <>{dot(s, i)}<span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="bp-step-label">{s.label}</span><span className="bp-step-sub">{s.sub ?? DEFAULT_SUB[s.state]}</span></span></>
        return <li key={s.label} className="bp-step" data-state={s.state} aria-current={s.state === 'current' ? 'step' : undefined}>{can ? <button type="button" onClick={() => onOpen!(i)} style={{ border: 0, background: 'transparent', display: 'contents', cursor: 'pointer' }}>{inner}</button> : inner}</li>
      })}
    </ol>
  )
}

/** "3 of 5" for countable things; a percentage only for continuous work. Never both. */
export function ProgressBar({ label, done, total, percent, tone }: { label: string; done?: number; total?: number; percent?: number; tone?: 'warn' | 'crit' }) {
  const pct = percent ?? (total ? (100 * (done ?? 0)) / total : 0)
  const text = percent != null ? `${Math.round(percent)}%` : `${done} of ${total}`
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}><span style={{ flex: 1, fontSize: 16, fontWeight: 800 }}>{label}</span><span style={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{text}</span></div>
      <div className="bp-progress" data-tone={tone} role="progressbar" aria-label={label} aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${Math.min(100, pct)}%` }} /></div>
    </div>
  )
}

/* ── People and vehicles ───────────────────────────────────── */
/** Six fixed pairs from the brand tints; chosen by a hash of the person's id so the colour never changes. Colour carries no meaning. */
export const AVATAR_PAIRS = [['#e7f0ff', '#1d4f9e'], ['#E8FBFD', '#005468'], ['#FFE2BF', '#7a4100'], ['#fde4e5', '#a3141a'], ['#e4e9f2', '#032053'], ['#e3f3ea', '#11663f']] as const
export type AvatarSize = 24 | 32 | 40 | 64
const FONT: Record<AvatarSize, number> = { 24: 10, 32: 13, 40: 15, 64: 22 }

export function initials(name: string) {
  const w = name.trim().split(/\s+/).filter(Boolean)
  return ((w[0]?.[0] ?? '') + (w[1]?.[0] ?? '')).toUpperCase() || '?'
}
function pairFor(key: string) { let h = 0; for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) % 997; return AVATAR_PAIRS[h % 6] }

/** 24 tables and chips · 32 cards and groups · 40 rows and AppTop · 64 profile. Photo when uploaded, else initials. Never a silhouette. */
export function Avatar({ name, id, src, size = 40, className }: { name: string; id?: string; src?: string; size?: AvatarSize; className?: string }) {
  const [bg, ink] = pairFor(id ?? name)
  return (
    <span className={cn('bp-avatar', className)} style={{ width: size, height: size, background: src ? 'var(--c-sunken)' : bg, color: ink, fontSize: FONT[size] }} aria-hidden="true">
      {src ? <img src={src} alt="" /> : initials(name)}
    </span>
  )
}

export function AvatarGroup({ people, total, label }: { people: { name: string; id?: string; src?: string }[]; total?: number; label?: string }) {
  const n = total ?? people.length
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
      <span className="bp-avatar-group" style={{ display: 'inline-flex' }}>
        {people.slice(0, 3).map((p) => <Avatar key={p.id ?? p.name} {...p} size={32} />)}
        {n > 3 && <span className="bp-avatar" style={{ width: 32, height: 32, background: 'var(--c-sunken)', color: 'var(--c-ink)', fontSize: 13 }}>+{n - 3}</span>}
      </span>
      {label && <span className="bp-help" style={{ fontSize: 15 }}>{label}</span>}
    </span>
  )
}

export function PersonRow({ name, id, src, sub, action }: { name: string; id?: string; src?: string; sub?: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="bp-person">
      <Avatar name={name} id={id} src={src} size={40} />
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: 16, fontWeight: 800 }}>{name}</span>{sub && <span className="bp-help" style={{ fontSize: 15 }}>{sub}</span>}</span>
      {action && <Button variant="tertiary" onClick={action.onClick}>{action.label}</Button>}
    </div>
  )
}

/** Number plate as a plate (W2, W3). Keeps capitals via data-caps. */
export function Plate({ value }: { value: string }) {
  return <span className="bp-plate" data-caps="">{value}</span>
}

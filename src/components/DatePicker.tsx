import { useCallback, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { Sheet, useIsPhone, useOutside, usePopover } from './Overlay'
import { Button } from './Guarded'
import { formatDate } from '../lib/format'

/**
 * DatePicker, DateRangePicker (standards §17.4). Replaces type="date" (check native-date).
 * Values are local date-only strings "2026-10-14" (never pass them through a time formatter, §12).
 *   - Field shows formatDate ("14 Oct 2026"); ranges "1 Oct – 10 Oct 2026". Weeks start Monday.
 *   - Typing is read day first: "14/10", "14/10/26", "14 Oct" → 14 Oct 2026.
 *   - Presets only on report and filter ranges (`presets`), never on bookings or due dates.
 *   - min/max: days outside are struck through, the month arrow past the limit is disabled, and
 *     `limitNote` says why ("Reports stop at today", "Bookings start tomorrow").
 *   - Today has a ring; the chosen day is a Signal Blue fill; the days between take the selected tint.
 *   - Phone: bottom sheet, presets as a sideways-scrolling chip row, one primary that states the result.
 */

export type ISODate = string
const pad = (n: number) => String(n).padStart(2, '0')
export const toISO = (d: Date): ISODate => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const fromISO = (s: ISODate) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/** "1 Oct – 10 Oct 2026"; years shown on both sides only when they differ. */
export function formatRange(from: ISODate, to: ISODate) {
  const a = fromISO(from), b = fromISO(to)
  const sameYear = a.getFullYear() === b.getFullYear()
  return `${a.getDate()} ${MONTHS[a.getMonth()]}${sameYear ? '' : ' ' + a.getFullYear()} – ${b.getDate()} ${MONTHS[b.getMonth()]} ${b.getFullYear()}`
}

/** Day-first parsing of typed dates. Returns null when it can't be read. */
export function parseTypedDate(text: string, today = new Date()): ISODate | null {
  const t = text.trim().toLowerCase()
  let m = t.match(/^(\d{1,2})[/.\- ](\d{1,2})(?:[/.\- ](\d{2,4}))?$/)
  if (m) { const y = m[3] ? (m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3])) : today.getFullYear(); const d = new Date(y, Number(m[2]) - 1, Number(m[1])); return d.getDate() === Number(m[1]) ? toISO(d) : null }
  m = t.match(/^(\d{1,2})\s+([a-z]{3,})\.?(?:\s+(\d{4}))?$/)
  if (m) { const mi = MONTHS.findIndex((x) => m![2].startsWith(x.toLowerCase())); if (mi < 0) return null; const d = new Date(m[3] ? Number(m[3]) : today.getFullYear(), mi, Number(m[1])); return toISO(d) }
  return null
}

export type PresetKey = 'today' | 'yesterday' | 'last7' | 'thisMonth' | 'lastMonth'
const PRESET_LABEL: Record<PresetKey, string> = { today: 'Today', yesterday: 'Yesterday', last7: 'Last 7 days', thisMonth: 'This month', lastMonth: 'Last month' }
export function presetRange(k: PresetKey, now = new Date()): [ISODate, ISODate] {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (k === 'today') return [toISO(d), toISO(d)]
  if (k === 'yesterday') { const y = addDays(d, -1); return [toISO(y), toISO(y)] }
  if (k === 'last7') return [toISO(addDays(d, -6)), toISO(d)]
  if (k === 'thisMonth') return [toISO(new Date(d.getFullYear(), d.getMonth(), 1)), toISO(d)]
  return [toISO(new Date(d.getFullYear(), d.getMonth() - 1, 1)), toISO(new Date(d.getFullYear(), d.getMonth(), 0))]
}

interface MonthProps { month: Date; setMonth: (d: Date) => void; isStart: (s: ISODate) => boolean; isEnd: (s: ISODate) => boolean; inRange: (s: ISODate) => boolean; onPick: (s: ISODate) => void; min?: ISODate; max?: ISODate; limitNote?: string; cell: number }

function Month({ month, setMonth, isStart, isEnd, inRange, onPick, min, max, limitNote, cell }: MonthProps) {
  const today = toISO(new Date())
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const lead = (first.getDay() + 6) % 7
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const out = (s: ISODate) => (min != null && s < min) || (max != null && s > max)
  const prevOk = !min || toISO(new Date(month.getFullYear(), month.getMonth(), 0)) >= min
  const nextOk = !max || toISO(new Date(month.getFullYear(), month.getMonth() + 1, 1)) <= max
  const cells: (ISODate | null)[] = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => toISO(new Date(month.getFullYear(), month.getMonth(), i + 1)))]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button type="button" className="bp-icon-btn" aria-label="Previous month" disabled={!prevOk} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft size={18} /></button>
        <div aria-live="polite" style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: 800 }}>{MONTHS_LONG[month.getMonth()]} {month.getFullYear()}</div>
        <button type="button" className="bp-icon-btn" aria-label="Next month" disabled={!nextOk} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight size={18} /></button>
      </div>
      <div role="grid" style={{ display: 'grid', gridTemplateColumns: `repeat(7, ${cell}px)`, rowGap: 2 }}>
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => <div key={d} role="columnheader" style={{ height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--c-muted)' }}>{d}</div>)}
        {cells.map((s, i) => {
          if (!s) return <div key={`b${i}`} />
          const end = isStart(s) || isEnd(s), band = inRange(s), dis = out(s)
          return (
            <div key={s} style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: band ? 'var(--c-selected)' : undefined, borderRadius: isStart(s) && isEnd(s) ? 999 : isStart(s) ? '999px 0 0 999px' : isEnd(s) ? '0 999px 999px 0' : 0 }}>
              <button type="button" role="gridcell" aria-selected={end || band} aria-current={s === today ? 'date' : undefined} disabled={dis} onClick={() => onPick(s)}
                style={{ width: 40, height: 40, borderRadius: 999, border: 0, cursor: dis ? 'default' : 'pointer', font: `${end ? 800 : 600} 15px Urbanist, sans-serif`, background: end ? 'var(--c-signal)' : 'transparent', color: end ? '#fff' : dis ? 'var(--c-dis-ink)' : 'var(--c-ink)', textDecoration: dis ? 'line-through' : undefined, boxShadow: s === today ? '0 0 0 2px var(--c-surface), 0 0 0 4px var(--c-signal)' : undefined }}>
                {Number(s.slice(8))}
              </button>
            </div>
          )
        })}
      </div>
      {limitNote && <p className="bp-help" style={{ margin: 0 }}>{limitNote}</p>}
    </div>
  )
}

function FieldButton({ btnRef, text, empty, open, onClick, id, invalid, describedBy, onType }: { btnRef: React.RefObject<HTMLDivElement | null>; text: string; empty: boolean; open: boolean; onClick: () => void; id?: string; invalid?: boolean; describedBy?: string; onType?: (t: string) => void }) {
  const [typing, setTyping] = useState<string | null>(null)
  return (
    <div ref={btnRef} className="bp-control" data-invalid={invalid || undefined} style={{ alignItems: 'center', paddingLeft: 14, ...(open ? { borderColor: 'var(--c-signal)', boxShadow: '0 0 0 2px var(--c-ring)' } : {}) }}>
      <button type="button" aria-label="Open calendar" onClick={onClick} style={{ border: 0, background: 'transparent', display: 'flex', padding: 0, cursor: 'pointer', color: 'var(--c-muted)' }}><Calendar size={18} /></button>
      <input id={id} aria-describedby={describedBy} value={typing ?? (empty ? '' : text)} placeholder={empty ? text : undefined} readOnly={!onType}
        onClick={onType ? undefined : onClick} onChange={(e) => setTyping(e.target.value)}
        onBlur={() => { if (typing != null && onType) onType(typing); setTyping(null) }}
        onKeyDown={(e) => { if (e.key === 'Enter' && typing != null && onType) { onType(typing); setTyping(null) } if (e.key === 'ArrowDown') onClick() }} />
    </div>
  )
}

export interface DatePickerProps {
  value: ISODate | null
  onChange: (v: ISODate) => void
  min?: ISODate
  max?: ISODate
  limitNote?: string
  label?: string
  placeholder?: string
  id?: string
  invalid?: boolean
  'aria-describedby'?: string
}

export function DatePicker({ value, onChange, min, max, limitNote, label = 'Date', placeholder = 'Choose a date', id, invalid, 'aria-describedby': d }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(() => (value ? fromISO(value) : new Date()))
  const anchor = useRef<HTMLDivElement>(null)
  const pop = useRef<HTMLDivElement>(null)
  const phone = useIsPhone()
  const style = usePopover(anchor, open && !phone, { width: 340, maxHeight: 460 })
  const close = useCallback(() => setOpen(false), [])
  useOutside([anchor, pop], open && !phone, close)
  const ok = (s: ISODate) => (!min || s >= min) && (!max || s <= max)
  const pick = (s: ISODate) => { onChange(s); close() }
  const body = <Month cell={44} month={month} setMonth={setMonth} isStart={(s) => s === value} isEnd={(s) => s === value} inRange={() => false} onPick={pick} min={min} max={max} limitNote={limitNote} />
  return (
    <>
      <FieldButton btnRef={anchor} id={id} invalid={invalid} describedBy={d} open={open} onClick={() => setOpen(!open)} text={value ? formatDate(value) : placeholder} empty={!value}
        onType={(t) => { const s = parseTypedDate(t); if (s && ok(s)) { onChange(s); setMonth(fromISO(s)) } }} />
      {open && !phone && createPortal(<div ref={pop} className="bp-pop" style={{ ...style, padding: '14px 16px' }} role="dialog" aria-label={label}>{body}</div>, document.body)}
      {phone && <Sheet open={open} title={label} onClose={close}><div style={{ padding: '0 14px 16px', display: 'flex', justifyContent: 'center' }}>{body}</div></Sheet>}
    </>
  )
}

export interface DateRangePickerProps {
  value: [ISODate, ISODate] | null
  onChange: (v: [ISODate, ISODate]) => void
  presets?: PresetKey[] | false
  min?: ISODate
  max?: ISODate
  limitNote?: string
  label?: string
  id?: string
  invalid?: boolean
  'aria-describedby'?: string
}

const DEFAULT_PRESETS: PresetKey[] = ['today', 'yesterday', 'last7', 'thisMonth', 'lastMonth']

export function DateRangePicker({ value, onChange, presets = DEFAULT_PRESETS, min, max, limitNote, label = 'Period', id, invalid, 'aria-describedby': d }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<[ISODate | null, ISODate | null]>(value ?? [null, null])
  const [month, setMonth] = useState(() => (value ? fromISO(value[0]) : new Date()))
  const anchor = useRef<HTMLDivElement>(null)
  const pop = useRef<HTMLDivElement>(null)
  const phone = useIsPhone()
  const style = usePopover(anchor, open && !phone, { width: presets ? 540 : 360, maxHeight: 520 })
  const close = useCallback(() => setOpen(false), [])
  useOutside([anchor, pop], open && !phone, close)
  const presetId = useId()
  const [a, b] = draft
  const activePreset = useMemo(() => (presets || []).find((k) => { const r = presetRange(k); return r[0] === a && r[1] === b }), [presets, a, b])
  const pickDay = (s: ISODate) => (!a || b ? setDraft([s, null]) : s < a ? setDraft([s, a]) : setDraft([a, s]))
  const apply = () => { if (a) { onChange([a, b ?? a]); close() } }
  const usePreset = (k: PresetKey) => { const r = presetRange(k); setDraft(r); setMonth(fromISO(r[0])) }
  const result = a ? formatRange(a, b ?? a) : 'Choose dates'
  const cal = <Month cell={phone ? 44 : 44} month={month} setMonth={setMonth} isStart={(s) => s === a} isEnd={(s) => s === (b ?? a)} inRange={(s) => !!a && !!b && s > a && s < b} onPick={pickDay} min={min} max={max} limitNote={limitNote} />
  return (
    <>
      <FieldButton btnRef={anchor} id={id} invalid={invalid} describedBy={d} open={open} onClick={() => { setDraft(value ?? [null, null]); setOpen(!open) }} text={value ? formatRange(value[0], value[1]) : 'Choose dates'} empty={!value} />
      {open && !phone && createPortal(
        <div ref={pop} className="bp-pop" style={{ ...style, display: 'flex' }} role="dialog" aria-label={label}>
          {presets && (
            <div role="listbox" aria-labelledby={presetId} style={{ width: 170, padding: 10, borderRight: '1px solid var(--c-border)', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span id={presetId} hidden>Quick ranges</span>
              {presets.map((k) => <button key={k} type="button" role="option" aria-selected={activePreset === k} className="bp-opt" style={{ border: 0, borderRadius: 10, background: activePreset === k ? 'var(--c-selected)' : 'transparent', fontWeight: activePreset === k ? 800 : 600, fontSize: 15 }} onClick={() => usePreset(k)}>{PRESET_LABEL[k]}</button>)}
            </div>
          )}
          <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cal}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', borderTop: '1px solid var(--c-border)', paddingTop: 10 }}>
              <span className="bp-help" style={{ flex: 1 }}>{result}</span>
              <Button variant="tertiary" onClick={close}>Cancel</Button>
              <Button variant="secondary" disabled={!a} onClick={apply}>Apply</Button>
            </div>
          </div>
        </div>,
        document.body,
      )}
      {phone && (
        <Sheet open={open} title={label} onClose={close} footer={<Button variant="primary" size="lg" fullWidth disabled={!a} onClick={apply}>{a ? `Show ${formatRange(a, b ?? a).replace(/ \d{4}$/, '')}` : 'Choose dates'}</Button>}>
          {presets && <div className="bp-chips" style={{ padding: '0 16px 10px' }}>{presets.map((k) => <button key={k} type="button" className="bp-qv" aria-pressed={activePreset === k} onClick={() => usePreset(k)}>{PRESET_LABEL[k]}</button>)}</div>}
          <div style={{ padding: '0 14px', display: 'flex', justifyContent: 'center' }}>{cal}</div>
        </Sheet>
      )}
    </>
  )
}

/** Time as its own field next to the date: 24-hour "14:30", slot steps (default 15 min). */
export function timeSlots(step = 15, from = '07:00', to = '20:00') {
  const toMin = (s: string) => { const [h, m] = s.split(':').map(Number); return h * 60 + m }
  const out: { value: string; label: string }[] = []
  for (let m = toMin(from); m <= toMin(to); m += step) { const v = `${pad(Math.floor(m / 60))}:${pad(m % 60)}`; out.push({ value: v, label: v }) }
  return out
}

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useIsPhone } from './Overlay'
import { Segmented } from './Form'
import { Button, IconButton } from './Guarded'

/**
 * Schedule (standards §17.18b, premium audit row 10, approved 17 Nov 2026).
 * One Day / Week / Month calendar for anything booked against time: classes, appointments, viewings.
 *   Day    timeline; empty stretches fold into one "no classes · add one" row; orange "now" line on today;
 *          a fullness ring on each block; `panel` (roster, bookings, main action) sits beside it.
 *   Week   seven aligned columns, today circled; `heat` shades each hour by how busy the place usually is
 *          (from real check-ins or arrivals); pills carry a type-colour left edge and an orange fullness line.
 *   Month  Monday-first grid; deeper tint = more booked; dots by type; fullness line; a picked day opens
 *          its agenda beside the grid ("Open day" goes to Day).
 * Colour: one colour per type, all inside navy and blue. Orange means only "how full" (and "now").
 * Real data only: no capacity → no rings or lines; no heat → no shading.
 */
export type ScheduleView = 'day' | 'week' | 'month'

export interface ScheduleItem {
  id: string
  start: Date
  minutes: number
  title: string
  /** Second line, e.g. "Coach Imani · Main Hall". */
  sub?: string
  /** Colour and filter key; must match a `types` key. */
  type: string
  /** Optional second filter (trainer, agent, stylist). */
  person?: string
  booked?: number
  capacity?: number
}

export interface ScheduleType { key: string; label: string }

export interface ScheduleProps {
  items: ScheduleItem[]
  /** Order sets the colour: navy, blue, mid, slate, steel; then repeats. */
  types: ScheduleType[]
  view: ScheduleView
  onView: (v: ScheduleView) => void
  date: Date
  onDate: (d: Date) => void
  onOpen: (id: string) => void
  selectedId?: string | null
  /** "+ Class" and every empty slot; receives the slot's start. */
  onAdd?: (start: Date) => void
  addLabel?: string
  noun?: { one: string; many: string }
  /** heat[weekday Mon=0][hour 0-23], 0..1. Shades the week. */
  heat?: number[][]
  heatLabel?: string
  /** Day view side panel (roster or bookings for `selectedId`). */
  panel?: ReactNode
  /** First and last hour shown when nothing is booked outside them. */
  openHour?: number
  closeHour?: number
}

const TYPE_COLORS = [
  'var(--c-navy)',
  'var(--c-signal)',
  'color-mix(in srgb, var(--c-navy) 55%, var(--c-signal))',
  'color-mix(in srgb, var(--c-navy) 70%, var(--c-muted))',
  'color-mix(in srgb, var(--c-signal) 75%, var(--c-muted))',
]
const ORANGE = 'var(--c-action)'
const DAY = 86_400_000

const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x }
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
const mondayOf = (d: Date) => addDays(startOfDay(d), -((d.getDay() + 6) % 7))
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()
const minOfDay = (d: Date) => d.getHours() * 60 + d.getMinutes()
const at = (day: Date, min: number) => { const x = startOfDay(day); x.setMinutes(min); return x }
const clock = (d: Date) => `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
const hourLabel = (h: number) => `${h % 12 || 12} ${h < 12 || h === 24 ? 'am' : 'pm'}`
const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => d.toLocaleDateString('en-GB', o)
const fillOf = (i: ScheduleItem) => (i.capacity ? Math.min(1, (i.booked ?? 0) / i.capacity) : null)

/** The view a person last used, kept in this browser. Pass a key that includes the signed-in user. */
export function useScheduleView(key: string, fallback: ScheduleView = 'week'): [ScheduleView, (v: ScheduleView) => void] {
  const k = `bp-schedule-view:${key}`
  const [v, setV] = useState<ScheduleView>(() => {
    try { const s = localStorage.getItem(k); return s === 'day' || s === 'week' || s === 'month' ? s : fallback } catch { return fallback }
  })
  return [v, (n) => { setV(n); try { localStorage.setItem(k, n) } catch { /* private mode */ } }]
}

function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60_000); return () => clearInterval(t) }, [])
  return now
}

/** Side-by-side lanes for items that overlap in time. */
function lanes(list: ScheduleItem[]) {
  const sorted = [...list].sort((a, b) => a.start.getTime() - b.start.getTime())
  const out = new Map<string, { lane: number; of: number }>()
  let cluster: ScheduleItem[] = [], ends: number[] = [], clusterEnd = -1
  const flush = () => { cluster.forEach((i) => { out.get(i.id)!.of = ends.length }); cluster = []; ends = [] }
  for (const i of sorted) {
    const s = i.start.getTime(), e = s + i.minutes * 60_000
    if (s >= clusterEnd) flush()
    let lane = ends.findIndex((x) => x <= s)
    if (lane < 0) { lane = ends.length; ends.push(e) } else ends[lane] = e
    out.set(i.id, { lane, of: 1 }); cluster.push(i); clusterEnd = Math.max(clusterEnd, e)
  }
  flush()
  return out
}

function Ring({ fill, size = 34 }: { fill: number; size?: number }) {
  const r = size / 2 - 3, c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" style={{ flex: 'none' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.28)" strokeWidth={3} />
      {fill > 0 && <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={ORANGE} strokeWidth={3} strokeLinecap="round"
        strokeDasharray={`${c * fill} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />}
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fill="#fff" style={{ font: '800 9.5px Urbanist, sans-serif' }}>{Math.round(fill * 100)}%</text>
    </svg>
  )
}

const FillLine = ({ fill, track = 'var(--c-sunken)' }: { fill: number; track?: string }) => (
  <span aria-hidden="true" style={{ display: 'block', height: 3, borderRadius: 2, background: track, overflow: 'hidden', flex: 'none' }}>
    <span style={{ display: 'block', height: '100%', width: `${Math.round(fill * 100)}%`, background: ORANGE }} />
  </span>
)

const Swatch = ({ color, round }: { color: string; round?: boolean }) => (
  <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: round ? 999 : 3, background: color, flex: 'none' }} />
)

export function Schedule(p: ScheduleProps) {
  const { items, types, view, onView, date, onDate, onAdd, addLabel = 'Add', noun = { one: 'booking', many: 'bookings' } } = p
  const phone = useIsPhone()
  const now = useNow()
  const [typeOn, setTypeOn] = useState<string[]>([])
  const [personOn, setPersonOn] = useState<string[]>([])
  const color = useMemo(() => {
    const m = new Map(types.map((t, i) => [t.key, TYPE_COLORS[i % TYPE_COLORS.length]]))
    return (k: string) => m.get(k) ?? 'var(--c-muted)'
  }, [types])
  const people = useMemo(() => [...new Set(items.map((i) => i.person).filter(Boolean) as string[])].sort(), [items])
  const shown = items.filter((i) => (!typeOn.length || typeOn.includes(i.type)) && (!personOn.length || (i.person && personOn.includes(i.person))))
  const hasFill = items.some((i) => i.capacity)
  const usedTypes = types.filter((t) => items.some((i) => i.type === t.key))

  const step = (n: number) => onDate(view === 'day' ? addDays(date, n) : view === 'week' ? addDays(date, 7 * n) : new Date(date.getFullYear(), date.getMonth() + n, 1))
  const wk = mondayOf(date)
  const title = view === 'day' ? fmt(date, { weekday: 'long', day: 'numeric', month: 'long' })
    : view === 'week' ? (wk.getMonth() === addDays(wk, 6).getMonth() ? `${wk.getDate()} – ${fmt(addDays(wk, 6), { day: 'numeric', month: 'long' })}` : `${fmt(wk, { day: 'numeric', month: 'short' })} – ${fmt(addDays(wk, 6), { day: 'numeric', month: 'short' })}`)
    : fmt(date, { month: 'long', year: 'numeric' })
  const inView = view === 'day' ? sameDay(date, now) : view === 'week' ? sameDay(wk, mondayOf(now)) : date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  const open = p.openHour ?? 6
  const addAt = () => {
    const d = view === 'week' && inView ? now : view === 'week' ? wk : date
    onAdd?.(sameDay(d, now) ? at(now, Math.min(23, now.getHours() + 1) * 60) : at(d, (open + 3) * 60))
  }
  const toggle = (list: string[], set: (v: string[]) => void, k: string) => set(list.includes(k) ? list.filter((x) => x !== k) : [...list, k])

  const shared = { items: shown, color, now, onOpen: p.onOpen, onAdd, noun, selectedId: p.selectedId, openHour: open, closeHour: p.closeHour ?? 21 }

  return (
    <div className="bp-schedule" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <IconButton icon={ChevronLeft} label={`Previous ${view}`} onClick={() => step(-1)} />
        <h2 style={{ margin: 0, fontSize: phone ? 17 : 20, fontWeight: 800, minWidth: phone ? 0 : 200, textAlign: 'center' }} aria-live="polite">{title}</h2>
        <IconButton icon={ChevronRight} label={`Next ${view}`} onClick={() => step(1)} />
        {!inView && <Button variant="quiet" onClick={() => onDate(new Date())}>Today</Button>}
        <span style={{ flex: 1 }} />
        <Segmented label="Calendar view" value={view} onChange={onView} options={[{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]} />
        {onAdd && <Button variant="primary" icon={Plus} onClick={addAt}>{addLabel}</Button>}
      </div>

      {(usedTypes.length > 1 || people.length > 1) && (
        <div className="bp-quickviews" role="group" aria-label="Show" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="bp-qv" aria-pressed={!typeOn.length && !personOn.length} onClick={() => { setTypeOn([]); setPersonOn([]) }} style={{ paddingRight: 14 }}>All</button>
          {usedTypes.length > 1 && usedTypes.map((t) => (
            <button key={t.key} type="button" className="bp-qv" aria-pressed={typeOn.includes(t.key)} onClick={() => toggle(typeOn, setTypeOn, t.key)} style={{ paddingRight: 14 }}>
              <Swatch color={color(t.key)} />{t.label}
            </button>
          ))}
          {people.length > 1 && people.length <= 8 && people.map((n) => (
            <button key={n} type="button" className="bp-qv" aria-pressed={personOn.includes(n)} onClick={() => toggle(personOn, setPersonOn, n)} style={{ paddingRight: 14 }}>{n}</button>
          ))}
        </div>
      )}

      {view === 'day' && <DayView {...shared} date={date} panel={p.panel} phone={phone} />}
      {view === 'week' && (phone ? <WeekList {...shared} start={wk} /> : <WeekView {...shared} start={wk} heat={p.heat} />)}
      {view === 'month' && <MonthView {...shared} month={date} phone={phone} onPick={onDate} onDay={(d) => { onDate(d); onView('day') }} />}

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, fontWeight: 600, color: 'var(--c-muted)' }}>
        {view === 'week' && !phone && p.heat?.some((r) => r.some((v) => v > 0)) && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Swatch color="color-mix(in srgb, var(--c-navy) 14%, transparent)" />{p.heatLabel ?? 'Shading = how busy it usually is at that hour'}</span>}
        {view === 'month' && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Swatch color="color-mix(in srgb, var(--c-signal) 22%, var(--c-surface))" />Darker day = more booked</span>}
        {view === 'month' && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Swatch color="var(--c-navy)" round />Dots = {noun.many}, by type</span>}
        {hasFill && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Swatch color={ORANGE} />{view === 'day' ? 'Ring' : 'Line'} = how full</span>}
      </div>
    </div>
  )
}

interface Shared {
  items: ScheduleItem[]
  color: (k: string) => string
  now: Date
  onOpen: (id: string) => void
  onAdd?: (start: Date) => void
  noun: { one: string; many: string }
  selectedId?: string | null
  openHour: number
  closeHour: number
}

/** First and last hour to draw: the opening hours, stretched to fit anything booked outside them. */
function hourRange(list: ScheduleItem[], open: number, close: number) {
  let lo = open, hi = close
  for (const i of list) { const s = minOfDay(i.start); lo = Math.min(lo, Math.floor(s / 60)); hi = Math.max(hi, Math.min(24, Math.ceil((s + i.minutes) / 60))) }
  return [lo, hi] as const
}

type Seg = { kind: 'hour'; h: number; top: number } | { kind: 'gap'; from: number; to: number; top: number }
const HOUR_PX = 60, GAP_PX = 44

function DayView({ items, color, now, onOpen, onAdd, noun, selectedId, openHour, closeHour, date, panel, phone }: Shared & { date: Date; panel?: ReactNode; phone: boolean }) {
  const list = items.filter((i) => sameDay(i.start, date))
  const today = sameDay(date, now)
  const [lo, hi] = hourRange(list, openHour, closeHour)
  const busy = (h: number) => list.some((i) => { const s = minOfDay(i.start); return s < (h + 1) * 60 && s + i.minutes > h * 60 })
  const segs: Seg[] = []
  let top = 0, run: number[] = []
  const flushRun = () => {
    if (run.length >= 2) { segs.push({ kind: 'gap', from: run[0], to: run[run.length - 1] + 1, top }); top += GAP_PX }
    else run.forEach((h) => { segs.push({ kind: 'hour', h, top }); top += HOUR_PX })
    run = []
  }
  for (let h = lo; h < hi; h++) {
    if (busy(h) || (today && now.getHours() === h)) { flushRun(); segs.push({ kind: 'hour', h, top }); top += HOUR_PX } else run.push(h)
  }
  flushRun()
  const y = (min: number) => {
    for (const s of segs) {
      if (s.kind === 'hour' && min >= s.h * 60 && min <= (s.h + 1) * 60) return s.top + ((min - s.h * 60) / 60) * HOUR_PX
      if (s.kind === 'gap' && min >= s.from * 60 && min <= s.to * 60) return s.top + GAP_PX / 2
    }
    return min < lo * 60 ? 0 : top
  }
  const lane = lanes(list)
  const nowMin = minOfDay(now)

  const timeline = (
    <div style={{ position: 'relative', height: top, minWidth: 0 }}>
      {segs.map((s) => s.kind === 'hour' ? (
        <div key={`h${s.h}`} style={{ position: 'absolute', top: s.top, left: 0, right: 0, height: HOUR_PX }}>
          <span style={{ position: 'absolute', left: 0, top: 4, width: 52, fontSize: 13, fontWeight: 600, color: 'var(--c-muted)' }}>{hourLabel(s.h)}</span>
          <button type="button" aria-label={onAdd ? `Add a ${noun.one} at ${hourLabel(s.h)}` : undefined} disabled={!onAdd} tabIndex={onAdd ? 0 : -1}
            onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); onAdd?.(at(date, s.h * 60 + (e.clientY - r.top > r.height / 2 ? 30 : 0))) }}
            style={{ position: 'absolute', left: 60, right: 0, top: 0, bottom: 0, border: 0, borderTop: '1px solid var(--c-border)', background: 'transparent', cursor: onAdd ? 'copy' : 'default', padding: 0 }} />
        </div>
      ) : (
        <div key={`g${s.from}`} style={{ position: 'absolute', top: s.top, left: 0, right: 0, height: GAP_PX }}>
          <span aria-hidden="true" style={{ position: 'absolute', left: 4, top: 12, fontSize: 15, fontWeight: 800, color: 'var(--c-muted)' }}>⋮</span>
          <div style={{ position: 'absolute', left: 60, right: 0, top: 4, bottom: 4, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 4, padding: '0 12px', fontSize: 13, fontWeight: 600, color: 'var(--c-muted)',
            background: 'repeating-linear-gradient(135deg, var(--c-sunken) 0 8px, transparent 8px 16px)' }}>
            {hourLabel(s.from)} – {hourLabel(s.to)} · no {noun.many}
            {onAdd && <>{' · '}<button type="button" onClick={() => onAdd(at(date, s.from * 60))} style={{ border: 0, background: 'none', padding: '8px 2px', font: 'inherit', fontWeight: 800, color: 'var(--c-signal-text)', textDecoration: 'underline', cursor: 'pointer' }}>add one</button></>}
          </div>
        </div>
      ))}
      {list.map((i) => {
        const s = minOfDay(i.start), t = y(s) + 2, h = Math.max(46, y(s + i.minutes) - y(s) - 4)
        const { lane: l, of } = lane.get(i.id)!
        const f = fillOf(i)
        return (
          <button key={i.id} type="button" onClick={() => onOpen(i.id)} aria-pressed={selectedId === i.id}
            aria-label={`${i.title}, ${clock(i.start)}${i.sub ? `, ${i.sub}` : ''}${i.capacity ? `, ${i.booked ?? 0} of ${i.capacity} booked` : ''}`}
            style={{ position: 'absolute', top: t, height: h, left: `calc(60px + (100% - 60px) * ${l / of})`, width: `calc((100% - 60px) / ${of} - 4px)`,
              borderRadius: 12, border: 0, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', cursor: 'pointer', color: '#fff', background: color(i.type), overflow: 'hidden', zIndex: 1,
              outline: selectedId === i.id ? '3px solid color-mix(in srgb, var(--c-signal) 55%, transparent)' : undefined, outlineOffset: 2, boxShadow: '0 1px 2px rgba(7,27,60,.12)' }}>
            {f !== null && <Ring fill={f} />}
            <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ fontSize: 15, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i.title} · {clock(i.start)}</span>
              {i.sub && <span style={{ fontSize: 13, fontWeight: 600, opacity: .9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i.sub}</span>}
            </span>
          </button>
        )
      })}
      {today && nowMin >= lo * 60 && nowMin <= hi * 60 && (
        <span role="img" aria-label={`Now, ${clock(now)}`} style={{ position: 'absolute', left: 54, right: 0, top: y(nowMin), height: 2, background: ORANGE, zIndex: 2, pointerEvents: 'none' }}>
          <span style={{ position: 'absolute', left: -4, top: -4, width: 10, height: 10, borderRadius: 99, background: ORANGE }} />
        </span>
      )}
    </div>
  )
  if (!panel) return timeline
  return (
    <div style={{ display: 'grid', gridTemplateColumns: phone ? 'minmax(0,1fr)' : 'minmax(0,1fr) 320px', gap: 16, alignItems: 'start' }}>
      {timeline}
      <aside style={{ border: '1px solid var(--c-border)', borderRadius: 16, padding: 16, background: 'var(--c-surface)', position: phone ? undefined : 'sticky', top: 16 }}>{panel}</aside>
    </div>
  )
}

const WEEK_PX = 44

function WeekView({ items, color, now, onOpen, onAdd, noun, selectedId, openHour, closeHour, start, heat }: Shared & { start: Date; heat?: number[][] }) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))
  const end = addDays(start, 7)
  const list = items.filter((i) => i.start >= start && i.start < end)
  const [lo, hi] = hourRange(list, openHour, closeHour)
  const hours = Array.from({ length: hi - lo }, (_, i) => lo + i)
  const cols = '56px repeat(7, minmax(0, 1fr))'
  const nowMin = minOfDay(now)
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: cols, paddingBottom: 8 }}>
        <span />
        {days.map((d) => {
          const today = sameDay(d, now)
          return (
            <div key={d.toISOString()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--c-muted)' }}>{fmt(d, { weekday: 'short' })}</span>
              <span aria-current={today ? 'date' : undefined} style={{ width: 34, height: 34, borderRadius: 99, display: 'grid', placeItems: 'center', fontSize: 18, fontWeight: 800,
                background: today ? 'var(--c-navy)' : undefined, color: today ? '#fff' : 'var(--c-ink)' }}>{d.getDate()}</span>
            </div>
          )
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: cols }}>
        <div>
          {hours.map((h) => <span key={h} style={{ display: 'block', height: WEEK_PX, fontSize: 12.5, fontWeight: 600, color: 'var(--c-muted)', paddingTop: 2 }}>{hourLabel(h)}</span>)}
        </div>
        {days.map((d, di) => {
          const dayList = list.filter((i) => sameDay(i.start, d))
          const lane = lanes(dayList)
          return (
            <div key={d.toISOString()} style={{ position: 'relative', borderLeft: '1px solid var(--c-border)' }}>
              {hours.map((h) => {
                const v = heat?.[di]?.[h] ?? 0
                return (
                  <button key={h} type="button" disabled={!onAdd} tabIndex={-1} aria-hidden="true" onClick={() => onAdd?.(at(d, h * 60))}
                    style={{ display: 'block', width: '100%', height: WEEK_PX, border: 0, borderTop: '1px solid var(--c-border)', padding: 0, cursor: onAdd ? 'copy' : 'default',
                      background: v > 0 ? `color-mix(in srgb, var(--c-navy) ${Math.round(3 + v * 15)}%, transparent)` : 'transparent' }} />
                )
              })}
              {dayList.map((i) => {
                const s = minOfDay(i.start), f = fillOf(i)
                const { lane: l, of } = lane.get(i.id)!
                return (
                  <button key={i.id} type="button" onClick={() => onOpen(i.id)} aria-pressed={selectedId === i.id}
                    aria-label={`${i.title}, ${fmt(d, { weekday: 'long' })} ${clock(i.start)}${i.capacity ? `, ${i.booked ?? 0} of ${i.capacity} booked` : ''}`}
                    style={{ position: 'absolute', top: ((s - lo * 60) / 60) * WEEK_PX + 3, height: Math.max(34, (i.minutes / 60) * WEEK_PX - 6),
                      left: `calc(4px + (100% - 8px) * ${l / of})`, width: `calc((100% - 8px) / ${of} - 2px)`,
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 2, padding: '5px 6px 5px 9px', textAlign: 'left', cursor: 'pointer',
                      borderRadius: 8, border: '1px solid var(--c-border)', background: 'var(--c-surface)', color: 'var(--c-ink)', overflow: 'hidden',
                      boxShadow: `inset 3px 0 0 ${color(i.type)}, 0 1px 2px rgba(7,27,60,.08)`, outline: selectedId === i.id ? '2px solid var(--c-signal)' : undefined }}>
                    <span style={{ fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i.title} {clock(i.start)}</span>
                    {f !== null && <FillLine fill={f} />}
                  </button>
                )
              })}
              {sameDay(d, now) && nowMin >= lo * 60 && nowMin <= hi * 60 && (
                <span aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: ((nowMin - lo * 60) / 60) * WEEK_PX, height: 2, background: ORANGE, zIndex: 2, pointerEvents: 'none' }} />
              )}
            </div>
          )
        })}
      </div>
      {!list.length && <p style={{ margin: '10px 0 0', fontSize: 14, fontWeight: 600, color: 'var(--c-muted)' }}>No {noun.many} this week.{onAdd ? ' Click an hour to add one.' : ''}</p>}
    </div>
  )
}

/** A day's items as a list: the month's side panel and the week on a phone. */
function DayAgenda({ list, color, onOpen, selectedId }: { list: ScheduleItem[]; color: (k: string) => string; onOpen: (id: string) => void; selectedId?: string | null }) {
  return (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {[...list].sort((a, b) => a.start.getTime() - b.start.getTime()).map((i) => (
        <li key={i.id}>
          <button type="button" onClick={() => onOpen(i.id)} aria-pressed={selectedId === i.id}
            style={{ width: '100%', minHeight: 48, display: 'flex', gap: 12, alignItems: 'stretch', border: 0, background: selectedId === i.id ? 'var(--c-selected)' : 'transparent', borderRadius: 10, padding: '6px 8px', textAlign: 'left', cursor: 'pointer', color: 'var(--c-ink)' }}>
            <span style={{ width: 44, flex: 'none', fontSize: 14, fontWeight: 800, fontVariantNumeric: 'tabular-nums', paddingTop: 2 }}>{clock(i.start)}</span>
            <span style={{ width: 3, borderRadius: 2, background: color(i.type), flex: 'none' }} />
            <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0, gap: 1 }}>
              <span style={{ fontSize: 15, fontWeight: 800 }}>{i.title}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-muted)' }}>{[i.sub, i.capacity ? `${i.booked ?? 0} of ${i.capacity}` : ''].filter(Boolean).join(' · ')}</span>
            </span>
          </button>
        </li>
      ))}
    </ol>
  )
}

function WeekList({ items, color, now, onOpen, noun, selectedId, start }: Shared & { start: Date }) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {days.map((d) => {
        const list = items.filter((i) => sameDay(i.start, d))
        return (
          <section key={d.toISOString()}>
            <h3 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 800, color: sameDay(d, now) ? 'var(--c-signal-text)' : 'var(--c-muted)' }}>{fmt(d, { weekday: 'long', day: 'numeric', month: 'short' })}</h3>
            {list.length ? <DayAgenda list={list} color={color} onOpen={onOpen} selectedId={selectedId} /> : <p style={{ margin: 0, fontSize: 13, color: 'var(--c-muted)' }}>No {noun.many}</p>}
          </section>
        )
      })}
    </div>
  )
}

function MonthView({ items, color, now, onOpen, onAdd, noun, selectedId, month, phone, onPick, onDay }: Shared & { month: Date; phone: boolean; onPick: (d: Date) => void; onDay: (d: Date) => void }) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0)
  const gridStart = mondayOf(first)
  const weeks = Math.ceil((((first.getDay() + 6) % 7) + last.getDate()) / 7)
  const cells = Array.from({ length: weeks * 7 }, (_, i) => addDays(gridStart, i))
  const byDay = (d: Date) => items.filter((i) => sameDay(i.start, d))
  const load = (list: ScheduleItem[]) => (list.some((i) => i.capacity) ? list.reduce((n, i) => n + (i.booked ?? 0), 0) : list.length)
  const max = Math.max(1, ...cells.filter((d) => d.getMonth() === month.getMonth()).map((d) => load(byDay(d))))
  const dots = phone ? 3 : 5
  const pickedList = byDay(month)
  const booked = pickedList.reduce((n, i) => n + (i.booked ?? 0), 0), cap = pickedList.reduce((n, i) => n + (i.capacity ?? 0), 0)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: phone ? 'minmax(0,1fr)' : 'minmax(0,1fr) 300px', gap: 16, alignItems: 'start' }}>
      <div role="grid" aria-label={fmt(month, { month: 'long', year: 'numeric' })} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: phone ? 3 : 6 }}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((w) => <span key={w} role="columnheader" style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--c-muted)', padding: '0 4px' }}>{phone ? w[0] : w}</span>)}
        {cells.map((d) => {
          if (d.getMonth() !== month.getMonth()) return <span key={d.toISOString()} aria-hidden="true" style={{ padding: 8, fontSize: 15, fontWeight: 700, color: 'var(--c-border)' }}>{d.getDate()}</span>
          const list = byDay(d), l = load(list)
          const c = list.reduce((n, i) => n + (i.capacity ?? 0), 0), b = list.reduce((n, i) => n + (i.booked ?? 0), 0)
          const today = sameDay(d, now), sel = sameDay(d, month)
          return (
            <button key={d.toISOString()} type="button" role="gridcell" aria-selected={sel} onClick={() => onPick(d)} onDoubleClick={() => onDay(d)}
              aria-label={`${fmt(d, { weekday: 'long', day: 'numeric', month: 'long' })}, ${list.length} ${list.length === 1 ? noun.one : noun.many}${c ? `, ${b} of ${c} booked` : ''}`}
              style={{ minHeight: phone ? 56 : 88, padding: phone ? 4 : 8, borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 4, textAlign: 'left', cursor: 'pointer', color: 'var(--c-ink)',
                border: sel ? '2px solid var(--c-navy)' : '1px solid var(--c-border)',
                background: l ? `color-mix(in srgb, var(--c-signal) ${Math.round(5 + 20 * (l / max))}%, var(--c-surface))` : 'var(--c-surface)' }}>
              <span style={{ width: 26, height: 26, borderRadius: 99, display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 800, marginLeft: -3, marginTop: -3,
                background: today ? 'var(--c-navy)' : undefined, color: today ? '#fff' : undefined }}>{d.getDate()}</span>
              <span style={{ flex: 1 }} />
              {list.length > 0 && (
                <span aria-hidden="true" style={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                  {list.slice(0, dots).map((i) => <span key={i.id} style={{ width: 7, height: 7, borderRadius: 99, background: color(i.type) }} />)}
                  {list.length > dots && <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-muted)' }}>+{list.length - dots}</span>}
                </span>
              )}
              {c > 0 && <FillLine fill={Math.min(1, b / c)} track="color-mix(in srgb, var(--c-navy) 10%, transparent)" />}
            </button>
          )
        })}
      </div>
      <aside style={{ border: '1px solid var(--c-border)', borderRadius: 16, padding: 16, background: 'var(--c-surface)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>{fmt(month, { weekday: 'long', day: 'numeric', month: 'short' })}</h3>
          <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 600, color: 'var(--c-muted)' }}>
            {pickedList.length ? `${pickedList.length} ${pickedList.length === 1 ? noun.one : noun.many}${cap ? ` · ${booked} of ${cap} booked` : ''}` : `No ${noun.many} on this day`}
          </p>
        </div>
        {pickedList.length > 0 && <DayAgenda list={pickedList} color={color} onOpen={onOpen} selectedId={selectedId} />}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {pickedList.length > 0 && <Button onClick={() => onDay(month)}>Open day</Button>}
          {onAdd && <Button variant={pickedList.length ? 'quiet' : 'secondary'} icon={Plus} onClick={() => onAdd(at(month, sameDay(month, now) ? Math.min(23, now.getHours() + 1) * 60 : 9 * 60))}>Add one</Button>}
        </div>
      </aside>
    </div>
  )
}

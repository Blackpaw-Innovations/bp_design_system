import { useMemo } from 'react'
import { useIsPhone } from './Overlay'

/**
 * Calendar (standards §17.18, round 2 W4, Vivid Core colour jobs).
 *   live       navy: the one state happening now (in the bay, in the chair)
 *   booked     Signal Blue tint + edge
 *   ready      pos tint + edge
 *   pending    warn tint + edge (deposit not paid, not confirmed)
 *   cancelled  draft tint + edge, struck through, stays visible
 *   attention  orange dot on the block: needs you (customer waiting, promised time passed)
 * Resources (bays, chairs, staff) are columns, never colours.
 *
 * <ResourceDay> desktop Day view by resource. Phone renders <Agenda> for the same bookings.
 * Week = <ResourceDay> with days as resources. Month shows counts per day, not blocks.
 * Hour labels and blocks share one scale (`hourPx`), so they always line up. Click an empty
 * slot → onSlot(resource, "HH:MM") opens the SlideOver with the time filled in.
 */
export type BookingTone = 'live' | 'booked' | 'ready' | 'pending' | 'cancelled'

export interface Booking {
  id: string
  resource: string
  /** "HH:MM", 24-hour. */
  start: string
  end: string
  title: string
  /** Second line: plate, phone or service. */
  sub?: string
  tone: BookingTone
  attention?: boolean
}

export interface Resource { key: string; label: string; sub?: string }

const toMin = (s: string) => { const [h, m] = s.split(':').map(Number); return h * 60 + m }
const hm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`

export interface ResourceDayProps {
  resources: Resource[]
  bookings: Booking[]
  open?: string
  close?: string
  hourPx?: number
  /** Slot length for clicks, minutes. */
  slot?: number
  onOpen: (id: string) => void
  onSlot?: (resource: string, start: string) => void
  /** "now" line (crit, 2 px), only on today. */
  now?: string
}

export function ResourceDay({ resources, bookings, open = '08:00', close = '18:00', hourPx = 52, slot = 30, onOpen, onSlot, now }: ResourceDayProps) {
  const phone = useIsPhone()
  const o = toMin(open), c = toMin(close)
  const h = ((c - o) / 60) * hourPx
  const y = (t: string) => ((toMin(t) - o) / 60) * hourPx
  const hours = useMemo(() => { const a: number[] = []; for (let m = o; m <= c; m += 60) a.push(m); return a }, [o, c])
  if (phone) return <Agenda bookings={bookings} resources={resources} onOpen={onOpen} />
  return (
    <div className="bp-cal" style={{ gridTemplateColumns: `64px repeat(${resources.length}, minmax(0, 1fr))` }}>
      <span style={{ borderBottom: '1px solid var(--c-border)' }} />
      {resources.map((r) => <div key={r.key} style={{ padding: '10px 12px', borderLeft: '1px solid var(--c-border)', borderBottom: '1px solid var(--c-border)', display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: 16, fontWeight: 800 }}>{r.label}</span>{r.sub && <span className="bp-help" style={{ fontSize: 13 }}>{r.sub}</span>}</div>)}
      <div style={{ position: 'relative', height: h }} aria-hidden="true">{hours.slice(1).map((m) => <span key={m} className="bp-cal-hour" style={{ top: y(hm(m)) }}>{hm(m)}</span>)}</div>
      {resources.map((r) => (
        <div key={r.key} className="bp-cal-col" style={{ height: h }}
          onClick={(e) => { if (!onSlot || e.target !== e.currentTarget) return; const rect = e.currentTarget.getBoundingClientRect(); const mins = o + Math.floor(((e.clientY - rect.top) / hourPx) * 60 / slot) * slot; onSlot(r.key, hm(mins)) }}>
          {hours.slice(1, -1).map((m) => <span key={m} className="bp-cal-line" style={{ top: y(hm(m)) }} aria-hidden="true" />)}
          {bookings.filter((b) => b.resource === r.key).map((b) => {
            const top = y(b.start) + 2, height = y(b.end) - y(b.start) - 4
            return (
              <button key={b.id} type="button" className="bp-block" data-tone={b.tone} style={{ top, height }} onClick={() => onOpen(b.id)} aria-label={`${b.title}, ${b.start} to ${b.end}${b.attention ? ', needs you' : ''}`}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span className="bp-block-title" style={{ flex: 1 }}>{b.title}</span>{b.attention && <span className="bp-attn-dot" style={{ width: 9, height: 9 }} />}</span>
                {height >= 40 && <span className="bp-block-time">{b.start}–{b.end}{b.sub ? ` · ${b.sub}` : ''}</span>}
              </button>
            )
          })}
          {now && toMin(now) >= o && toMin(now) <= c && <span aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: y(now), height: 2, background: 'var(--v-crit)' }} />}
        </div>
      ))}
    </div>
  )
}

/** Phone day view: a time-ordered list. Also used for "Today" on any screen width. */
export function Agenda({ bookings, resources, onOpen }: { bookings: Booking[]; resources: Resource[]; onOpen: (id: string) => void }) {
  const name = (k: string) => resources.find((r) => r.key === k)?.label ?? k
  const list = [...bookings].sort((a, b) => toMin(a.start) - toMin(b.start))
  if (!list.length) return <p className="bp-help" style={{ padding: 16, margin: 0 }}>Nothing booked for this day.</p>
  return (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {list.map((b) => (
        <li key={b.id} style={{ display: 'flex', gap: 10 }}>
          <span style={{ width: 48, flex: 'none', paddingTop: 10, fontSize: 14, fontWeight: 700, color: 'var(--c-muted)', fontVariantNumeric: 'tabular-nums' }}>{b.start}</span>
          <button type="button" className="bp-block" data-tone={b.tone} style={{ position: 'static', flex: 1, padding: '10px 12px', borderRadius: 12 }} onClick={() => onOpen(b.id)}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span className="bp-block-title" style={{ flex: 1, fontSize: 15 }}>{b.title}</span>{b.attention && <span className="bp-attn-dot" style={{ width: 9, height: 9 }} />}</span>
            <span className="bp-block-time">{name(b.resource)}{b.sub ? ` · ${b.sub}` : ''} · until {b.end}</span>
          </button>
        </li>
      ))}
    </ol>
  )
}

/** Month cell content: counts only, plus the attention count. */
export function MonthCell({ day, count, attention, today }: { day: number; count?: number; attention?: number; today?: boolean }) {
  return (
    <div style={{ minHeight: 78, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4, background: today ? 'var(--c-selected)' : undefined }}>
      <span style={{ fontSize: 15, fontWeight: today ? 900 : 700, color: today ? 'var(--c-signal-text)' : 'var(--c-ink)' }}>{day}</span>
      {count ? <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-signal-text)' }}>{count} {count === 1 ? 'booking' : 'bookings'}</span> : null}
      {attention ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700 }}><span className="bp-attn-dot" style={{ width: 7, height: 7, boxShadow: 'none' }} />{attention} {attention === 1 ? 'needs' : 'need'} you</span> : null}
    </div>
  )
}

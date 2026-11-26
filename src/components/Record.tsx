import { useId, useState, type ReactNode } from 'react'
import { Check, Clock } from 'lucide-react'
import { cn, type IconComponent } from '../lib/utils'
import { dayWords, formatDayTime, groupByDay } from '../lib/patterns'
import { Button, StatGroup, type StatItem } from './Guarded'
import { Facts, type FactItem } from './Premium'

/**
 * The record panel (v1.22): one anatomy for every vertical's record — a job, an order, a member, a booking.
 *
 *   header    what this is (eyebrow: reference · context; title: who · what), status chips beside it
 *   next      the one thing to do now (DecisionPanel), from the record's state
 *   journey   where it is on its way: done, now, still to come (Journey)
 *   figures   up to 3 numbers that matter, money first (compact StatGroup)
 *   sections  pill-nav sections (Overview, Money, …) with flat rows inside — never cards inside cards
 *
 * The vertical supplies only its steps, figures and next-step rule; the shape is the same everywhere.
 */

export interface JourneyStep { key: string; label: string }

/**
 * Where a record is on its way. Steps before `current` are done, `current` is now; `current={null}` = all done.
 * Pass `done` when steps can finish out of order (goods received before the customer has paid): each listed step shows
 * done on its own, and `current` is still the one to act on.
 */
export function Journey({ steps, current, done, label = 'Progress', className }: { steps: JourneyStep[]; current: string | null; done?: string[]; label?: string; className?: string }) {
  const at = current === null ? steps.length : Math.max(0, steps.findIndex((s) => s.key === current))
  const said = at >= steps.length ? `All ${steps.length} steps done` : `Step ${at + 1} of ${steps.length}: ${steps[at]?.label ?? ''}`
  return (
    <ol className={cn('bp-journey', className)} aria-label={`${label}. ${said}`}>
      {steps.map((step, i) => {
        const state = i === at ? 'now' : (done ? done.includes(step.key) : i < at) ? 'done' : 'todo'
        return (
          <li key={step.key} data-state={state} aria-current={state === 'now' ? 'step' : undefined}>
            <span className="dot" aria-hidden="true">{state === 'done' && <Check size={12} strokeWidth={3.4} />}</span>
            <span className="name">{step.label}</span>
          </li>
        )
      })}
    </ol>
  )
}

export interface RecordSection { key: string; label: string; content: ReactNode; hidden?: boolean }

export interface RecordPanelProps {
  /** Reference and context, one line: "REQ/2026/00076 · Toyota Fielder 2016". */
  eyebrow?: ReactNode
  /** Who · what: "Brian Otieno · Front brake pads". */
  title: string
  /** Status chips beside the title (StatusChip). */
  chips?: ReactNode
  /** The next step: a DecisionPanel. */
  next?: ReactNode
  /** A Journey. */
  journey?: ReactNode
  /** Up to 3 figures; money first. */
  figures?: StatItem[]
  sections: RecordSection[]
  defaultSection?: string
  className?: string
}

export function RecordPanel({ eyebrow, title, chips, next, journey, figures, sections, defaultSection, className }: RecordPanelProps) {
  const shown = sections.filter((s) => !s.hidden)
  const [picked, setPicked] = useState(defaultSection ?? shown[0]?.key)
  const active = shown.find((s) => s.key === picked) ?? shown[0]
  const id = useId()
  return (
    <div className={cn('bp-record', className)}>
      <header className="bp-record-head">
        <div className="min">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2>{title}</h2>
        </div>
        {chips && <div className="chips">{chips}</div>}
      </header>
      {next}
      {journey}
      {figures && figures.length > 0 && <StatGroup items={figures.slice(0, 3)} surface="plain" label="Key figures" className="bp-record-figures" />}
      {shown.length > 1 && (
        <div className="bp-record-tabs" role="tablist" aria-label="Sections">
          {shown.map((s) => (
            <button key={s.key} type="button" role="tab" id={`${id}-${s.key}`} aria-selected={s.key === active?.key} aria-controls={`${id}-panel`} className="bp-qv" aria-pressed={s.key === active?.key} onClick={() => setPicked(s.key)}>{s.label}</button>
          ))}
        </div>
      )}
      {active && <div className="bp-record-body" role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-${active.key}`}>{active.content}</div>}
    </div>
  )
}

/** A flat titled group inside a record section (no border, no card): a heading over rows. */
export function RecordGroup({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="bp-record-group" aria-label={title}>
      <div className="bp-record-group-head"><h3>{title}</h3>{action}</div>
      {children}
    </section>
  )
}

/** One flat row: what it is, a muted line under it, then the figure and an action at the end. */
export function RecordRow({ title, sub, figure, action }: { title: ReactNode; sub?: ReactNode; figure?: ReactNode; action?: ReactNode }) {
  return (
    <div className="bp-record-row">
      <div className="min"><p className="title">{title}</p>{sub && <p className="sub">{sub}</p>}</div>
      {figure && <div className="figure">{figure}</div>}
      {action && <div className="action">{action}</div>}
    </div>
  )
}

/* ── Round 3 record patterns (v1.46.0, Marvin 26 Nov 2026, Properties round 3 C1–C5) ─────────────────────────── */

/**
 * A record page's top card (C1). The subject is the heading: the problem in the user's words ("Shower runs cold after a
 * few minutes"), never a label such as "The job". Pills sit above it (stage, flag, urgency, tags); the key facts follow as
 * a labelled grid. The record's reference goes in the facts or the bar, not in the heading.
 */
export function RecordHead({ title, pills, facts, children, className }: { title: string; pills?: ReactNode; facts?: FactItem[]; children?: ReactNode; className?: string }) {
  return (
    <article className={cn('bp-rcard bp-rhead', className)}>
      {pills && <div className="bp-pills">{pills}</div>}
      <h2>{title}</h2>
      {facts && facts.length > 0 && <Facts layout="grid" items={facts} />}
      {children}
    </article>
  )
}

/** Who said it, for a Quote or a timeline entry. `kind` styles the initials: provider (filled), customer (blue ring), staff (outline), system (sunken). */
export type ActorKind = 'provider' | 'customer' | 'staff' | 'system'

function Initials({ name, kind = 'staff', flag }: { name: string; kind?: ActorKind; flag?: boolean }) {
  const w = name.trim().split(/\s+/).filter(Boolean)
  const ini = ((w[0]?.[0] ?? '') + (w[1]?.[0] ?? '')).toUpperCase() || '?'
  return <span className="bp-actor" data-kind={kind} data-flag={flag || undefined} aria-hidden="true">{ini}</span>
}

/**
 * A note is a quote (C2): what the person said, then who and when. Never a plain paragraph with the author lost in a
 * grey line. `at` is an ISO time, shown readable ("Wed 19 Nov, 13:45").
 */
export function Quote({ children, author, at, kind = 'provider' }: { children: ReactNode; author: string; at?: string; kind?: ActorKind }) {
  return (
    <blockquote className="bp-quote">
      <p>{children}</p>
      <footer><Initials name={author} kind={kind} /><span><b>{author}</b>{at && <>, <time dateTime={at}>{formatDayTime(at)}</time></>}</span></footer>
    </blockquote>
  )
}

/** "Note + facts" card (C2): a titled card, the note as a Quote, then a labelled facts grid. One card, no card inside it. */
export function NoteCard({ title, aside, note, facts, children, className }: {
  title: string
  /** A TagPill or a quiet link at the right of the title. */
  aside?: ReactNode
  note?: { text: ReactNode; author: string; at?: string; kind?: ActorKind }
  facts?: FactItem[]
  children?: ReactNode
  className?: string
}) {
  return (
    <section className={cn('bp-rcard', className)} aria-label={title}>
      <div className="bp-rcard-head"><h3>{title}</h3>{aside}</div>
      {note && <Quote author={note.author} at={note.at} kind={note.kind}>{note.text}</Quote>}
      {facts && facts.length > 0 && <Facts layout="grid" items={facts} />}
      {children}
    </section>
  )
}

export interface WhenItem {
  key?: string
  /** What the time is: "Accepted", "Visit booked", "Fix by". */
  label: string
  /** ISO time; shown readable in ink at body size. */
  at?: string | null
  /** Instead of `at`, for a range or anything the app formats ("Wed 26 Nov, 10:00 to 12:00"). */
  value?: ReactNode
  /** When neither `at` nor `value` is set: say what is missing ("Not started yet"). Never an empty value. */
  empty?: string
  /** The plain line under the value. Defaults to "Today", "Yesterday", "In 2 days" from `at`. */
  help?: ReactNode
  /** Done: a green tick in place of the icon. */
  done?: boolean
  icon?: IconComponent
}

/**
 * Readable times (C4): each time is its own row, the label, the value in ink at body size, then a plain line saying what
 * it means today. Never a faint grey timestamp. `lead` sits above the list (usually a WhoPill).
 */
export function WhenCard({ title, lead, items, className }: { title?: string; lead?: ReactNode; items: WhenItem[]; className?: string }) {
  return (
    <section className={cn('bp-rcard', className)} aria-label={title ?? 'When'}>
      {title && <div className="bp-rcard-head"><h3>{title}</h3></div>}
      {lead}
      <ul className="bp-when">
        {items.map((it, i) => {
          const Icon = it.done ? Check : it.icon ?? Clock
          const help = it.help ?? (it.at ? dayWords(it.at) : null)
          return (
            <li key={it.key ?? i}>
              <span className="ic" data-done={it.done || undefined} aria-hidden="true"><Icon size={18} /></span>
              <span className="min">
                <span className="k">{it.label}</span>
                {it.value != null ? <span className="v">{it.value}</span>
                  : it.at ? <time className="v" dateTime={it.at}>{formatDayTime(it.at)}</time>
                  : <span className="v" data-none="">{it.empty ?? 'Not yet'}</span>}
                {help && <span className="x">{help}</span>}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export interface TimelineEntry {
  id: string
  /** ISO time. Entries are sorted newest first and grouped by day here, whatever order they arrive in. */
  at: string
  /** The person (or "System"); shown first, in bold. */
  who: string
  kind?: ActorKind
  /** What they did, after their name: "reopened the request". */
  did: ReactNode
  /** The stage it moved to: a StatusChip or FlagPill. */
  stage?: ReactNode
  /** A note under the entry (the reopen reason, the fix). */
  note?: ReactNode
  /** Red marker on the initials (a reopen, a failure). */
  flag?: boolean
}

/**
 * A history as a timeline (C5): grouped by day, newest first, each entry "who did what", the clock time in ink, the stage
 * pill it moved to and an optional note. Shows `show` entries (6) and folds the rest behind "Show n earlier updates".
 */
export function Timeline({ entries, title = 'Updates', show = 6, empty = 'No updates yet.', noun = 'updates', className }: {
  entries: TimelineEntry[]; title?: string; show?: number; empty?: ReactNode; noun?: string; className?: string
}) {
  const [all, setAll] = useState(false)
  const days = groupByDay(entries)
  const total = days.reduce((n, d) => n + d.items.length, 0)
  let left = all ? total : show
  const visible = days
    .map((d) => { const items = d.items.slice(0, Math.max(0, left)); left -= d.items.length; return { ...d, items } })
    .filter((d) => d.items.length > 0)
  const hidden = all ? 0 : Math.max(0, total - show)
  return (
    <section className={cn('bp-rcard', className)} aria-label={title}>
      <div className="bp-rcard-head"><h3>{title}</h3></div>
      {total === 0 ? <p className="bp-tl-empty">{empty}</p> : (
        <ol className="bp-tl">
          {visible.map((d, di) => (
            <li key={d.key} className="bp-tl-day">
              <h4>{d.title}</h4>
              <ol>
                {d.items.map((e, i) => (
                  <li key={e.id} className="bp-tl-ev" data-last={(di === visible.length - 1 && i === d.items.length - 1) || undefined}>
                    <Initials name={e.who} kind={e.kind} flag={e.flag} />
                    <div className="body">
                      <p className="what"><b>{e.who}</b> {e.did}</p>
                      <div className="meta"><time dateTime={e.at}>{e.time}</time>{e.stage && <><span className="to">moved to</span>{e.stage}</>}</div>
                      {e.note && <div className="note">{e.note}</div>}
                    </div>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
      )}
      {hidden > 0 && <Button variant="quiet" onClick={() => setAll(true)}>{`Show ${hidden} earlier ${hidden === 1 ? noun.replace(/s$/, "") : noun}`}</Button>}
    </section>
  )
}

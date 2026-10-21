import { useId, useState, type ReactNode } from 'react'
import { Check } from 'lucide-react'
import { cn } from '../lib/utils'
import { StatGroup, type StatItem } from './Guarded'

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

/** Where a record is on its way. Steps before `current` are done, `current` is now; `current={null}` = all done. */
export function Journey({ steps, current, label = 'Progress', className }: { steps: JourneyStep[]; current: string | null; label?: string; className?: string }) {
  const at = current === null ? steps.length : Math.max(0, steps.findIndex((s) => s.key === current))
  const said = at >= steps.length ? `All ${steps.length} steps done` : `Step ${at + 1} of ${steps.length}: ${steps[at]?.label ?? ''}`
  return (
    <ol className={cn('bp-journey', className)} aria-label={`${label}. ${said}`}>
      {steps.map((step, i) => {
        const state = i < at ? 'done' : i === at ? 'now' : 'todo'
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

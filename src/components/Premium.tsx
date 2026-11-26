import type { CSSProperties, ElementType, ReactNode } from 'react'
import { cn } from '../lib/utils'
import { sameWords, useBarTitle } from '../lib/barTitle'

const dev = (import.meta as { env?: { DEV?: boolean } }).env?.DEV === true

/**
 * The premium set (2026-10-08), "quiet authority":
 *   one hero per page, space before frames, ledgers not tiles,
 *   dark means it matters (max two sealed surfaces per screen),
 *   confirmations whisper (see Toast).
 * Styles live in tokens/components.css under "PREMIUM SET".
 */

/**
 * A compact title row. Replaces tall banner heroes: the record is the hero, not the page.
 * v1.45 (D5 "1A/B", Marvin 25 Nov 2026), `kind`:
 *   list    the app's top bar names the screen and is the only title. `title` is optional: a headline sentence
 *           ("7 service requests"), never the screen's name. A title equal to the bar is dropped (BarTitleProvider).
 *   detail  the bar shows the section ("Work orders"); this heading names the record ("Flat 3A plumbing").
 * With a `kind` the app's top bar owns the <h1>, so the heading is an <h2>. Without one (a page with no app bar) it is the <h1>.
 */
export interface PageHeaderProps {
  kind?: 'list' | 'detail'
  title?: ReactNode
  /** Small trail above the title, e.g. "Portfolio / Garden Court". */
  crumbs?: ReactNode
  /** One line under the title: counts, status, as-of time. */
  meta?: ReactNode
  /** At most one primary (orange) action plus secondaries. */
  actions?: ReactNode
  className?: string
}

export function PageHeader({ kind, title, crumbs, meta, actions, className }: PageHeaderProps) {
  const bar = useBarTitle()
  const shown = typeof title === 'string' && sameWords(title, bar) ? null : title
  if (dev && kind === 'detail' && !title) console.warn('[@blackpaw/ui] PageHeader kind="detail" needs the record name as its title.')
  if (!shown && !crumbs && !meta && !actions) return null
  const H = kind ? 'h2' : 'h1'
  return (
    <header className={cn('bp-page-header', className)} data-kind={kind}>
      <div className="min-w-0">
        {crumbs && <p className="crumbs">{crumbs}</p>}
        {shown && <H>{shown}</H>}
        {meta && <p className="meta">{meta}</p>}
      </div>
      {actions && <div className="actions">{actions}</div>}
    </header>
  )
}

export type MetricNoteTone = 'neutral' | 'positive' | 'attention' | 'negative'

export interface MetricItem {
  label: ReactNode
  value: ReactNode
  /** Small unit shown before the value ("KES"). */
  unit?: ReactNode
  note?: ReactNode
  noteTone?: MetricNoteTone
}

/** Related numbers on one surface with hairlines between. Replaces rows of equal KPI tiles. */
export function MetricLedger({ items, className, label, columns }: { items: MetricItem[]; className?: string; label?: string; columns?: 1 | 2 | 3 | 4 }) {
  const cols = columns ?? Math.min(Math.max(items.length, 1), 4)
  const style = { '--ledger-cols': String(cols) } as CSSProperties
  return (
    <section className={cn('bp-ledger', className)} style={style} data-cols={cols} aria-label={label}>
      {items.map((item, index) => (
        <div key={index}>
          <p className="label">{item.label}</p>
          <p className="value">{item.unit && <small>{item.unit}</small>}{item.value}</p>
          {item.note && <p className={cn('note', item.noteTone && item.noteTone !== 'neutral' && item.noteTone)}>{item.note}</p>}
        </div>
      ))}
    </section>
  )
}

export type ProportionTone = 'navy' | 'teal' | 'orange' | 'success' | 'danger' | 'muted'

export interface ProportionSegment {
  label: string
  value: number
  tone: ProportionTone
}

/** One bar that shows the whole. Segments with value 0 stay in the legend but not the bar. */
export function MetricProportion({ label, total, segments, className }: {
  label?: ReactNode
  /** Right-aligned summary, e.g. "48 units". */
  total?: ReactNode
  segments: ProportionSegment[]
  className?: string
}) {
  const sum = segments.reduce((acc, s) => acc + Math.max(s.value, 0), 0)
  const description = segments.map((s) => `${s.value} ${s.label}`).join(', ')
  return (
    <div className={cn('bp-proportion', className)}>
      {(label || total) && (
        <div className="head"><span className="label">{label}</span>{total && <span className="total">{total}</span>}</div>
      )}
      <div className="bar" role="img" aria-label={description}>
        {sum > 0 && segments.filter((s) => s.value > 0).map((s) => (
          <span key={s.label} className={`bp-tone-${s.tone}`} style={{ width: `${(s.value / sum) * 100}%` }} />
        ))}
      </div>
      <ul className="legend">
        {segments.map((s) => (
          <li key={s.label}><i className={`bp-tone-${s.tone}`} aria-hidden="true" /><b>{s.value}</b>{s.label}</li>
        ))}
      </ul>
    </div>
  )
}

/**
 * The dark surface for what matters: identity, a secret shown once, a balance
 * due. Children may use `.figure`, `.muted` and `.code`. Max two per screen.
 */
export function SealedCard({ eyebrow, children, className, as: Tag = 'section', label }: {
  eyebrow?: ReactNode
  children: ReactNode
  className?: string
  as?: ElementType
  label?: string
}) {
  return (
    <Tag className={cn('bp-sealed', className)} aria-label={label}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      {children}
    </Tag>
  )
}

/** Side-panel groups separated by space and one hairline. Wrap a run of these in <Dock>. */
export function Dock({ children, className, label }: { children: ReactNode; className?: string; label?: string }) {
  return <aside className={cn('bp-dock', className)} aria-label={label}>{children}</aside>
}

export function DockSection({ title, children, className, headingLevel = 2 }: {
  title?: ReactNode
  children: ReactNode
  className?: string
  headingLevel?: 2 | 3
}) {
  const Heading = headingLevel === 3 ? 'h3' : 'h2'
  return (
    <section className={cn('bp-dock-section', className)}>
      {title && <Heading>{title}</Heading>}
      {children}
    </section>
  )
}

export interface FactItem {
  label: ReactNode
  value: ReactNode
  /** Grid only: one plain line of context under the value ("Approved by Grace A.", "Came back after 6 days"). */
  sub?: ReactNode
  /** Grid only: the fact takes the whole row (long text such as access notes). */
  wide?: boolean
}

/**
 * Label/value pairs. `layout="list"` (default) is the quiet two-column list for a DockSection.
 * `layout="grid"` (v1.46, round 3 C1/C2) is the labelled facts grid: each fact a sunken tile, the label small, the value
 * large in ink, an optional plain line under it. Use it for a record's key facts and under a note.
 */
export function Facts({ items, layout = 'list', label }: { items: FactItem[]; layout?: 'list' | 'grid'; label?: string }) {
  if (layout === 'grid') return (
    <dl className="bp-factgrid" aria-label={label}>
      {items.map((item, index) => (
        <div key={index} data-wide={item.wide || undefined}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
          {item.sub && <dd className="sub">{item.sub}</dd>}
        </div>
      ))}
    </dl>
  )
  return (
    <dl className="facts" aria-label={label}>
      {items.map((item, index) => (
        <div key={index} style={{ display: 'contents' }}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

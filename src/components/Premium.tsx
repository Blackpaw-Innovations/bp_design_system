import type { CSSProperties, ElementType, ReactNode } from 'react'
import { cn } from '../lib/utils'

/**
 * The premium set (2026-10-08), "quiet authority":
 *   one hero per page, space before frames, ledgers not tiles,
 *   dark means it matters (max two sealed surfaces per screen),
 *   confirmations whisper (see Toast).
 * Styles live in tokens/components.css under "PREMIUM SET".
 */

/** A compact title row. Replaces tall banner heroes: the record is the hero, not the page. */
export interface PageHeaderProps {
  title: ReactNode
  /** Small trail above the title, e.g. "Portfolio / Garden Court". */
  crumbs?: ReactNode
  /** One line under the title: counts, status, as-of time. */
  meta?: ReactNode
  /** At most one primary (orange) action plus secondaries. */
  actions?: ReactNode
  className?: string
}

export function PageHeader({ title, crumbs, meta, actions, className }: PageHeaderProps) {
  return (
    <header className={cn('bp-page-header', className)}>
      <div className="min-w-0">
        {crumbs && <p className="crumbs">{crumbs}</p>}
        <h1>{title}</h1>
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
export function MetricLedger({ items, className, label }: { items: MetricItem[]; className?: string; label?: string }) {
  const style = { '--ledger-cols': String(Math.min(Math.max(items.length, 1), 4)) } as CSSProperties
  return (
    <section className={cn('bp-ledger', className)} style={style} aria-label={label}>
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

/** Label/value pairs for a DockSection. */
export function Facts({ items }: { items: { label: ReactNode; value: ReactNode }[] }) {
  return (
    <dl className="facts">
      {items.map((item, index) => (
        <div key={index} style={{ display: 'contents' }}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

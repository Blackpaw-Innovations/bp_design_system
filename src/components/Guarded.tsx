import { useEffect, useRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn, type IconComponent } from '../lib/utils'
import { formatDate, formatMoney } from '../lib/format'

/**
 * Guarded components (ruled 9 Oct 2026). The props only accept what the
 * standards allow (docs/HAKIQA_APP_STANDARDS.md). Styles: tokens/guardrails.css §6–7.
 *
 *   Button, ButtonLink, IconButton   one recipe, five variants, no hand-styled buttons
 *   ConfirmDialog                     replaces window.confirm / alert
 *   PageTitle                         one headline sentence; crumbs only on drill-downs; entity once
 *   DecisionPanel                     flat navy, white text, exactly one orange action
 *   StatGroup                         up to 4 figures; status is a dot, never coloured text
 *   DataTable                         typed columns: ids never wrap, money right-aligned and formatted
 *   Money, RecordId
 */

const dev = typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production'
const warn = (msg: string) => { if (dev) console.warn(`[@blackpaw/ui] ${msg}`) }

/* ── Buttons ───────────────────────────────────────────────── */
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'on-dark'
export type ButtonSize = 'md' | 'lg'

interface ButtonOwnProps {
  /** primary = the one thing to do on this view (orange). secondary = Signal Blue outline. tertiary = text. destructive = red outline, always behind a ConfirmDialog. on-dark = white outline inside navy. */
  variant?: ButtonVariant
  /** md = 44 px (default), lg = 52 px for the main action on phone layouts. There is no smaller size. */
  size?: ButtonSize
  icon?: IconComponent
  /** Shows a spinner, keeps the label, blocks repeat clicks. */
  loading?: boolean
  fullWidth?: boolean
  /** Sentence case, verb first, three words or fewer: "Save reading", "Review the offer". */
  children: string
}

export type ButtonProps = ButtonOwnProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className' | 'style'> & { className?: string }

export function Button({ variant = 'secondary', size = 'md', icon: Icon, loading, fullWidth, children, type = 'button', disabled, className, ...rest }: ButtonProps) {
  if (children.split(/\s+/).length > 4) warn(`Button "${children}" is long; keep labels to three words, verb first.`)
  return (
    <button
      {...rest}
      type={type}
      className={cn('bp-btn', className)}
      data-variant={variant}
      data-size={size}
      data-full={fullWidth || undefined}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? <span className="bp-spin" aria-hidden="true" /> : Icon && <Icon size={18} aria-hidden="true" />}
      {children}
    </button>
  )
}

export type ButtonLinkProps = Omit<ButtonOwnProps, 'loading'> & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'className' | 'style'> & { href: string; className?: string; disabled?: boolean }

/** A link that looks like a button (navigation, not an action). For router links pass `as` via your router's Link wrapping this markup, or use the class recipe: className="bp-btn" data-variant=… */
export function ButtonLink({ variant = 'secondary', size = 'md', icon: Icon, fullWidth, children, disabled, className, ...rest }: ButtonLinkProps) {
  return (
    <a {...rest} className={cn('bp-btn', className)} data-variant={variant} data-size={size} data-full={fullWidth || undefined} aria-disabled={disabled || undefined} tabIndex={disabled ? -1 : rest.tabIndex}>
      {Icon && <Icon size={18} aria-hidden="true" />}
      {children}
    </a>
  )
}

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className' | 'style' | 'aria-label'> & {
  icon: IconComponent
  /** Required: what the button does, read by screen readers and shown as the tooltip. */
  label: string
  className?: string
}

export function IconButton({ icon: Icon, label, type = 'button', className, ...rest }: IconButtonProps) {
  return (
    <button {...rest} type={type} className={cn('bp-icon-btn', className)} aria-label={label} title={label}>
      <Icon size={18} aria-hidden="true" />
    </button>
  )
}

/* ── ConfirmDialog ─────────────────────────────────────────── */
export interface ConfirmDialogProps {
  open: boolean
  title: string
  body?: string
  /** The verb for the action: "Delete photo", "Reset settings". */
  confirmLabel: string
  cancelLabel?: string
  destructive?: boolean
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, title, body, confirmLabel, cancelLabel = 'Cancel', destructive, loading, onConfirm, onCancel }: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!open) return
    cancelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])
  if (!open) return null
  return (
    <div className="bp-confirm-layer" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel() }}>
      <section className="bp-confirm" role="alertdialog" aria-modal="true" aria-labelledby="bp-confirm-title">
        <h2 id="bp-confirm-title">{title}</h2>
        {body && <p>{body}</p>}
        <div className="actions">
          <button ref={cancelRef} type="button" className="bp-btn" data-variant="tertiary" onClick={onCancel}>{cancelLabel}</button>
          <Button variant={destructive ? 'destructive' : 'primary'} loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </section>
    </div>
  )
}

/* ── PageTitle ─────────────────────────────────────────────── */
export interface PageTitleProps {
  /** One sentence with its number: "7 service requests". Two lines at most (~70 characters). */
  title: string
  context?: string
  /** Drill-down trail. Ignored on top-level pages (fewer than 2 items); the last item is dropped when it repeats the title. */
  crumbs?: { label: string; href?: string }[]
  /** The selected business. Rendered once, here; never as a chip. */
  entity?: string
  /** At most one primary <Button> plus secondaries. */
  actions?: ReactNode
  className?: string
}

export function PageTitle({ title, context, crumbs, entity, actions, className }: PageTitleProps) {
  if (title.length > 70) warn(`PageTitle "${title.slice(0, 40)}…" is ${title.length} characters; keep headlines to two lines and move the figure into a DecisionPanel or StatGroup.`)
  const trail = crumbs && crumbs.length >= 2 ? crumbs.filter((c, i) => !(i === crumbs.length - 1 && c.label.trim().toLowerCase() === title.trim().toLowerCase())) : []
  return (
    <header className={cn('bp-page-header', className)}>
      <div className="min-w-0">
        {trail.length > 0 && (
          <nav className="bp-title-crumbs" aria-label="Breadcrumb">
            {trail.map((c, i) => (
              <span key={i}>{c.href ? <a href={c.href}>{c.label}</a> : c.label}{i < trail.length - 1 ? ' ›' : ''}</span>
            ))}
          </nav>
        )}
        <h1 className="bp-title">{title}</h1>
        {(context || entity) && (
          <p className="bp-title-context">{entity && <span className="bp-entity">{entity}</span>}{entity && context ? ' · ' : ''}{context}</p>
        )}
      </div>
      {actions && <div className="actions">{actions}</div>}
    </header>
  )
}

/* ── DecisionPanel ─────────────────────────────────────────── */
export interface PanelAction { label: string; onClick?: () => void; href?: string; disabled?: boolean; loading?: boolean }

export interface DecisionPanelProps {
  title: string
  body?: string
  /** Exactly one primary action (orange, navy ink). */
  action: PanelAction
  /** Optional white-outline secondary. No more than one. */
  secondary?: PanelAction
  eyebrow?: string
  className?: string
}

function PanelButton({ a, variant }: { a: PanelAction; variant: ButtonVariant }) {
  return a.href
    ? <ButtonLink href={a.href} variant={variant} size="lg" disabled={a.disabled}>{a.label}</ButtonLink>
    : <Button variant={variant} size="lg" onClick={a.onClick} disabled={a.disabled} loading={a.loading}>{a.label}</Button>
}

export function DecisionPanel({ title, body, action, secondary, eyebrow = 'Next step', className }: DecisionPanelProps) {
  return (
    <section className={cn('bp-decision', className)} aria-label={title}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {body && <p>{body}</p>}
      <div className="actions">
        <PanelButton a={action} variant="primary" />
        {secondary && <PanelButton a={secondary} variant="on-dark" />}
      </div>
    </section>
  )
}

/* ── StatGroup ─────────────────────────────────────────────── */
export type StatTone = 'neutral' | 'attention' | 'critical' | 'positive'
export interface StatItem { label: string; value: ReactNode; note?: string; tone?: StatTone }

export interface StatGroupProps {
  items: StatItem[]
  /** 'dark' = the one flat navy hero for the page. 'plain' = surface card. 'none' = no frame. */
  surface?: 'dark' | 'plain' | 'none'
  label?: string
  className?: string
}

export function StatGroup({ items, surface = 'plain', label, className }: StatGroupProps) {
  if (items.length > 4) warn(`StatGroup got ${items.length} items; showing 4. Put the rest behind "Show all" on its own page.`)
  const shown = items.slice(0, 4)
  return (
    <section className={cn('bp-stats', className)} data-surface={surface} style={{ ['--stat-cols' as string]: String(Math.max(shown.length, 1)) }} aria-label={label}>
      {shown.map((s, i) => (
        <div className="bp-stat" key={i}>
          <p className="label">{s.label}</p>
          <p className="value">{s.value}</p>
          {s.note && <p className="note">{s.tone && s.tone !== 'neutral' && <i data-tone={s.tone} aria-hidden="true" />}{s.note}</p>}
        </div>
      ))}
    </section>
  )
}

/* ── Money / RecordId ──────────────────────────────────────── */
export function Money({ amount, currency, per, className }: { amount: number | null | undefined; currency?: string; per?: 'month' | 'year'; className?: string }) {
  return <span className={cn('bp-money', className)}>{formatMoney(amount, currency)}{per && <small>per {per}</small>}</span>
}

export function RecordId({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('bp-id', className)}>{children}</span>
}

/* ── DataTable ─────────────────────────────────────────────── */
export type ColumnKind = 'text' | 'id' | 'money' | 'number' | 'date' | 'status'

export interface Column<T> {
  key: string
  /** Sentence case. 15 px on the sunken surface with ink text, in every theme. */
  header: string
  kind?: ColumnKind
  currency?: (row: T) => string | undefined
  value?: (row: T) => unknown
  render?: (row: T) => ReactNode
  sub?: (row: T) => ReactNode
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  empty?: string
  label?: string
  className?: string
}

function cell<T>(col: Column<T>, row: T): ReactNode {
  if (col.render) return col.render(row)
  const v = col.value ? col.value(row) : (row as Record<string, unknown>)[col.key]
  if (col.kind === 'money') return formatMoney(typeof v === 'number' ? v : Number(v), col.currency?.(row))
  if (col.kind === 'date') return formatDate(v as string)
  if (col.kind === 'id') return <RecordId>{String(v ?? '—')}</RecordId>
  return v == null || v === '' ? '—' : String(v)
}

export function DataTable<T>({ columns, rows, rowKey, empty = 'Nothing here yet.', label, className }: DataTableProps<T>) {
  return (
    <div className={cn('bp-table-wrap', className)}>
      <table className="bp-table" aria-label={label}>
        <thead>
          <tr>{columns.map((c) => <th key={c.key} scope="col" data-kind={c.kind ?? 'text'}>{c.header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? <tr><td className="bp-table-empty" colSpan={columns.length}>{empty}</td></tr>
            : rows.map((r) => (
              <tr key={rowKey(r)}>
                {columns.map((c) => (
                  <td key={c.key} data-kind={c.kind ?? 'text'}>{cell(c, r)}{c.sub && <span className="sub">{c.sub(r)}</span>}</td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

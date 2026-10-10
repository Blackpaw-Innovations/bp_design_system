import { useId, useRef, useState, type ReactNode } from 'react'
import { AlertCircle, AlertTriangle, Check, MessageCircle, WifiOff, X } from 'lucide-react'
import { cn, type IconComponent } from '../lib/utils'
import { BLACKPAW_SUPPORT_PHONE, buildWhatsAppUrl } from '../lib/whatsapp'
import { Button } from './Guarded'

/**
 * Banners, states and help (standards §17.14, §17.16; round 2 R2, R3, R7).
 *
 *   Banner      something still true (offline, failed sync, plan renews). Toasts are for what just happened.
 *   EmptyState  first run, no match, offline, long wait, not found. Haki pose = situation (HAKI_STATE).
 *   ErrorState  plain, never Haki: "We couldn't load …", Try again, WhatsApp on repeat, reference.
 *   InlineError a failed action on one row or card, next to it.
 *   ErrorSummary on Save with 2+ field errors: links to each field, at the top of the form.
 *   Tooltip     names icon buttons only (2–3 words), desktop hover/focus. Terms get a visible help line.
 *   HakiTip     teaches a feature: inline card, navy "New" announcement, or peeking beside a field.
 */

/** brandAssets keys → repo mascot files (src/assets/brand/hakiqa/mascot/). Ship 200 px copies. */
export const HAKI_STATE = {
  empty: 'haki-empty',           // tray: first run, nothing added yet
  searching: 'haki-searching',   // magnifier: search or filters match nothing
  offline: 'haki-offline',       // plug: lost connection
  waiting: 'haki-waiting',       // hourglass: long job over 10 s
  notFound: 'haki-thinking',     // thinking: page not found
  tip: 'haki-pointing',          // HakiTip inline
  announce: 'haki-presenting',   // HakiTip "New"
  peek: 'haki-peeking-side',     // HakiTip beside a field
} as const
export type HakiState = keyof typeof HAKI_STATE

/* ── Banner ────────────────────────────────────────────────── */
export type BannerTone = 'pos' | 'warn' | 'crit' | 'info'
const BANNER_ICON: Record<BannerTone, IconComponent> = { pos: Check, warn: AlertTriangle, crit: AlertCircle, info: WifiOff }

export interface BannerProps {
  tone: BannerTone
  title: string
  children?: ReactNode
  action?: { label: string; onClick: () => void }
  icon?: IconComponent
  onDismiss?: () => void
  className?: string
}

/** Tinted, solid tone icon (approved look R3a). At the top of the page or of the card it is about. */
export function Banner({ tone, title, children, action, icon, onDismiss, className }: BannerProps) {
  const Icon = icon ?? BANNER_ICON[tone]
  return (
    <div className={cn('bp-banner', className)} data-tone={tone} role={tone === 'crit' ? 'alert' : 'status'}>
      <span className="bp-banner-icon" aria-hidden="true"><Icon size={15} strokeWidth={2.8} /></span>
      <div style={{ flex: 1, minWidth: 0 }}><p className="bp-banner-title" style={{ margin: 0 }}>{title}</p>{children && <div className="bp-banner-body">{children}</div>}</div>
      {action && <Button variant="tertiary" onClick={action.onClick}>{action.label}</Button>}
      {onDismiss && <button type="button" className="bp-icon-btn" aria-label="Dismiss" onClick={onDismiss}><X size={18} /></button>}
    </div>
  )
}

/* ── EmptyState v2 ─────────────────────────────────────────── */
export interface EmptyStateProps {
  /** Picks the Haki pose. Omit for a routine empty (no Haki, no icon, one line). */
  state?: HakiState
  /** From the manifest: manifest.brandAssets.mascot[HAKI_STATE[state]]. */
  mascotSrc?: string
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
  secondary?: { label: string; onClick: () => void }
  /** page = 120 px Haki, card = 88 px, row = 64 px beside the text (phone lists, tables). */
  size?: 'page' | 'card' | 'row'
  className?: string
}

export function EmptyState({ state, mascotSrc, title, description, action, secondary, size = 'page', className }: EmptyStateProps) {
  if (!state) return <p className={cn('bp-help', className)} style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-ink)', padding: 20, margin: 0 }}>{title}</p>
  return (
    <div className={cn('bp-state', className)} data-size={size}>
      {mascotSrc && <img src={mascotSrc} alt="" />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: size === 'row' ? 'flex-start' : 'center', flex: size === 'row' ? 1 : undefined }}>
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
      {(action || secondary) && (
        <div style={{ display: 'flex', gap: 10, marginTop: size === 'row' ? 0 : 6 }}>
          {action && <Button variant="primary" onClick={action.onClick}>{action.label}</Button>}
          {secondary && <Button variant="secondary" onClick={secondary.onClick}>{secondary.label}</Button>}
        </div>
      )}
    </div>
  )
}

/* ── Errors ────────────────────────────────────────────────── */
export interface ErrorStateProps {
  /** "We couldn't load your invoices". */
  title: string
  /** What to do, then reassurance when true: "Nothing was lost. Try again in a moment." */
  description?: string
  onRetry?: () => void
  /** After a repeat failure: shows "Message us on WhatsApp" with this context. */
  supportContext?: string
  reference?: string
  /** card = inside one card; the rest of the page stays. */
  size?: 'page' | 'card'
}

export function ErrorState({ title, description, onRetry, supportContext, reference, size = 'page' }: ErrorStateProps) {
  return (
    <div className="bp-state" data-size={size === 'card' ? 'card' : undefined} role="alert" style={{ alignItems: 'flex-start', textAlign: 'left' }}>
      <span className="bp-state-alert" aria-hidden="true"><AlertCircle size={24} /></span>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {onRetry && <Button variant="secondary" onClick={onRetry}>Try again</Button>}
        {supportContext && (
          <a className="bp-btn" data-variant="tertiary" data-size="md" target="_blank" rel="noopener noreferrer"
            href={buildWhatsAppUrl(BLACKPAW_SUPPORT_PHONE, `Hi Blackpaw, I ran into an issue.\n\n*Where:* ${supportContext}\n*Error:* ${title}${reference ? `\n*Reference:* ${reference}` : ''}`)}>
            <MessageCircle size={16} aria-hidden="true" />Message us on WhatsApp
          </a>
        )}
      </div>
      {reference && <p className="bp-help" style={{ margin: 0 }}>Reference {reference}</p>}
    </div>
  )
}

export function InlineError({ children, action }: { children: ReactNode; action?: { label: string; onClick: () => void } }) {
  return (
    <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--v-crit-tint)', fontSize: 15, color: 'var(--c-ink)' }}>
      <AlertCircle size={16} style={{ color: 'var(--v-crit)', flex: 'none' }} aria-hidden="true" />
      <span style={{ flex: 1 }}>{children}</span>
      {action && <button type="button" onClick={action.onClick} style={{ border: 0, background: 'transparent', minHeight: 44, font: '800 15px Urbanist, sans-serif', color: 'var(--c-signal-text)', cursor: 'pointer' }}>{action.label}</button>}
    </div>
  )
}

/** On Save with 2+ field errors. Each item focuses its field. One error: show it under the field only. */
export function ErrorSummary({ errors }: { errors: { fieldId: string; label: string }[] }) {
  if (errors.length < 2) return null
  return (
    <div role="alert" tabIndex={-1} style={{ borderRadius: 12, background: 'var(--v-crit-tint)', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <strong style={{ fontSize: 16, color: 'var(--c-ink)' }}>{errors.length} things to fix before saving</strong>
      {errors.map((e) => <a key={e.fieldId} href={`#${e.fieldId}`} onClick={(ev) => { ev.preventDefault(); document.getElementById(e.fieldId)?.focus() }} style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-signal-text)' }}>{e.label}</a>)}
    </div>
  )
}

/* ── Tooltip (icon names only) ─────────────────────────────── */
export function Tooltip({ label, children, align = 'end' }: { label: string; children: ReactNode; align?: 'start' | 'end' }) {
  const [show, setShow] = useState(false)
  const id = useId()
  const timer = useRef<ReturnType<typeof setTimeout>>()
  if (label.split(/\s+/).length > 3 && typeof console !== 'undefined') console.warn(`[@blackpaw/ui] Tooltip "${label}" is long. Tooltips name icon buttons; explain terms with visible help text.`)
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }} aria-describedby={show ? id : undefined}
      onMouseEnter={() => { timer.current = setTimeout(() => setShow(true), 400) }}
      onMouseLeave={() => { clearTimeout(timer.current); setShow(false) }}
      onFocus={() => setShow(true)} onBlur={() => setShow(false)}>
      {children}
      {show && <span id={id} role="tooltip" className="bp-tooltip max-sm:hidden" style={{ top: 'calc(100% + 8px)', [align === 'end' ? 'right' : 'left']: 0 }}>{label}</span>}
    </span>
  )
}

/* ── HakiTip v2 ────────────────────────────────────────────── */
export interface HakiTipProps {
  mascotSrc: string
  /** inline = card in the page flow (pointing); announce = navy "New · …" with one white action (presenting); peek = beside the field it explains, first time only. */
  placement?: 'inline' | 'announce' | 'peek'
  title?: ReactNode
  children: ReactNode
  action?: { label: string; onClick: () => void }
  /** Required: tips are shown once per user and dismissed with "Got it". */
  onDismiss: () => void
  className?: string
}

export function HakiTip({ mascotSrc, placement = 'inline', title, children, action, onDismiss, className }: HakiTipProps) {
  if (placement === 'announce') return (
    <div className={cn('haki-tip', className)} style={{ background: 'var(--c-navy)', color: '#fff', borderRadius: 18, padding: '16px 8px 16px 16px', display: 'flex', gap: 14, alignItems: 'center' }}>
      <img src={mascotSrc} alt="" width={72} height={72} />
      <div style={{ flex: 1 }}>{title && <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{title}</p>}<div style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.4 }}>{children}</div></div>
      {action && <button type="button" onClick={action.onClick} style={{ minHeight: 44, padding: '0 16px', borderRadius: 999, border: 0, background: '#fff', color: 'var(--c-navy)', font: '800 15px Urbanist, sans-serif', cursor: 'pointer' }}>{action.label}</button>}
      <button type="button" className="bp-icon-btn" aria-label="Dismiss" onClick={onDismiss} style={{ color: '#fff' }}><X size={18} /></button>
    </div>
  )
  if (placement === 'peek') return (
    <div className={className} style={{ display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ background: 'var(--c-selected)', borderRadius: '16px 16px 16px 4px', padding: '12px 8px 12px 14px', display: 'flex', alignItems: 'center', gap: 6, maxWidth: 420, marginBottom: 40, fontSize: 15, fontWeight: 700, lineHeight: 1.4, color: 'var(--c-ink)' }}>
        <span>{children}</span><Button variant="tertiary" onClick={onDismiss}>Got it</Button>
      </div>
      <img src={mascotSrc} alt="" width={96} height={96} style={{ marginBottom: -22, marginLeft: -6 }} />
    </div>
  )
  return (
    <div className={cn('haki-tip', className)} style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 18, padding: '16px 8px 16px 16px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <img src={mascotSrc} alt="" width={64} height={64} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {title && <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--c-ink)' }}>{title}</p>}
        <div className="bp-help" style={{ fontSize: 15 }}>{children}</div>
        <div style={{ display: 'flex', gap: 4, marginLeft: -10 }}>{action && <Button variant="tertiary" onClick={action.onClick}>{action.label}</Button>}<Button variant="tertiary" onClick={onDismiss}>Got it</Button></div>
      </div>
    </div>
  )
}

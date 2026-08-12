import type { ReactNode } from 'react'
import { cn, type IconComponent } from '../lib/utils'

/**
 * Wraps the existing `.chip` CSS (tokens/components.css) rather than
 * introducing a second markup/class system — see Reconciliation Codex C1.
 * `.chip`'s five tones (accent/success/warning/danger/info/neutral) already
 * carry per-identity dark-mode corrections (e.g. BICC's warning contrast fix).
 */
export type ChipTone = 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'

/**
 * The one status->tone table. A new status is a data row here, never a new
 * component or a locally re-invented color map at the call site.
 */
export const STATUS_TONE_MAP: Record<string, { tone: ChipTone; label: string }> = {
  // lifecycle / subscription
  active: { tone: 'success', label: 'Active' },
  live: { tone: 'accent', label: 'Live' },
  trial: { tone: 'info', label: 'Trial' },
  grace: { tone: 'warning', label: 'Grace' },
  pending: { tone: 'warning', label: 'Pending' },
  suspended: { tone: 'danger', label: 'Suspended' },
  overdue: { tone: 'danger', label: 'Overdue' },
  cancelled: { tone: 'neutral', label: 'Cancelled' },
  draft: { tone: 'neutral', label: 'Draft' },
  // payments / invoices
  paid: { tone: 'success', label: 'Paid' },
  due: { tone: 'warning', label: 'Due' },
  partial: { tone: 'warning', label: 'Partial' },
  // visits / work items (formerly components/StatusBadge.tsx's vocabulary)
  checked_in: { tone: 'accent', label: 'In Progress' },
  in_progress: { tone: 'accent', label: 'In Progress' },
  completed: { tone: 'success', label: 'Completed' },
  done: { tone: 'success', label: 'Completed' },
  resolved: { tone: 'success', label: 'Resolved' },
  waiting: { tone: 'warning', label: 'Waiting' },
  closed: { tone: 'neutral', label: 'Closed' },
  new: { tone: 'info', label: 'New' },
  ack: { tone: 'info', label: 'Acknowledged' },
  // dairy consignment/run states (illustrative reference only, see src/pages/dairy/)
  planned: { tone: 'neutral', label: 'Planned' },
  collected: { tone: 'accent', label: 'Collected' },
  delivered: { tone: 'success', label: 'Delivered' },
  reversed: { tone: 'danger', label: 'Reversed' },
  // onboarding pipeline
  Draft: { tone: 'neutral', label: 'Draft' },
  Submitted: { tone: 'info', label: 'Submitted' },
  Provisioning: { tone: 'warning', label: 'Provisioning' },
  Complete: { tone: 'success', label: 'Complete' },
  Failed: { tone: 'danger', label: 'Failed' },
  // people availability
  available: { tone: 'success', label: 'Available' },
  busy: { tone: 'danger', label: 'With client' },
  // generic priority
  critical: { tone: 'danger', label: 'Critical' },
  high: { tone: 'warning', label: 'High' },
  medium: { tone: 'info', label: 'Medium' },
  low: { tone: 'neutral', label: 'Low' },
  // task/expense categories
  sales: { tone: 'accent', label: 'Sales & Clients' },
  ops: { tone: 'info', label: 'Operations' },
  finance: { tone: 'warning', label: 'Finance' },
  personal: { tone: 'neutral', label: 'Personal' },
}

export interface StatusChipProps {
  /** A key into STATUS_TONE_MAP. Unknown keys fall back to `neutral` with the raw string as the label, never to a blank/uncolored chip. */
  status: string
  /** Overrides the table's label for this instance (status text stays the source of truth for tone). */
  label?: ReactNode
  /** Escape hatch for a status not yet in the table — still one component, not a new one. */
  tone?: ChipTone
  /** Pulses the dot -- reserve for a genuinely live/real-time state, not decoration. */
  pulse?: boolean
  /** Replaces the dot with an icon (e.g. a spinner for an in-progress state). The dot alone is enough for most statuses -- reach for this only when the icon carries information the tone doesn't (motion, a specific glyph). */
  icon?: IconComponent
  className?: string
}

export function StatusChip({ status, label, tone, pulse, icon: Icon, className }: StatusChipProps) {
  const entry = STATUS_TONE_MAP[status]
  const resolvedTone = tone ?? entry?.tone ?? 'neutral'
  const resolvedLabel = label ?? entry?.label ?? status

  return (
    <span className={cn('chip', resolvedTone, className)}>
      {Icon ? <Icon size={12} /> : <span className={cn('cdot', pulse && 'pulse')} />}
      {resolvedLabel}
    </span>
  )
}

import type { ReactNode } from 'react'
import { cn, type IconComponent } from '../lib/utils'

/**
 * StatusChip v2 (standards §17.12, round 2 R1). Five tones; the dot stays (from the code today).
 *   pos   done, paid, working as it should
 *   warn  needs action soon, waiting on someone
 *   crit  late, failed or blocked
 *   info  moving along, nothing to do
 *   draft not started, inactive or closed
 * `live` is not a tone: it is the one state where work is happening now (a job in the bay). Navy chip,
 * pulsing dot, at most one kind per screen.
 * Old tone names still work: success → pos, warning → warn, danger → crit, accent → info, neutral → draft.
 * Counts never go on a status chip (use <CountBadge> on filters, pill-nav and flyouts).
 */
export type ChipTone = 'pos' | 'warn' | 'crit' | 'info' | 'draft' | 'live'
type LegacyTone = 'success' | 'warning' | 'danger' | 'accent' | 'neutral'
const LEGACY: Record<LegacyTone, ChipTone> = { success: 'pos', warning: 'warn', danger: 'crit', accent: 'info', neutral: 'draft' }
const norm = (t: ChipTone | LegacyTone): ChipTone => (t in LEGACY ? LEGACY[t as LegacyTone] : (t as ChipTone))

/** The one status → tone table. A new state is a row here, never a local map (check local-status-map). */
export const STATUS_TONE_MAP: Record<string, { tone: ChipTone; label: string }> = {
  // pos
  paid: { tone: 'pos', label: 'Paid' }, completed: { tone: 'pos', label: 'Completed' }, done: { tone: 'pos', label: 'Completed' },
  approved: { tone: 'pos', label: 'Approved' }, active: { tone: 'pos', label: 'Active' }, delivered: { tone: 'pos', label: 'Delivered' },
  in_stock: { tone: 'pos', label: 'In stock' }, resolved: { tone: 'pos', label: 'Resolved' }, ready: { tone: 'pos', label: 'Ready' },
  available: { tone: 'pos', label: 'Available' }, Complete: { tone: 'pos', label: 'Complete' }, signed: { tone: 'pos', label: 'Signed' },
  // warn
  due: { tone: 'warn', label: 'Due soon' }, due_soon: { tone: 'warn', label: 'Due soon' }, awaiting_approval: { tone: 'warn', label: 'Awaiting approval' },
  partial: { tone: 'warn', label: 'Part paid' }, running_low: { tone: 'warn', label: 'Running low' }, pending: { tone: 'warn', label: 'Pending' },
  waiting: { tone: 'warn', label: 'Waiting' }, waiting_parts: { tone: 'warn', label: 'Waiting for parts' }, grace: { tone: 'warn', label: 'Grace period' },
  Provisioning: { tone: 'warn', label: 'Provisioning' }, high: { tone: 'warn', label: 'High' }, unassigned: { tone: 'warn', label: 'Not assigned' },
  // crit
  overdue: { tone: 'crit', label: 'Overdue' }, failed: { tone: 'crit', label: 'Failed' }, Failed: { tone: 'crit', label: 'Failed' },
  declined: { tone: 'crit', label: 'Declined' }, out_of_stock: { tone: 'crit', label: 'Out of stock' }, urgent: { tone: 'crit', label: 'Urgent' },
  expired: { tone: 'crit', label: 'Expired' }, suspended: { tone: 'crit', label: 'Suspended' }, reversed: { tone: 'crit', label: 'Reversed' },
  critical: { tone: 'crit', label: 'Critical' }, busy: { tone: 'crit', label: 'With client' },
  // info
  sent: { tone: 'info', label: 'Sent' }, in_progress: { tone: 'info', label: 'In progress' }, checked_in: { tone: 'info', label: 'In progress' },
  scheduled: { tone: 'info', label: 'Scheduled' }, booked: { tone: 'info', label: 'Booked' }, in_transit: { tone: 'info', label: 'In transit' },
  new: { tone: 'info', label: 'New' }, ack: { tone: 'info', label: 'Acknowledged' }, trial: { tone: 'info', label: 'Trial' },
  Submitted: { tone: 'info', label: 'Submitted' }, collected: { tone: 'info', label: 'Collected' }, diagnosis: { tone: 'info', label: 'Diagnosis' },
  medium: { tone: 'info', label: 'Medium' }, live: { tone: 'info', label: 'Live' },
  // draft
  draft: { tone: 'draft', label: 'Draft' }, Draft: { tone: 'draft', label: 'Draft' }, not_started: { tone: 'draft', label: 'Not started' },
  cancelled: { tone: 'draft', label: 'Cancelled' }, archived: { tone: 'draft', label: 'Archived' }, inactive: { tone: 'draft', label: 'Inactive' },
  closed: { tone: 'draft', label: 'Closed' }, planned: { tone: 'draft', label: 'Planned' }, low: { tone: 'draft', label: 'Low' },
  // live: work happening now
  in_bay: { tone: 'live', label: 'In the bay' },
}

export interface StatusChipProps {
  status: string
  label?: ReactNode
  /** Escape hatch for a status not yet in the table. Add the row instead when it is reused. */
  tone?: ChipTone | LegacyTone
  /** Only for live work (a job in the bay, a member checked in now). */
  pulse?: boolean
  icon?: IconComponent
  className?: string
}

export function StatusChip({ status, label, tone, pulse, icon: Icon, className }: StatusChipProps) {
  const entry = STATUS_TONE_MAP[status]
  const t = norm(tone ?? entry?.tone ?? 'draft')
  return (
    <span className={cn('chip', t, className)}>
      {Icon ? <Icon size={14} /> : <span className={cn('cdot', (pulse || t === 'live') && 'pulse')} aria-hidden="true" />}
      {label ?? entry?.label ?? status}
    </span>
  )
}

/** Neutral count on a filter chip, quick view, pill-nav item or flyout. Never on a record's status. */
export function CountBadge({ n, label }: { n: number; label?: string }) {
  return <span className="bp-count" aria-label={label ? `${n} ${label}` : undefined}>{n > 99 ? '99+' : n}</span>
}

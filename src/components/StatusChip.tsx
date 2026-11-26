import type { ReactNode } from 'react'
import { Check } from 'lucide-react'
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
/** pos | warn | crit | info | draft | live. The legacy names (success, warning, danger, accent, neutral) still work and map across; check-brand-rules flags them (legacy-chip-tone). */
export type ChipTone = 'pos' | 'warn' | 'crit' | 'info' | 'draft' | 'live' | LegacyTone
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
  sent: { tone: 'info', label: 'Sent' }, checked_in: { tone: 'info', label: 'In progress' },
  scheduled: { tone: 'info', label: 'Scheduled' }, booked: { tone: 'info', label: 'Booked' }, in_transit: { tone: 'info', label: 'In transit' },
  new: { tone: 'info', label: 'New' }, ack: { tone: 'info', label: 'Acknowledged' }, trial: { tone: 'info', label: 'Trial' },
  Submitted: { tone: 'info', label: 'Submitted' }, collected: { tone: 'info', label: 'Collected' }, diagnosis: { tone: 'info', label: 'Diagnosis' },
  medium: { tone: 'info', label: 'Medium' }, live: { tone: 'info', label: 'Live' },
  // draft
  draft: { tone: 'draft', label: 'Draft' }, Draft: { tone: 'draft', label: 'Draft' }, not_started: { tone: 'draft', label: 'Not started' },
  cancelled: { tone: 'draft', label: 'Cancelled' }, archived: { tone: 'draft', label: 'Archived' }, inactive: { tone: 'draft', label: 'Inactive' },
  closed: { tone: 'draft', label: 'Closed' }, planned: { tone: 'draft', label: 'Planned' }, low: { tone: 'draft', label: 'Low' },
  // Shared movement statuses (v1.21: Imports deliveries, Stay pickups and tour legs). Apps pass their own words as `label`.
  picked_up: { tone: 'info', label: 'Picked up' }, out_for_delivery: { tone: 'info', label: 'Out for delivery' },
  ready_for_pickup: { tone: 'info', label: 'Ready for pickup' }, on_hold: { tone: 'warn', label: 'On hold' },
  delivery_delayed: { tone: 'warn', label: 'Delayed' }, delivery_failed: { tone: 'crit', label: 'Delivery failed' },
  return_to_sender: { tone: 'crit', label: 'Returned to sender' }, unknown: { tone: 'draft', label: 'Not known' },
  // Request / job stages (v1.46, Marvin 26 Nov 2026, "one colour per meaning"): amber waits on the office, blue is
  // moving, navy (live) is work happening now, green is done, grey is closed. Reopened is a flag (FlagPill), not a stage.
  reported: { tone: 'warn', label: 'Reported' }, triaged: { tone: 'warn', label: 'Triaged' },
  assigned: { tone: 'info', label: 'Assigned' }, accepted: { tone: 'info', label: 'Accepted' },
  verified: { tone: 'pos', label: 'Verified' },
  // live: work happening now. v1.46: in_progress moved here from info (Marvin 26 Nov: navy fill is "In progress" only).
  in_bay: { tone: 'live', label: 'In the bay' }, in_progress: { tone: 'live', label: 'In progress' },
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

/* ── Pills: one look per meaning (v1.46.0, Marvin 26 Nov 2026, Properties round 3 C3) ─────────────────────────────
 * Stage    StatusChip: tint + dot, the tone is what the stage means (STATUS_TONE_MAP).
 * Flag     FlagPill: red tint, an icon in place of the dot. Beside the stage, never instead of it ("Reopened 25 Nov").
 * Urgency  UrgencyPill: solid, square corners, an icon. The only solid colour pills on a page.
 * Who      WhoPill: an outline with initials. A tick once they accepted; "Waiting for …" (dashed) before. Never navy:
 *          the navy fill belongs to "In progress" only.
 * Fact     TagPill: an outline, no colour (trade, kind, visit number). Facts, not states.
 */

/** Something to know about a record: reopened, overdue, disputed. Red tint (or amber for a softer warning) with an icon. */
export function FlagPill({ icon: Icon, children, tone = 'crit', className }: { icon: IconComponent; children: ReactNode; tone?: 'crit' | 'warn'; className?: string }) {
  return <span className={cn('chip', tone, 'bp-flag', className)}><Icon size={15} aria-hidden="true" />{children}</span>
}

export type UrgencyLevel = 'routine' | 'urgent' | 'critical'
const URGENCY_LABEL: Record<UrgencyLevel, string> = { routine: 'Routine', urgent: 'Urgent', critical: 'Safety critical' }

/** How fast: routine (outline), urgent (solid amber), critical (solid red). Pass the vertical's own word as `label`. */
export function UrgencyPill({ level, label, icon: Icon, className }: { level: UrgencyLevel; label?: ReactNode; icon?: IconComponent; className?: string }) {
  return <span className={cn('bp-urgency', className)} data-level={level}>{Icon && <Icon size={15} aria-hidden="true" />}{label ?? URGENCY_LABEL[level]}</span>
}

/** Who has it. `accepted` shows a tick; `waiting` reads "Waiting for {name}" with a dashed outline. */
export function WhoPill({ name, state = 'accepted', label, className }: { name: string; state?: 'accepted' | 'waiting'; label?: ReactNode; className?: string }) {
  const w = name.trim().split(/\s+/).filter(Boolean)
  const ini = ((w[0]?.[0] ?? '') + (w[1]?.[0] ?? '')).toUpperCase() || '?'
  return (
    <span className={cn('bp-who', className)} data-state={state}>
      <span className="ini" aria-hidden="true">{ini}</span>
      {label ?? (state === 'waiting' ? `Waiting for ${name}` : name)}
      {state === 'accepted' && <><Check size={16} strokeWidth={3} aria-hidden="true" /><span className="sr-only">, accepted</span></>}
    </span>
  )
}

/** A plain fact as an outline pill: trade, kind, "First visit". No colour. */
export function TagPill({ icon: Icon, children, className }: { icon?: IconComponent; children: ReactNode; className?: string }) {
  return <span className={cn('bp-tag', className)}>{Icon && <Icon size={15} aria-hidden="true" />}{children}</span>
}

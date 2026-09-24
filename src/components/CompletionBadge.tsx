import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

/**
 * A single done/not-done item -- onboarding checklists, "targets met" on a
 * profile screen. Deliberately NOT a smaller BadgeMedal: a completion badge
 * has no partial state (BADGE_APPLICATIONS_MAP.md "three badge types"), so
 * it never needs a ring or a 3D render. If an item can be 3 of 5, it's a
 * BadgeProgressCard, not this.
 */
export interface CompletionBadgeProps {
  label: ReactNode
  done: boolean
  /** Secondary text for a part-done item that's still boolean overall, e.g. "3 of 5" -- the tick stays binary, only the caption hints at partial. */
  caption?: ReactNode
  className?: string
}

export function CompletionBadge({ label, done, caption, className }: CompletionBadgeProps) {
  return (
    <div className={cn('bdg-completion', !done && 'pending', className)}>
      <span className={cn('bdg-completion-tick', done ? 'done' : 'pending')} aria-hidden="true">
        {done ? '✓' : ''}
      </span>
      <span>
        {label}
        {caption && <span className="ml-1.5 text-[hsl(var(--color-muted))]">({caption})</span>}
      </span>
    </div>
  )
}

export interface CompletionListProps {
  items: Array<{ id: string; label: ReactNode; done: boolean; caption?: ReactNode }>
  className?: string
}

/** Thin convenience wrapper -- the visual unit is CompletionBadge; this just maps a list and gives it the divider rule the profile-screen mock uses. Skip it and map CompletionBadge directly if a surface needs different spacing. */
export function CompletionList({ items, className }: CompletionListProps) {
  return (
    <div className={cn('divide-y divide-[hsl(var(--color-border))]', className)}>
      {items.map((item) => (
        <CompletionBadge key={item.id} label={item.label} done={item.done} caption={item.caption} />
      ))}
    </div>
  )
}

import { cn } from '../lib/utils'

interface SkeletonProps {
  className?: string
}

/**
 * Drop-in skeleton shimmer for any loading state.
 * Replace spinners with this — layout stays stable, perceived load drops.
 *
 * Usage:
 *   <Skeleton className="h-4 w-32" />           // text line
 *   <Skeleton className="h-10 w-full" />         // input field
 *   <Skeleton className="h-40 w-full rounded-lg" /> // card
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'skeleton animate-shimmer',
        className
      )}
      aria-hidden="true"
    />
  )
}

/** Pre-composed skeleton for a metric card (icon + title + value + trend) */
export function MetricCardSkeleton() {
  return (
    <div className="rounded-md border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}

/** Pre-composed skeleton for a table row */
export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

/** Pre-composed skeleton for a list item (avatar + two lines) */
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3">
      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

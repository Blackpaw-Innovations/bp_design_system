import { LucideIcon } from 'lucide-react'
import { cn } from '../lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

/**
 * Blank slate for empty lists, tables, and first-run states.
 * Never show an empty white box — always explain what belongs there and how to create it.
 *
 * Usage:
 *   <EmptyState
 *     icon={FileText}
 *     title="No invoices yet"
 *     description="Create your first invoice to start tracking payments."
 *     action={{ label: "Create invoice", onClick: () => navigate('/invoices/new') }}
 *   />
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-16 px-6 text-center',
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Icon className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
      </div>

      <div className="space-y-1 max-w-xs">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>

      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity tap-target"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

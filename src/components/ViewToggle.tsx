import { LayoutList, LayoutGrid, Table2 } from 'lucide-react'
import { cn } from '../lib/utils'

export type ViewMode = 'list' | 'card' | 'table'

interface ViewToggleProps {
  value: ViewMode
  onChange: (mode: ViewMode) => void
  options?: ViewMode[]
  className?: string
}

const VIEW_OPTIONS = [
  { mode: 'list'  as ViewMode, icon: LayoutList, label: 'List view' },
  { mode: 'card'  as ViewMode, icon: LayoutGrid, label: 'Card view' },
  { mode: 'table' as ViewMode, icon: Table2,     label: 'Table view' },
]

/**
 * View mode switcher — list / card / table.
 * Same data, different rendering density. Preference should be persisted by the parent.
 *
 * Usage:
 *   const [view, setView] = useState<ViewMode>('card')
 *   <ViewToggle value={view} onChange={setView} />
 */
export function ViewToggle({ value, onChange, options = ['list', 'card', 'table'], className }: ViewToggleProps) {
  const visible = VIEW_OPTIONS.filter(o => options.includes(o.mode))

  return (
    <div
      role="group"
      aria-label="View mode"
      className={cn(
        'inline-flex items-center rounded-md border border-border bg-muted p-0.5 gap-0.5',
        className
      )}
    >
      {visible.map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          aria-label={label}
          aria-pressed={value === mode}
          className={cn(
            'flex items-center justify-center h-7 w-7 rounded transition-colors tap-target',
            value === mode
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  )
}

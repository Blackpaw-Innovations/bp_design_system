import type { IconComponent } from '../lib/utils'
import { Button } from './Guarded'
import { Menu } from './Overlay'

/* ── ActionBar (v1.45, D4 "2C+A", Marvin 25 Nov 2026) ──────────
 * The ONE allowed exception to the September no-sticky-bar rule, for screens where the user acts again and
 * again (a field visit). Everywhere else the primary actions are the pinned footer of the bottom sheet.
 * Phone: one row pinned above the tab bar (--bp-tabbar-h), max 72 px + safe area, at most two buttons, the rest
 * in a "More" sheet; a spacer of the bar's height keeps it from covering content. Tablet and desktop: an
 * ordinary row in the page. */
export interface ActionBarAction {
  label: string
  onClick: () => void
  icon?: IconComponent
  /** Default: the first is primary, the second quiet. */
  variant?: 'primary' | 'secondary' | 'quiet'
  disabled?: boolean
  disabledReason?: string
  loading?: boolean
}

export function ActionBar({ actions, label = 'Actions', moreLabel = 'More actions' }: { actions: ActionBarAction[]; label?: string; moreLabel?: string }) {
  const shown = actions.slice(0, 2)
  const rest = actions.slice(2)
  return (
    <>
      <div className="bp-actionbar-space" aria-hidden="true" />
      <div className="bp-actionbar" role="toolbar" aria-label={label}>
        {shown.map((a, i) => (
          <Button key={a.label} variant={a.variant ?? (i === 0 ? 'primary' : 'quiet')} icon={a.icon} onClick={a.onClick}
            disabled={a.disabled} disabledReason={a.disabledReason} loading={a.loading}>{a.label}</Button>
        ))}
        {rest.length > 0 && (
          <Menu label={moreLabel} trigger="icon" align="end" groups={[rest.map((a) => ({ label: a.label, onSelect: a.onClick, icon: a.icon, disabled: a.disabled }))]} />
        )}
      </div>
    </>
  )
}

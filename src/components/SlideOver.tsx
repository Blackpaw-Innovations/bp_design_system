import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

/**
 * One slide-over mechanic (Reconciliation Codex C3, Commandment 15) --
 * replaces every local `DetailDrawer` (same name, five separately-built
 * copies before this), the raw .overlay/.slide-over pairs built by hand
 * page-to-page, and modals used for record editing (which the
 * commandment retires in favor of this). A consumer declares only its
 * own width and content; position, dim, transform, shadow, Esc, and
 * outside-click all come from here. Renders app-shell.css's own
 * .overlay/.slide-over class names (its single-source panel mechanic),
 * not a bp_design_system-invented pair.
 */
export interface SlideOverProps {
  open: boolean
  title: ReactNode
  subtitle?: ReactNode
  onClose: () => void
  children: ReactNode
  /** Sticky action row pinned below the scrollable body (e.g. Save/Cancel). */
  footer?: ReactNode
  /** CSS width, e.g. "480px" or "640px". Defaults to the .drawer spec's 480px. */
  width?: string
}

export function SlideOver({ open, title, subtitle, onClose, children, footer, width }: SlideOverProps) {
  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  return (
    <>
      <div className={`overlay${open ? ' open' : ''}`} onClick={onClose} />
      <aside className={`slide-over${open ? ' open' : ''}`} style={width ? { width, maxWidth: '92vw' } : undefined}>
        <div className="dh">
          <div>
            <h2 className="t-h2">{title}</h2>
            {subtitle && <p className="sub">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="dh-close">
            <X size={18} />
          </button>
        </div>
        <div className="db">{children}</div>
        {footer && <div className="df">{footer}</div>}
      </aside>
    </>
  )
}

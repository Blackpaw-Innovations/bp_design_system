import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { Check, AlertTriangle, X, MessageCircle } from 'lucide-react'
import { cn } from '../lib/utils'
import { BLACKPAW_SUPPORT_PHONE, buildWhatsAppUrl } from '../lib/whatsapp'

/**
 * One notifier, one visual spec (Reconciliation Codex C4; premium set
 * 2026-10-08). A small dark capsule, bottom right, ONE at a time: a new
 * notice replaces the current one, so confirmations never pile up over the
 * page header. It offers the next step (`action`) instead of just shouting.
 * The timer pauses while hovered or focused. role="status" for success and
 * warning, role="alert" for errors, 44px close target.
 * Consumers with a bottom nav set `--toast-offset-bottom` on :root.
 */
export type ToastIntent = 'success' | 'warning' | 'error'

export interface ToastSupportEscalation {
  /** Where the error happened, e.g. "Support — creating a ticket". Read by
   * the person on the other end of WhatsApp, not shown as UI copy. */
  context: string
  /** Overrides Blackpaw's own support line for this one toast. */
  phone?: string
}

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastOptions {
  /** The headline: what happened, in a few words ("Hold placed on Shop G13"). */
  message: string
  /** Optional second line: the consequence or what happens next. */
  detail?: string
  intent?: ToastIntent
  /** The next step (Undo, View, Try again). Clicking it also closes the notice. */
  action?: ToastAction
  /** ms before auto-dismiss. 0 disables auto-dismiss (user must close it). */
  duration?: number
  /**
   * Only for a real system/backend/network failure a human could actually
   * do something about -- never for client-side validation ("subject is
   * required"), which no amount of support escalation fixes. Adds a wa.me
   * link pre-filled with `context` and `message`. Implies duration: 0 unless
   * a duration is explicitly given.
   */
  supportEscalation?: ToastSupportEscalation
}

interface ActiveToast {
  id: number
  message: string
  detail?: string
  intent: ToastIntent
  action?: ToastAction
  duration: number
  supportEscalation?: ToastSupportEscalation
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

function ToastView({ toast, onClose }: { toast: ActiveToast; onClose: () => void }) {
  const [paused, setPaused] = useState(false)
  const remaining = useRef(toast.duration)

  useEffect(() => {
    if (paused || toast.duration <= 0) return
    const started = Date.now()
    const timer = setTimeout(onClose, remaining.current)
    return () => {
      clearTimeout(timer)
      remaining.current -= Date.now() - started
    }
  }, [paused, toast.duration, onClose])

  const Icon = toast.intent === 'success' ? Check : AlertTriangle
  return (
    <div
      role={toast.intent === 'error' ? 'alert' : 'status'}
      className={cn('toast', toast.intent)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span className="toast-icon" aria-hidden="true"><Icon size={16} strokeWidth={2.5} /></span>
      <div className="toast-body">
        <p className="toast-title">{toast.message}</p>
        {toast.detail && <p className="toast-detail">{toast.detail}</p>}
        {toast.supportEscalation && (
          <a
            href={buildWhatsAppUrl(
              toast.supportEscalation.phone ?? BLACKPAW_SUPPORT_PHONE,
              `Hi Blackpaw, I ran into an issue.\n\n*Where:* ${toast.supportEscalation.context}\n*Error:* ${toast.message}\n\nCan you help?`
            )}
            target="_blank"
            rel="noreferrer"
            className="toast-link inline-flex min-h-11 items-center gap-1.5 text-sm font-700 underline underline-offset-2"
          >
            <MessageCircle size={15} className="shrink-0" />
            Message us on WhatsApp
          </a>
        )}
      </div>
      {toast.action && (
        <button type="button" className="toast-action" onClick={() => { toast.action?.onClick(); onClose() }}>
          {toast.action.label}
        </button>
      )}
      <button type="button" className="toast-close" onClick={onClose} aria-label="Dismiss">
        <X size={16} />
      </button>
    </div>
  )
}

/** Mount once, near the root of the app (alongside the shell), not per-page. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ActiveToast | null>(null)
  const nextId = useRef(0)

  const close = useCallback(() => setToast(null), [])

  const showToast = useCallback(({ message, detail, intent = 'success', action, duration, supportEscalation }: ToastOptions) => {
    const resolved = duration ?? (supportEscalation ? 0 : intent === 'error' ? 8000 : 5000)
    setToast({ id: nextId.current++, message, detail, intent, action, duration: resolved, supportEscalation })
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-region" aria-live="polite">
        {toast && <ToastView key={toast.id} toast={toast} onClose={close} />}
      </div>
    </ToastContext.Provider>
  )
}

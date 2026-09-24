import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { CheckCircle2, AlertTriangle, XCircle, X, MessageCircle } from 'lucide-react'
import { cn } from '../lib/utils'
import { BLACKPAW_SUPPORT_PHONE, buildWhatsAppUrl } from '../lib/whatsapp'

/**
 * One notifier, one visual spec (Reconciliation Codex C4) -- replaces every
 * page-local toast implementation (each with its own state, timeout, and
 * markup). Success/warning/error intents map onto the same tone tokens as
 * StatusChip; a 44px dismiss target and role="status" are part of the spec,
 * not optional -- prior local implementations had neither.
 */
export type ToastIntent = 'success' | 'warning' | 'error'

export interface ToastSupportEscalation {
  /** Where the error happened, e.g. "Support — creating a ticket". Read by
   * the person on the other end of WhatsApp, not shown as UI copy. */
  context: string
  /** Overrides Blackpaw's own support line for this one toast. */
  phone?: string
}

export interface ToastOptions {
  message: string
  intent?: ToastIntent
  /** ms before auto-dismiss. 0 disables auto-dismiss (user must close it). */
  duration?: number
  /**
   * Only for a real system/backend/network failure a human could actually
   * do something about -- never for client-side validation ("subject is
   * required"), which no amount of support escalation fixes. Adds a wa.me
   * link pre-filled with `context` and `message`, so the person doesn't
   * have to retype what broke and support doesn't have to ask. Implies
   * duration: 0 unless a duration is explicitly given, since the point is
   * for it to stay on screen until the person acts or dismisses it.
   */
  supportEscalation?: ToastSupportEscalation
}

interface ActiveToast extends Required<Omit<ToastOptions, 'duration' | 'supportEscalation'>> {
  id: number
  supportEscalation?: ToastSupportEscalation
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const INTENT_ICON: Record<ToastIntent, typeof CheckCircle2> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

/** Mount once, near the root of the app (alongside the shell), not per-page. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ActiveToast[]>([])
  const nextId = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(({ message, intent = 'success', duration, supportEscalation }: ToastOptions) => {
    const id = nextId.current++
    const resolvedDuration = duration ?? (supportEscalation ? 0 : 4000)
    setToasts((current) => [...current, { id, message, intent, supportEscalation }])
    if (resolvedDuration > 0) {
      setTimeout(() => dismiss(id), resolvedDuration)
    }
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex flex-col gap-2" aria-live="polite">
        {toasts.map((toast) => {
          const Icon = INTENT_ICON[toast.intent]
          return (
            <div
              key={toast.id}
              role="status"
              className={cn('toast', toast.intent)}
              style={{ minWidth: 280, maxWidth: 420 }}
            >
              <Icon size={18} className="icon" />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <p>{toast.message}</p>
                {toast.supportEscalation && (
                  <a
                    href={buildWhatsAppUrl(
                      toast.supportEscalation.phone ?? BLACKPAW_SUPPORT_PHONE,
                      `Hi Blackpaw, I ran into an issue.\n\n*Where:* ${toast.supportEscalation.context}\n*Error:* ${toast.message}\n\nCan you help?`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center gap-1.5 text-sm font-800 underline underline-offset-2"
                  >
                    <MessageCircle size={15} className="shrink-0" />
                    Message us on WhatsApp
                  </a>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss"
                className="relative flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full opacity-60 hover:opacity-100 before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-11 before:-translate-x-1/2 before:-translate-y-1/2"
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

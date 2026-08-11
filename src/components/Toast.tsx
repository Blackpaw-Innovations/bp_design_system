import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react'
import { cn } from '../lib/utils'

/**
 * One notifier, one visual spec (Reconciliation Codex C4) -- replaces every
 * page-local toast implementation (each with its own state, timeout, and
 * markup). Success/warning/error intents map onto the same tone tokens as
 * StatusChip; a 44px dismiss target and role="status" are part of the spec,
 * not optional -- prior local implementations had neither.
 */
export type ToastIntent = 'success' | 'warning' | 'error'

export interface ToastOptions {
  message: string
  intent?: ToastIntent
  /** ms before auto-dismiss. 0 disables auto-dismiss (user must close it). */
  duration?: number
}

interface ActiveToast extends Required<Omit<ToastOptions, 'duration'>> {
  id: number
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

  const showToast = useCallback(({ message, intent = 'success', duration = 4000 }: ToastOptions) => {
    const id = nextId.current++
    setToasts((current) => [...current, { id, message, intent }])
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration)
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
              <p>{toast.message}</p>
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

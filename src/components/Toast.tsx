import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { AlertTriangle, Check, Info, Loader2, MessageCircle, X } from 'lucide-react'
import { cn } from '../lib/utils'
import { BLACKPAW_SUPPORT_PHONE, buildWhatsAppUrl } from '../lib/whatsapp'

/**
 * Toast v2 (standards §17.13, round 2 R3). Same API as before plus `info`, `reference` and `progress`.
 * A dark capsule, bottom right (full width above the bottom bar on phone), ONE at a time.
 *   success  "Payment recorded"                       5 s
 *   warning  done, but…: "Sale saved, receipt not sent" 5 s   (a warning that needs a decision is a dialog)
 *   error    "Couldn't send the quote" + what to do   8 s; with supportEscalation it stays until closed
 *   info     something changed: "Peter moved WO-2291 to Ready"
 * With an action the timer is 8 s. Hover and focus pause it. Undo replaces confirm for reversible removals.
 * Copy: past tense with the object. Errors: "Couldn't [verb] [object]" + what to do.
 * Routine saves never get a banner; lasting states (offline, failed sync) use <Banner>.
 */
export type ToastIntent = 'success' | 'warning' | 'error' | 'info'

export interface ToastSupportEscalation { context: string; phone?: string }
export interface ToastAction { label: string; onClick: () => void }

export interface ToastOptions {
  message: string
  detail?: string
  intent?: ToastIntent
  /** One action only: Undo, View, Try again, Fix number. */
  action?: ToastAction
  duration?: number
  /** Real system failures only, never validation. Adds the WhatsApp link and keeps the toast open. */
  supportEscalation?: ToastSupportEscalation
  /** Shown as "Reference ERR-7F3A" and sent with the WhatsApp message. */
  reference?: string
  /** Long actions: "12 of 24 sent". Call showToast again with the same `id` to update, then with intent success. */
  progress?: string
  id?: string
}

interface Active extends Required<Pick<ToastOptions, 'message' | 'intent'>> { key: number; id?: string; detail?: string; action?: ToastAction; duration: number; supportEscalation?: ToastSupportEscalation; reference?: string; progress?: string }

const Ctx = createContext<{ showToast: (o: ToastOptions) => void; dismissToast: () => void } | null>(null)

export function useToast() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useToast must be used inside <ToastProvider>')
  return c
}

function View({ t, onClose }: { t: Active; onClose: () => void }) {
  const [paused, setPaused] = useState(false)
  const left = useRef(t.duration)
  useEffect(() => {
    if (paused || t.duration <= 0) return
    const s = Date.now()
    const id = setTimeout(onClose, left.current)
    return () => { clearTimeout(id); left.current -= Date.now() - s }
  }, [paused, t.duration, onClose])
  const Icon = t.progress ? Loader2 : t.intent === 'success' ? Check : t.intent === 'info' ? Info : AlertTriangle
  const wa = t.supportEscalation && buildWhatsAppUrl(t.supportEscalation.phone ?? BLACKPAW_SUPPORT_PHONE,
    `Hi Blackpaw, I ran into an issue.\n\n*Where:* ${t.supportEscalation.context}\n*Error:* ${t.message}${t.reference ? `\n*Reference:* ${t.reference}` : ''}\n\nCan you help?`)
  return (
    <div role={t.intent === 'error' ? 'alert' : 'status'} className={cn('toast', t.intent)}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <span className="toast-icon" aria-hidden="true"><Icon size={16} strokeWidth={2.6} className={t.progress ? 'animate-spin' : undefined} /></span>
      <div className="toast-body">
        <p className="toast-title">{t.message}</p>
        {(t.detail || t.progress) && <p className="toast-detail">{t.progress ?? t.detail}</p>}
        {t.reference && <p className="toast-ref">Reference {t.reference}</p>}
        {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="toast-link inline-flex min-h-11 items-center gap-1.5 font-700 underline underline-offset-2"><MessageCircle size={15} />Message us on WhatsApp</a>}
      </div>
      {t.action && <button type="button" className="toast-action" onClick={() => { t.action?.onClick(); onClose() }}>{t.action.label}</button>}
      <button type="button" className="toast-close" onClick={onClose} aria-label="Dismiss"><X size={16} /></button>
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [t, setT] = useState<Active | null>(null)
  const n = useRef(0)
  const close = useCallback(() => setT(null), [])
  const showToast = useCallback((o: ToastOptions) => {
    const intent = o.intent ?? 'success'
    const duration = o.duration ?? (o.progress ? 0 : o.supportEscalation ? 0 : intent === 'error' || o.action ? 8000 : 5000)
    setT((prev) => ({ key: o.id && prev?.id === o.id ? prev.key : n.current++, id: o.id, message: o.message, detail: o.detail, intent, action: o.action, duration, supportEscalation: o.supportEscalation, reference: o.reference, progress: o.progress }))
  }, [])
  return (
    <Ctx.Provider value={{ showToast, dismissToast: close }}>
      {children}
      <div className="toast-region" aria-live="polite">{t && <View key={`${t.key}-${t.progress ?? ''}-${t.intent}`} t={t} onClose={close} />}</div>
    </Ctx.Provider>
  )
}

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './Guarded'

/**
 * Destructive actions in Haki red #D0181F (standards §17.6, round 2 R5).
 * Ladder, lightest first:
 *   reversible (archive, remove from list) → do it, then Undo in the toast. No red.
 *   delete one record                       → Button variant="destructive" (outline, fills red on hover) + ConfirmDialog
 *   delete many, a branch or the account    → TypeToConfirmDialog
 *   frequent and trained (void at the till) → HoldToConfirm, replaces the dialog
 * DangerZone: bottom of a settings or record page, never above the fold, one per page.
 *   tone="outline" (default, R5a) on settings; tone="solid" (R5c) only for closing the account.
 */
export function DangerZone({ title, children, action, tone = 'outline' }: { title: string; children: ReactNode; action: ReactNode; tone?: 'outline' | 'solid' }) {
  return (
    <section className="bp-danger-card" data-tone={tone === 'solid' ? 'solid' : undefined} aria-label={title}>
      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{title}</h3>
      <div style={{ fontSize: 15, lineHeight: 1.45, color: tone === 'solid' ? '#fff' : 'var(--c-muted)' }}>{children}</div>
      <div style={{ display: 'flex', paddingTop: 6 }}>{action}</div>
    </section>
  )
}

/** Press and hold (1.5 s) to confirm. Keyboard: hold Enter or Space. Reduced motion: no fill animation, same timing. */
export function HoldToConfirm({ label, holdingLabel = 'Keep holding…', doneLabel, onConfirm, ms = 1500 }: { label: string; holdingLabel?: string; doneLabel: string; onConfirm: () => void; ms?: number }) {
  const [state, setState] = useState<'idle' | 'holding' | 'done'>('idle')
  const t = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => () => clearTimeout(t.current), [])
  const start = () => { if (state === 'done') return; setState('holding'); t.current = setTimeout(() => { setState('done'); onConfirm() }, ms) }
  const stop = () => { if (state === 'holding') { clearTimeout(t.current); setState('idle') } }
  return (
    <button type="button" className="bp-btn bp-hold" data-variant="destructive" data-size="md" data-holding={state === 'holding' || undefined} data-done={state === 'done' || undefined}
      style={{ ['--hold-ms' as string]: `${ms}ms`, ...(state === 'done' ? { background: 'var(--c-red)' } : {}) }}
      onPointerDown={start} onPointerUp={stop} onPointerLeave={stop}
      onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) { e.preventDefault(); start() } }} onKeyUp={stop}
      aria-live="polite" aria-label={state === 'idle' ? `${label}. Press and hold to confirm.` : undefined}>
      <span className="bp-hold-fill" aria-hidden="true" />
      <span>{state === 'done' ? doneLabel : state === 'holding' ? holdingLabel : label}</span>
    </button>
  )
}

/** For deletes that take many records with them. The confirm word is the object's own name. */
export function TypeToConfirmDialog({ open, title, body, word, confirmLabel, cancelLabel, onConfirm, onCancel }: { open: boolean; title: string; body: string; word: string; confirmLabel: string; cancelLabel: string; onConfirm: () => void; onCancel: () => void }) {
  const [typed, setTyped] = useState('')
  useEffect(() => { if (!open) setTyped('') }, [open])
  if (!open) return null
  const ok = typed.trim() === word
  return createPortal(
    <div className="bp-confirm-layer" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel() }}>
      <section className="bp-dialog" data-size="sm" role="alertdialog" aria-modal="true" aria-label={title} style={{ padding: 24, gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{title}</h2>
        <p className="bp-help" style={{ margin: 0, fontSize: 16 }}>{body}</p>
        <label style={{ fontSize: 15, fontWeight: 700 }}>Type <b>{word}</b> to confirm</label>
        <div className="bp-control"><input autoFocus value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={word} aria-label={`Type ${word} to confirm`} /></div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8 }}>
          <Button variant="tertiary" onClick={onCancel}>{cancelLabel}</Button>
          <button type="button" className="bp-btn" data-variant="destructive-solid" data-size="md" disabled={!ok} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </section>
    </div>,
    document.body,
  )
}

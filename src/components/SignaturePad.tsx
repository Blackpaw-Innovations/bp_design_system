import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Check, Undo2 } from 'lucide-react'
import { Button } from './Guarded'
import { Segmented } from './Form'
import { formatDate, formatDateTime } from '../lib/format'

/**
 * SignaturePad (standards §17.22, round 2 W6).
 *   - The signer sees what they sign: a navy summary (record, subject, total) and 2–4 confirmations.
 *   - Pad 220 px (200 px phone), white in every theme so it prints, navy ink, × at the line start, the
 *     date on the pad. Undo removes the last stroke; Clear removes all.
 *   - "Type instead" stores the typed name as text and records the method.
 *   - The confirm button does the real step ("Confirm and hand over"), disabled until there is ink.
 *   - Signed state is a receipt: signature, pos "Signed" chip, name, time, method, device; "Sign again"
 *     replaces the old one only when the new one is confirmed.
 *   - Phone: before the pad, a screen says "Hand the phone to {name}" with the total.
 */
export interface SignatureValue { method: 'drawn' | 'typed'; image?: string; typedName?: string; signer: string; signedAt: string; device?: string }

export interface SignaturePadProps {
  signer: string
  /** "Vehicle hand-over · WO-2291". */
  recordLabel: string
  /** "Toyota Fielder KDA 123X". */
  subject: string
  total?: string
  /** What the signature confirms, 2–4 lines. */
  confirms: string[]
  /** Legal line under the pad: "By signing, I confirm…". */
  statement: string
  /** Verb first: "Confirm and hand over". */
  confirmLabel: string
  onConfirm: (v: SignatureValue) => void | Promise<void>
  value?: SignatureValue | null
  onSignAgain?: () => void
  device?: string
  /** After signing: "Copy sent on WhatsApp", only when it was. */
  receiptNote?: ReactNode
}

type Pt = [number, number]

export function SignaturePad({ signer, recordLabel, subject, total, confirms, statement, confirmLabel, onConfirm, value, onSignAgain, device = 'This device', receiptNote }: SignaturePadProps) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const strokes = useRef<Pt[][]>([])
  const [count, setCount] = useState(0)
  const [mode, setMode] = useState<'drawn' | 'typed'>('drawn')
  const [typed, setTyped] = useState(signer)
  const [busy, setBusy] = useState(false)

  const redraw = useCallback(() => {
    const c = canvas.current
    if (!c) return
    const x = c.getContext('2d')!
    x.clearRect(0, 0, c.width, c.height)
    x.lineWidth = 5; x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = '#032053'
    for (const s of strokes.current) { x.beginPath(); s.forEach(([px, py], i) => (i ? x.lineTo(px, py) : x.moveTo(px, py))); x.stroke() }
  }, [])

  useEffect(() => {
    const c = canvas.current
    if (!c || value) return
    let cur: Pt[] | null = null
    const pos = (e: PointerEvent): Pt => { const r = c.getBoundingClientRect(); return [((e.clientX - r.left) * c.width) / r.width, ((e.clientY - r.top) * c.height) / r.height] }
    const down = (e: PointerEvent) => { c.setPointerCapture(e.pointerId); cur = [pos(e)]; strokes.current.push(cur) }
    const move = (e: PointerEvent) => { if (!cur) return; cur.push(pos(e)); redraw() }
    const up = () => { if (cur) { cur = null; setCount(strokes.current.length) } }
    c.addEventListener('pointerdown', down); c.addEventListener('pointermove', move); c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up)
    redraw()
    return () => { c.removeEventListener('pointerdown', down); c.removeEventListener('pointermove', move); c.removeEventListener('pointerup', up); c.removeEventListener('pointercancel', up) }
  }, [mode, value, redraw])

  const has = mode === 'drawn' ? count > 0 : typed.trim().length > 1
  const confirm = async () => {
    if (!has) return
    setBusy(true)
    try {
      await onConfirm({ method: mode, image: mode === 'drawn' ? canvas.current?.toDataURL('image/png') : undefined, typedName: mode === 'typed' ? typed.trim() : undefined, signer, signedAt: new Date().toISOString(), device })
      strokes.current = []; setCount(0)
    } finally { setBusy(false) }
  }

  return (
    <section style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 18, overflow: 'hidden' }} aria-label={`Signature for ${recordLabel}`}>
      <div className="bp-sign-summary">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ fontSize: 15, fontWeight: 700 }}>{recordLabel}</span><span style={{ fontSize: 22, fontWeight: 900 }}>{subject}</span></div>
        {total && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}><span style={{ fontSize: 15, fontWeight: 700 }}>Total</span><span style={{ fontSize: 26, fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>{total}</span></div>}
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 6, borderBottom: '1px solid var(--c-border)' }}>
        {confirms.map((c) => <li key={c} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 16 }}><Check size={18} style={{ color: 'var(--v-pos)' }} aria-hidden="true" />{c}</li>)}
      </ul>
      <div style={{ padding: '16px 22px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {value ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 260px', gap: 18, alignItems: 'center' }}>
            <div style={{ height: 150, borderRadius: 16, background: '#fff', boxShadow: 'inset 0 0 0 1.5px var(--c-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {value.image ? <img src={value.image} alt={`Signature of ${value.signer}`} style={{ maxWidth: '100%', maxHeight: '100%' }} /> : <span style={{ fontFamily: 'Caveat, cursive', fontSize: 52, color: '#032053' }}>{value.typedName}</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span className="chip pos" style={{ width: 'max-content' }}><span className="cdot" />Signed</span>
              <div style={{ fontSize: 15, lineHeight: 1.5 }}><b>{value.signer}</b><br />{formatDateTime(value.signedAt)}<br />{value.method === 'typed' ? 'Typed name' : 'Drawn'} · {value.device}</div>
              {receiptNote && <div className="bp-help">{receiptNote}</div>}
              {onSignAgain && <Button variant="tertiary" onClick={onSignAgain}>Sign again</Button>}
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ flex: 1, fontSize: 17, fontWeight: 800 }}>{signer}, please sign</span>
              <Segmented label="How to sign" value={mode} onChange={setMode} options={[{ value: 'drawn', label: 'Draw' }, { value: 'typed', label: 'Type instead' }]} />
            </div>
            {mode === 'drawn' ? (
              <div className="bp-sign-pad" data-inked={count > 0 || undefined}>
                <canvas ref={canvas} width={1200} height={440} aria-label="Signature pad. Draw with your finger, a stylus or a mouse." />
                <span className="bp-sign-line" /><span className="bp-sign-x">×</span>
                <span className="bp-sign-hint" style={{ left: 28 }}>{count ? 'Signed above the line' : 'Sign above the line'}</span>
                <span className="bp-sign-hint" style={{ right: 20 }}>{formatDate(new Date())}</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="bp-control" style={{ minHeight: 48 }}><input aria-label="Full name" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Type your full name" /></div>
                <div style={{ height: 140, borderRadius: 16, background: '#fff', boxShadow: 'inset 0 0 0 1.5px var(--c-border)', display: 'flex', alignItems: 'center', padding: '0 28px', fontFamily: 'Caveat, cursive', fontSize: 56, color: '#032053' }}>{typed}</div>
              </div>
            )}
            <p className="bp-help" style={{ margin: 0 }}>{statement}</p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Button variant="tertiary" icon={Undo2} disabled={mode !== 'drawn' || count === 0} onClick={() => { strokes.current.pop(); redraw(); setCount(strokes.current.length) }}>Undo</Button>
              <Button variant="tertiary" disabled={mode !== 'drawn' || count === 0} onClick={() => { strokes.current = []; redraw(); setCount(0) }}>Clear</Button>
              <span style={{ flex: 1 }} />
              <Button variant="primary" size="lg" loading={busy} disabled={!has} onClick={() => void confirm()}>{confirmLabel}</Button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, X } from 'lucide-react'
import { cn, type IconComponent } from '../lib/utils'
import { Button } from './Guarded'

/**
 * Overlays (standards §17.6, §17.7, W1, W5).
 *   useIsPhone        one breakpoint: below 640 px every picker and dialog is a bottom sheet
 *   Sheet             bottom sheet with grip, title, close; full height when it holds a search
 *   usePopover        fixed-position anchor that flips above when there is no room
 *   FormDialog        sm 400 / md 560; footer fixed; Enter submits; dirty close asks first
 *   SlideOver         right side, 480 / 720; record id, facts, header menu, pinned footer, dirty guard
 *   Menu              Actions menu: verbs grouped, destructive last in red. Never a Select of actions.
 */

export function useIsPhone() {
  const q = '(max-width: 639px)'
  const [phone, setPhone] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches)
  useEffect(() => {
    const m = window.matchMedia(q)
    const on = () => setPhone(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return phone
}

function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [open, onClose])
}

/** Returns focus to whatever opened the layer (§14). */
function useReturnFocus(open: boolean) {
  const prev = useRef<HTMLElement | null>(null)
  useEffect(() => {
    if (open) prev.current = document.activeElement as HTMLElement
    else prev.current?.focus?.()
  }, [open])
}

export interface SheetProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  /** Opens at full height (use when the sheet holds a search, so the keyboard never hides rows). */
  full?: boolean
  footer?: ReactNode
}

export function Sheet({ open, title, onClose, children, full, footer }: SheetProps) {
  useEscape(open, onClose)
  useReturnFocus(open)
  if (!open) return null
  return createPortal(
    <>
      <div className="bp-scrim" onClick={onClose} aria-hidden="true" />
      <section className="bp-sheet" data-full={full || undefined} role="dialog" aria-modal="true" aria-label={title}>
        <div className="bp-sheet-grip" aria-hidden="true" />
        <div className="bp-sheet-head"><span style={{ flex: 1 }}>{title}</span><button type="button" className="bp-icon-btn" aria-label="Close" onClick={onClose}><X size={20} /></button></div>
        <div style={{ flex: 1, overflow: 'auto' }}>{children}</div>
        {footer && <div style={{ padding: '12px 16px 16px' }}>{footer}</div>}
      </section>
    </>,
    document.body,
  )
}

export function usePopover(anchor: RefObject<HTMLElement | null>, open: boolean, opts: { width?: number | 'anchor'; maxHeight?: number; align?: 'start' | 'end' } = {}) {
  const [style, setStyle] = useState<CSSProperties>({})
  const place = useCallback(() => {
    const el = anchor.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const gap = 6
    const below = window.innerHeight - r.bottom - gap
    const above = r.top - gap
    const want = opts.maxHeight ?? 340
    const up = below < Math.min(want, above) && above > below
    const width = opts.width === 'anchor' || opts.width == null ? r.width : opts.width
    const left = opts.align === 'end' ? Math.max(8, r.right - width) : Math.min(r.left, window.innerWidth - width - 8)
    setStyle({ position: 'fixed', left, width, maxHeight: Math.max(160, Math.min(want, up ? above : below)), ...(up ? { bottom: window.innerHeight - r.top + gap } : { top: r.bottom + gap }) })
  }, [anchor, opts.width, opts.maxHeight, opts.align])
  useLayoutEffect(() => {
    if (!open) return
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => { window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true) }
  }, [open, place])
  return style
}

export function useOutside(refs: RefObject<HTMLElement | null>[], open: boolean, onOutside: () => void) {
  useEffect(() => {
    if (!open) return
    const h = (e: PointerEvent) => { if (!refs.some((r) => r.current?.contains(e.target as Node))) onOutside() }
    document.addEventListener('pointerdown', h)
    return () => document.removeEventListener('pointerdown', h)
  }, [open, onOutside, refs])
}

/* ── FormDialog ────────────────────────────────────────────── */
export interface FormDialogProps {
  open: boolean
  /** The task, sentence case: "Record payment". */
  title: string
  /** One line under the title: the record it acts on. */
  context?: string
  size?: 'sm' | 'md'
  /** Primary label, verb first: "Record payment". */
  submitLabel: string
  onSubmit: () => void | Promise<void>
  onClose: () => void
  /** When true, closing asks "Discard changes?" first, and the backdrop never closes it. */
  dirty?: boolean
  busy?: boolean
  children: ReactNode
}

export function FormDialog({ open, title, context, size = 'md', submitLabel, onSubmit, onClose, dirty, busy, children }: FormDialogProps) {
  const id = useId()
  const [asking, setAsking] = useState(false)
  const tryClose = useCallback(() => (dirty ? setAsking(true) : onClose()), [dirty, onClose])
  useEscape(open && !asking, tryClose)
  useReturnFocus(open)
  if (!open) return null
  return createPortal(
    <div className="bp-confirm-layer" onMouseDown={(e) => { if (e.target === e.currentTarget && !dirty) onClose() }}>
      <form className="bp-dialog" data-size={size} role="dialog" aria-modal="true" aria-labelledby={id} onSubmit={(e) => { e.preventDefault(); void onSubmit() }}>
        <div className="bp-dialog-head"><h2 id={id} style={{ flex: 1, margin: 0, font: 'inherit' }}>{title}</h2><button type="button" className="bp-icon-btn" aria-label="Close" onClick={tryClose}><X size={20} /></button></div>
        <div className="bp-dialog-body">{context && <p className="bp-help" style={{ margin: 0, fontSize: 15 }}>{context}</p>}{children}</div>
        <div className="bp-dialog-foot">
          {asking ? (
            <>
              <span style={{ flex: 1, fontWeight: 700 }}>Discard your changes?</span>
              <Button variant="tertiary" onClick={() => setAsking(false)}>Keep editing</Button>
              <Button variant="destructive" onClick={() => { setAsking(false); onClose() }}>Discard</Button>
            </>
          ) : (
            <>
              <Button variant="tertiary" onClick={tryClose}>Cancel</Button>
              <Button variant="primary" type="submit" loading={busy}>{submitLabel}</Button>
            </>
          )}
        </div>
      </form>
    </div>,
    document.body,
  )
}

/* ── SlideOver v2 ──────────────────────────────────────────── */
export interface SlideOverProps {
  open: boolean
  title: ReactNode
  /** "Work order WO-2291 · opened 8 Oct 2026". 15 px muted, above the title. */
  recordId?: ReactNode
  /** One line under the title: the StatusChip and up to 3 key facts. The status appears only here. */
  facts?: ReactNode
  /** Contact or record shortcuts (WhatsApp, Call, Job card) under the facts. */
  quickActions?: ReactNode
  /** The ⋯ menu: secondary actions, Delete last. */
  menu?: MenuGroup[]
  onClose: () => void
  children: ReactNode
  /** Pinned: the one next step for this stage first, Cancel as text, "Open full page" on the right. */
  footer?: ReactNode
  /** 480 default; 720 when the panel holds a table or line items; 960 for all-day records with a side activity column. */
  /** 480 / 560 / 720 / 960. A legacy CSS width ("440px") snaps up to the next allowed width. */
  width?: 480 | 560 | 720 | 960 | string
  /** @deprecated Use recordId. */
  subtitle?: ReactNode
  dirty?: boolean
  /** Shows a back arrow instead of replacing the panel when a related record opened inside it. */
  onBack?: () => void
}

export function SlideOver({ open, title, recordId: recordIdProp, subtitle, facts, quickActions, menu, onClose, children, footer, width: widthProp = 480, dirty, onBack }: SlideOverProps) {
  const recordId = recordIdProp ?? subtitle
  const width = typeof widthProp === 'number' ? widthProp : ([480, 560, 720, 960].find((w) => w >= (parseInt(widthProp, 10) || 480)) ?? 960)
  const [asking, setAsking] = useState(false)
  const tryClose = useCallback(() => (dirty ? setAsking(true) : onClose()), [dirty, onClose])
  useEscape(open && !asking, tryClose)
  useReturnFocus(open)
  return (
    <>
      <div className={`overlay${open ? ' open' : ''}`} onClick={() => { if (!dirty) onClose() }} aria-hidden={!open} {...(!open ? { inert: true } : {})} />
      <aside className={`slide-over${open ? ' open' : ''}`} style={{ width, maxWidth: '100vw' }} role="dialog" aria-modal={open || undefined} aria-hidden={!open} {...(!open ? { inert: true } : {})}>
        <div className="dh" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            {onBack && <button type="button" className="bp-icon-btn" aria-label="Back" onClick={onBack}>←</button>}
            <div style={{ flex: 1, minWidth: 0 }}>
              {recordId && <p className="bp-panel-id" style={{ margin: 0 }}>{recordId}</p>}
              <h2 className="t-h2" style={{ margin: 0 }}>{title}</h2>
            </div>
            {menu && <Menu label="More actions" groups={menu} align="end" trigger="icon" />}
            <button type="button" onClick={tryClose} aria-label="Close" className="dh-close"><X size={18} /></button>
          </div>
          {facts && <div className="bp-panel-facts">{facts}</div>}
          {quickActions && <div style={{ display: 'flex', gap: 8 }}>{quickActions}</div>}
        </div>
        <div className="db">{children}</div>
        {(footer || asking) && (
          <div className="df bp-panel-foot">
            {asking ? (
              <>
                <span style={{ flex: 1, fontWeight: 700 }}>Discard your changes?</span>
                <Button variant="tertiary" onClick={() => setAsking(false)}>Keep editing</Button>
                <Button variant="destructive" onClick={() => { setAsking(false); onClose() }}>Discard</Button>
              </>
            ) : footer}
          </div>
        )}
      </aside>
    </>
  )
}

/* ── Menu (Actions) ───────────────────────────────────────── */
export interface MenuItem {
  label: string
  onSelect: () => void
  icon?: IconComponent
  /** Keyboard hint or short note, right-aligned. */
  hint?: string
  /** Red, always the last group. Opens a ConfirmDialog or type-to-confirm from onSelect. */
  danger?: boolean
  disabled?: boolean
}
export type MenuGroup = MenuItem[]

export interface MenuProps {
  /** Button text ("Actions") or, for trigger="icon", the accessible name ("More actions"). */
  label: string
  groups: MenuGroup[]
  trigger?: 'button' | 'icon'
  align?: 'start' | 'end'
}

export function Menu({ label, groups, trigger = 'button', align = 'end' }: MenuProps) {
  const [open, setOpen] = useState(false)
  const btn = useRef<HTMLButtonElement>(null)
  const pop = useRef<HTMLDivElement>(null)
  const phone = useIsPhone()
  const style = usePopover(btn, open && !phone, { width: 280, align })
  const close = useCallback(() => setOpen(false), [])
  useOutside([btn, pop], open && !phone, close)
  useEscape(open, close)
  const dangerLast = [...groups.map((g) => g.filter((i) => !i.danger)).filter((g) => g.length), groups.flat().filter((i) => i.danger)].filter((g) => g.length)
  const items = (
    <>
      {dangerLast.map((g, gi) => (
        <div key={gi} className="bp-menu-group" role="group">
          {g.map((it) => (
            <button key={it.label} type="button" role="menuitem" className="bp-menu-item" data-danger={it.danger || undefined} disabled={it.disabled} onClick={() => { setOpen(false); it.onSelect() }}>
              {it.icon && <it.icon size={18} />}{it.label}{it.hint && <span className="bp-menu-hint">{it.hint}</span>}
            </button>
          ))}
        </div>
      ))}
    </>
  )
  return (
    <>
      {trigger === 'icon'
        ? <button ref={btn} type="button" className="bp-icon-btn" aria-label={label} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>⋯</button>
        : <button ref={btn} type="button" className="bp-btn" data-variant="secondary" data-size="md" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>{label}<ChevronDown size={16} aria-hidden="true" /></button>}
      {open && !phone && createPortal(<div ref={pop} className={cn('bp-pop', 'bp-menu')} role="menu" aria-label={label} style={style}>{items}</div>, document.body)}
      {phone && <Sheet open={open} title={label} onClose={close}><div className="bp-menu" style={{ padding: '0 10px 10px' }}>{items}</div></Sheet>}
    </>
  )
}

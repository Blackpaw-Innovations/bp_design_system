import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { Sheet, useIsPhone, useOutside, usePopover } from './Overlay'
import { Button } from './Guarded'

/**
 * Select and MultiSelect (standards §17.1). Replaces the 45 hand-built and 21 native selects.
 *   - Search appears by itself at 8+ options, as the first row: "Search 12 suppliers". Matches anywhere.
 *   - Required: no empty row, starts on the placeholder "Choose a …". Optional: first row "None".
 *   - Phone: always a bottom sheet with the field's label as title; searchable sheets open full height.
 *   - Keyboard: arrows, Enter, Escape, type-to-jump. 6 rows visible (44 px), then scroll.
 *   - Not for actions (use <Menu>), not for 2–3 visible choices (use <Segmented> or <RadioGroup>).
 * Backwards compatible with the old props: `searchable` still forces search on.
 */

export interface SelectOption { value: string; label: string; disabled?: boolean }

interface Base {
  options: SelectOption[]
  /** The field label. Also the sheet title on phone and the noun in "Search 12 suppliers". */
  label?: string
  /** Plural noun for the search placeholder, e.g. "suppliers". Defaults to "options". */
  noun?: string
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  searchable?: boolean
  className?: string
  buttonClassName?: string
  id?: string
  'aria-describedby'?: string
}

export interface SelectProps extends Base {
  value: string
  onChange: (value: string) => void
  /** Adds a first "None" row that sets ''. Use with Field optional. */
  optional?: boolean
}

export interface MultiSelectProps extends Base {
  value: string[]
  onChange: (value: string[]) => void
  /** Shown over 20 options only, and only when picking all is a real job. */
  selectAll?: boolean
}

const SEARCH_AT = 8

function useList(options: SelectOption[], query: string) {
  return useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options
  }, [options, query])
}

function Trigger({ open, onClick, label, text, empty, disabled, invalid, id, describedBy, btnRef, className }: { open: boolean; onClick: () => void; label?: string; text: React.ReactNode; empty: boolean; disabled?: boolean; invalid?: boolean; id?: string; describedBy?: string; btnRef: React.RefObject<HTMLButtonElement | null>; className?: string }) {
  return (
    <button
      ref={btnRef} id={id} type="button" disabled={disabled} onClick={onClick}
      aria-haspopup="listbox" aria-expanded={open} aria-label={id ? undefined : label} aria-describedby={describedBy} aria-invalid={invalid || undefined}
      className={`bp-control ${className ?? ''}`} data-invalid={invalid || undefined} data-disabled={disabled || undefined}
      style={{ width: '100%', alignItems: 'center', gap: 10, padding: '0 14px', cursor: 'pointer', textAlign: 'left', font: '600 16px Urbanist, sans-serif', ...(open ? { borderColor: 'var(--c-signal)', boxShadow: '0 0 0 2px var(--c-ring)' } : {}) }}
    >
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: empty ? 'var(--c-muted)' : undefined }}>{text}</span>
      <ChevronDown size={18} aria-hidden="true" style={{ color: 'var(--c-muted)', transform: open ? 'rotate(180deg)' : undefined }} />
    </button>
  )
}

function ListBody({ rows, isOn, onPick, query, setQuery, showSearch, searchPh, active, setActive, onKey, multi, listId, label }: { rows: SelectOption[]; isOn: (v: string) => boolean; onPick: (v: string) => void; query: string; setQuery: (q: string) => void; showSearch: boolean; searchPh: string; active: number; setActive: (n: number) => void; onKey: (e: React.KeyboardEvent) => void; multi?: boolean; listId: string; label?: string }) {
  const search = useRef<HTMLInputElement>(null)
  const list = useRef<HTMLUListElement>(null)
  useEffect(() => { requestAnimationFrame(() => (showSearch ? search.current : list.current)?.focus()) }, [showSearch])
  return (
    <>
      {showSearch && (
        <div className="bp-pop-search"><div><Search size={18} aria-hidden="true" style={{ color: 'var(--c-muted)' }} /><input ref={search} value={query} onChange={(e) => { setQuery(e.target.value); setActive(0) }} onKeyDown={onKey} placeholder={searchPh} aria-label={searchPh} aria-controls={listId} /></div></div>
      )}
      <ul ref={list} id={listId} role="listbox" aria-label={label} aria-multiselectable={multi || undefined} tabIndex={-1} onKeyDown={onKey} style={{ listStyle: 'none', margin: 0, padding: '4px 0', maxHeight: 264, overflow: 'auto', outline: 'none' }}>
        {rows.length === 0 && <li className="bp-help" style={{ padding: '12px 14px' }}>Nothing matches "{query}"</li>}
        {rows.map((o, i) => {
          const on = isOn(o.value)
          return (
            <li key={o.value || '__none'} role="option" aria-selected={on} aria-disabled={o.disabled || undefined} className="bp-opt" data-active={i === active || undefined}
              onMouseEnter={() => setActive(i)} onPointerDown={(e) => e.preventDefault()} onClick={() => !o.disabled && onPick(o.value)}>
              {multi && <span className="bp-box" aria-hidden="true" style={on ? { background: 'var(--c-signal)', borderColor: 'var(--c-signal)', color: '#fff' } : undefined}>{on && <Check size={15} strokeWidth={3} />}</span>}
              <span style={{ flex: 1 }}>{o.label}</span>
              {!multi && on && <Check size={18} aria-hidden="true" style={{ color: 'var(--c-signal-text)' }} />}
            </li>
          )
        })}
      </ul>
    </>
  )
}

function useSelectCore(options: SelectOption[], forceSearch: boolean | undefined, label: string | undefined, noun: string | undefined) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const btn = useRef<HTMLButtonElement>(null)
  const pop = useRef<HTMLDivElement>(null)
  const phone = useIsPhone()
  const style = usePopover(btn, open && !phone, { width: 'anchor', maxHeight: 340 })
  const rows = useList(options, query)
  const showSearch = forceSearch ?? options.length >= SEARCH_AT
  const close = useCallback(() => { setOpen(false); setQuery(''); requestAnimationFrame(() => btn.current?.focus()) }, [])
  useOutside([btn, pop], open && !phone, close)
  const searchPh = `Search ${options.length} ${noun ?? (label ? label.toLowerCase() + 's' : 'options')}`
  const typed = useRef({ s: '', t: 0 })
  const keys = (pick: (v: string) => void) => (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(rows.length - 1, a + 1)); return }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); return }
    if (e.key === 'Enter') { e.preventDefault(); const o = rows[active]; if (o && !o.disabled) pick(o.value); return }
    if (e.key === 'Tab') { close(); return }
    if (!showSearch && e.key.length === 1) {
      const now = Date.now(); typed.current = { s: (now - typed.current.t < 600 ? typed.current.s : '') + e.key.toLowerCase(), t: now }
      const i = rows.findIndex((o) => o.label.toLowerCase().startsWith(typed.current.s)); if (i >= 0) setActive(i)
    }
  }
  return { open, setOpen, query, setQuery, active, setActive, btn, pop, phone, style, rows, showSearch, close, searchPh, keys }
}

export function Select({ value, onChange, options, label, noun, placeholder, disabled, invalid, searchable, optional, className, buttonClassName, id, 'aria-describedby': describedBy }: SelectProps) {
  const opts = useMemo(() => (optional ? [{ value: '', label: 'None' }, ...options] : options), [optional, options])
  const c = useSelectCore(opts, searchable, label, noun)
  const listId = useId()
  const current = opts.find((o) => o.value === value && (o.value !== '' || optional))
  const pick = (v: string) => { onChange(v); c.close() }
  useEffect(() => { if (c.open) c.setActive(Math.max(0, c.rows.findIndex((o) => o.value === value))) }, [c.open]) // eslint-disable-line react-hooks/exhaustive-deps
  const body = <ListBody rows={c.rows} isOn={(v) => v === value} onPick={pick} query={c.query} setQuery={c.setQuery} showSearch={c.showSearch} searchPh={c.searchPh} active={c.active} setActive={c.setActive} onKey={c.keys(pick)} listId={listId} label={label} />
  return (
    <div className={className} style={{ position: 'relative' }}>
      <Trigger btnRef={c.btn} open={c.open} onClick={() => (c.open ? c.close() : c.setOpen(true))} label={label} text={current ? current.label : placeholder ?? `Choose ${label ? 'a ' + label.toLowerCase() : 'one'}`} empty={!current} disabled={disabled} invalid={invalid} id={id} describedBy={describedBy} className={buttonClassName} />
      {c.open && !c.phone && createPortal(<div ref={c.pop} className="bp-pop" style={c.style}>{body}</div>, document.body)}
      {c.phone && <Sheet open={c.open} title={label ?? 'Choose'} onClose={c.close} full={c.showSearch}>{body}</Sheet>}
    </div>
  )
}

export function MultiSelect({ value, onChange, options, label, noun, placeholder, disabled, invalid, searchable, selectAll, className, buttonClassName, id, 'aria-describedby': describedBy }: MultiSelectProps) {
  const c = useSelectCore(options, searchable, label, noun)
  const listId = useId()
  const [draft, setDraft] = useState<string[]>(value)
  useEffect(() => { if (c.open) setDraft(value) }, [c.open]) // eslint-disable-line react-hooks/exhaustive-deps
  const toggle = (v: string) => setDraft((d) => (d.includes(v) ? d.filter((x) => x !== v) : [...d, v]))
  const done = () => { onChange(draft); c.close() }
  const chosen = options.filter((o) => value.includes(o.value))
  const text = chosen.length === 0
    ? placeholder ?? `Choose ${noun ?? 'options'}`
    : <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>{chosen.slice(0, 2).map((o) => (
        <span key={o.value} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 30, padding: '0 6px 0 12px', borderRadius: 999, background: 'var(--c-selected)', fontSize: 15, fontWeight: 700 }}>
          {o.label}<span role="button" tabIndex={0} aria-label={`Remove ${o.label}`} onClick={(e) => { e.stopPropagation(); onChange(value.filter((x) => x !== o.value)) }} style={{ display: 'inline-flex' }}><X size={15} /></span>
        </span>
      ))}{chosen.length > 2 && <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-muted)' }}>+{chosen.length - 2}</span>}</span>
  const foot = (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 12px', borderTop: '1px solid var(--c-border)' }}>
      {selectAll && options.length > 20 && <Button variant="tertiary" onClick={() => setDraft(draft.length === options.length ? [] : options.map((o) => o.value))}>{draft.length === options.length ? 'Clear all' : 'Select all'}</Button>}
      <span className="bp-help" style={{ flex: 1 }}>{draft.length} chosen</span>
      <Button variant="secondary" onClick={done}>Done</Button>
    </div>
  )
  const body = <ListBody multi rows={c.rows} isOn={(v) => draft.includes(v)} onPick={toggle} query={c.query} setQuery={c.setQuery} showSearch={c.showSearch} searchPh={c.searchPh} active={c.active} setActive={c.setActive} onKey={c.keys(toggle)} listId={listId} label={label} />
  return (
    <div className={className} style={{ position: 'relative' }}>
      <Trigger btnRef={c.btn} open={c.open} onClick={() => (c.open ? done() : c.setOpen(true))} label={label} text={text} empty={chosen.length === 0} disabled={disabled} invalid={invalid} id={id} describedBy={describedBy} className={buttonClassName} />
      {c.open && !c.phone && createPortal(<div ref={c.pop} className="bp-pop" style={c.style}>{body}{foot}</div>, document.body)}
      {c.phone && <Sheet open={c.open} title={label ?? 'Choose'} onClose={done} full={c.showSearch} footer={<Button variant="primary" size="lg" fullWidth onClick={done}>Done</Button>}>{body}</Sheet>}
    </div>
  )
}

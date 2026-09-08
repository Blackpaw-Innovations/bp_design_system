import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  className?: string
  buttonClassName?: string
  placeholder?: string
  disabled?: boolean
  label?: string
  searchable?: boolean
}

export function Select({
  value,
  onChange,
  options,
  className = '',
  buttonClassName = '',
  placeholder,
  disabled = false,
  label,
  searchable = false,
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const [query, setQuery] = useState('')
  const [placement, setPlacement] = useState<'below' | 'above'>('below')
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({})
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listboxId = useId()
  const current = options.find((option) => option.value === value)
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return searchable && normalizedQuery
      ? options.filter((option) => option.label.toLowerCase().includes(normalizedQuery))
      : options
  }, [options, query, searchable])

  function close() {
    setOpen(false)
    setQuery('')
    requestAnimationFrame(() => buttonRef.current?.focus())
  }

  function positionMenu() {
    const button = buttonRef.current
    if (!button) return
    const rect = button.getBoundingClientRect()
    const gap = 6
    const availableBelow = window.innerHeight - rect.bottom - gap
    const availableAbove = rect.top - gap
    const openAbove = availableBelow < Math.min(280, availableAbove) && availableAbove > availableBelow
    const maxHeight = Math.max(120, Math.min(280, openAbove ? availableAbove : availableBelow))
    setPlacement(openAbove ? 'above' : 'below')
    setMenuStyle({
      position: 'fixed',
      left: rect.left,
      width: rect.width,
      ...(openAbove ? { bottom: window.innerHeight - rect.top + gap } : { top: rect.bottom + gap }),
      maxHeight,
    })
  }

  useEffect(() => {
    if (!open) return
    function onDocumentPointer(event: PointerEvent) {
      const target = event.target as Node
      if (rootRef.current?.contains(target) || listRef.current?.contains(target)) return
      close()
    }
    document.addEventListener('pointerdown', onDocumentPointer)
    return () => document.removeEventListener('pointerdown', onDocumentPointer)
  }, [open])

  useLayoutEffect(() => {
    if (!open) return
    positionMenu()
    const onViewportChange = () => positionMenu()
    window.addEventListener('resize', onViewportChange)
    window.addEventListener('scroll', onViewportChange, true)
    return () => {
      window.removeEventListener('resize', onViewportChange)
      window.removeEventListener('scroll', onViewportChange, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const selectedIndex = filteredOptions.findIndex((option) => option.value === value)
    setHighlight(selectedIndex >= 0 ? selectedIndex : 0)
    requestAnimationFrame(() => (searchable ? searchRef.current : listRef.current)?.focus())
  }, [open, filteredOptions, searchable, value])

  useEffect(() => {
    if (!open) return
    listRef.current?.querySelector<HTMLElement>(`[data-option-index="${highlight}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [highlight, open])

  function openFromButton() {
    setOpen(true)
  }

  function onButtonKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      openFromButton()
    }
  }

  function onListKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlight((currentHighlight) => Math.min(filteredOptions.length - 1, currentHighlight + 1))
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlight((currentHighlight) => Math.max(0, currentHighlight - 1))
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      const option = filteredOptions[highlight]
      if (option) {
        onChange(option.value)
        close()
      }
      return
    }
    if (event.key === 'Tab') close()
  }

  const menu = open ? createPortal(
    <ul
      ref={listRef}
      id={listboxId}
      role="listbox"
      aria-label={label}
      tabIndex={-1}
      onKeyDown={onListKeyDown}
      style={menuStyle}
      className={`z-[100] overflow-y-auto rounded-hq-md border border-hq-border bg-white p-1.5 shadow-hq-modal outline-none ${placement === 'above' ? 'origin-bottom' : 'origin-top'}`}
    >
      {searchable && <li className="p-1.5"><input ref={searchRef} aria-label={`Search ${label ?? 'options'}`} value={query} onChange={(event) => { setQuery(event.target.value); setHighlight(0) }} onKeyDown={onListKeyDown} placeholder="Search options…" className="hq-input min-h-11 w-full" /></li>}
      {filteredOptions.length === 0 && <li className="px-3 py-3 text-sm text-hq-muted">No matching options.</li>}
      {filteredOptions.map((option, index) => (
        <li
          key={option.value}
          role="option"
          data-option-index={index}
          aria-selected={option.value === value}
          onMouseEnter={() => setHighlight(index)}
          onPointerDown={(event) => event.preventDefault()}
          onClick={() => { onChange(option.value); close() }}
          className={`flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-hq-navy transition-colors ${index === highlight ? 'bg-hq-bg' : ''} ${option.value === value ? 'bg-[#edf9f7] font-800' : 'font-600'}`}
        >
          <span>{option.label}</span>
          {option.value === value && <Check size={17} className="flex-none text-hq-teal" aria-hidden="true" />}
        </li>
      ))}
    </ul>,
    document.body,
  ) : null

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => (open ? close() : openFromButton())}
        onKeyDown={onButtonKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={label}
        className={`flex min-h-11 w-full items-center justify-between gap-2 rounded-hq-md border border-hq-border bg-hq-surface px-3.5 py-2.5 text-left text-[13.5px] font-600 text-hq-text transition-colors hover:border-hq-navy focus:outline-none focus:border-hq-navy focus:shadow-[0_0_0_3px_rgba(0,165,184,0.12)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-hq-border ${buttonClassName}`}
      >
        <span className="truncate">{current ? current.label : placeholder ?? 'Select...'}</span>
        <ChevronDown size={14} className={`flex-none text-hq-muted transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>
      {menu}
    </div>
  )
}

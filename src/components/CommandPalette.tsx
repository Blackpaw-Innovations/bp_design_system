/**
 * CommandPalette — ⌘K global search + action launcher
 * Inspired by Linear clone. Keyboard-first navigation for power users.
 *
 * Usage:
 *   <CommandPalette
 *     open={open}
 *     onClose={() => setOpen(false)}
 *     items={[{ id, label, icon, group, onSelect }]}
 *   />
 *
 *   // Wire the shortcut:
 *   useCommandPalette(() => setOpen(true))
 */

import { useEffect, useRef, useState, type ReactNode } from 'react'

export interface CommandItem {
  id: string
  label: string
  description?: string
  icon?: ReactNode
  group?: string
  keywords?: string[]
  onSelect: () => void
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  items: CommandItem[]
  placeholder?: string
}

function fuzzyMatch(query: string, item: CommandItem): boolean {
  const q = query.toLowerCase().trim()
  if (!q) return true
  const haystack = [item.label, item.description, ...(item.keywords ?? [])].join(' ').toLowerCase()
  return q.split('').every(ch => haystack.includes(ch)) ||
    haystack.includes(q)
}

export function CommandPalette({ open, onClose, items, placeholder = 'Search or jump to…' }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef  = useRef<HTMLDivElement>(null)

  const filtered = items.filter(item => fuzzyMatch(query, item))

  // Group filtered results
  const groups = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    const g = item.group ?? 'Actions'
    if (!acc[g]) acc[g] = []
    acc[g].push(item)
    return acc
  }, {})

  const flat = Object.values(groups).flat()

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery('')
      setCursor(0)
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }, [open])

  // Keyboard navigation
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape')     { onClose(); return }
      if (e.key === 'ArrowDown')  { e.preventDefault(); setCursor(c => Math.min(c + 1, flat.length - 1)) }
      if (e.key === 'ArrowUp')    { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)) }
      if (e.key === 'Enter') {
        e.preventDefault()
        flat[cursor]?.onSelect()
        onClose()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, flat, cursor, onClose])

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-cursor="true"]`) as HTMLElement
    el?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  if (!open) return null

  let flatIdx = 0

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(6px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 560,
          margin: '0 16px',
          background: 'hsl(var(--color-surface))',
          border: '1px solid hsl(var(--color-border))',
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
        }}
        className="animate-slide-up"
      >
        {/* Search input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 16px',
          borderBottom: '1px solid hsl(var(--color-border))',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.4, flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setCursor(0) }}
            placeholder={placeholder}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              fontSize: 15,
              color: 'hsl(var(--color-ink))',
              fontFamily: 'inherit',
            }}
          />
          <kbd style={{
            flexShrink: 0,
            fontSize: 10,
            fontWeight: 600,
            padding: '2px 6px',
            borderRadius: 4,
            background: 'hsl(var(--color-border))',
            color: 'hsl(var(--color-muted))',
            border: '1px solid hsl(var(--color-border))',
          }}>ESC</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} style={{ maxHeight: 360, overflowY: 'auto', padding: '6px 0' }} className="scrollbar-none">
          {flat.length === 0 && (
            <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: 13, color: 'hsl(var(--color-muted))' }}>
              No results for "{query}"
            </div>
          )}

          {Object.entries(groups).map(([group, groupItems]) => (
            <div key={group}>
              <p style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'hsl(var(--color-muted))',
                padding: '8px 16px 2px',
                margin: 0,
              }}>{group}</p>

              {groupItems.map((item) => {
                const idx = flatIdx++
                const isActive = cursor === idx
                return (
                  <button
                    key={item.id}
                    data-cursor={isActive}
                    onClick={() => { item.onSelect(); onClose() }}
                    onMouseEnter={() => setCursor(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      width: '100%',
                      padding: '8px 16px',
                      background: isActive ? 'hsl(var(--bp-cyan) / 0.08)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      minWidth: 0,
                      transition: 'background 80ms',
                    }}
                  >
                    {item.icon && (
                      <span style={{ flexShrink: 0, opacity: isActive ? 1 : 0.5, color: isActive ? 'hsl(var(--bp-cyan))' : 'currentColor' }}>
                        {item.icon}
                      </span>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isActive ? 'hsl(var(--bp-cyan))' : 'hsl(var(--color-ink))' }}>
                        {item.label}
                      </p>
                      {item.description && (
                        <p style={{ margin: 0, fontSize: 11, opacity: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                    {isActive && (
                      <kbd style={{ flexShrink: 0, fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'hsl(var(--color-border))', color: 'hsl(var(--color-muted))', border: '1px solid hsl(var(--color-border))' }}>
                        ↵
                      </kbd>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Hook to register the ⌘K / Ctrl+K shortcut.
 * Call once in your root layout:
 *   useCommandPalette(() => setPaletteOpen(true))
 */
export function useCommandPalette(onOpen: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onOpen()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onOpen])
}

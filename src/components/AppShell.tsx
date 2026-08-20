/**
 * AppShell — Blackpaw standardized app layout
 *
 * Modelled after Spotify Web: resizable left sidebar, sticky top bar,
 * overflow-safe main content, optional persistent bottom bar.
 *
 * Usage:
 *   <AppShell sidebar={<MySidebar />} topBar={<MyTopBar />} bottomBar={<MyBottomBar />}>
 *     <Outlet />
 *   </AppShell>
 */

import { useState, useRef, useCallback, useEffect, type ReactNode } from 'react'
import { cn } from '../lib/utils'

// ── Constants ────────────────────────────────────────────────────────────────
const SIDEBAR_EXPANDED_DEFAULT = 220
const SIDEBAR_COLLAPSED_WIDTH  = 48
const SIDEBAR_MIN_WIDTH        = 180
const SIDEBAR_MAX_WIDTH        = 320
const SIDEBAR_STORAGE_KEY      = 'bp:sidebar:width'
const SIDEBAR_OPEN_KEY         = 'bp:sidebar:open'

// ── Context ──────────────────────────────────────────────────────────────────
import { createContext, useContext } from 'react'

interface AppShellCtx {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  sidebarWidth: number
  isMobile: boolean
  mobileOpen: boolean
  setMobileOpen: (v: boolean) => void
}

const Ctx = createContext<AppShellCtx | null>(null)

export function useAppShell() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAppShell must be used inside <AppShell>')
  return ctx
}

// ── Root ─────────────────────────────────────────────────────────────────────
interface AppShellProps {
  /** Left sidebar content */
  sidebar: ReactNode
  /** Top bar content */
  topBar?: ReactNode
  /** Persistent bottom bar (Spotify-style context bar) */
  bottomBar?: ReactNode
  /** Page content */
  children: ReactNode
  /** Extra class on the outer wrapper */
  className?: string
  /** Theme: 'dark' (BICC) | 'light' (Admin) | 'system' (Planner) */
  theme?: 'dark' | 'light' | 'system'
}

export function AppShell({
  sidebar,
  topBar,
  bottomBar,
  children,
  className,
  theme = 'system',
}: AppShellProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_OPEN_KEY) === 'false' } catch { return false }
  })
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    try { return parseInt(localStorage.getItem(SIDEBAR_STORAGE_KEY) ?? '') || SIDEBAR_EXPANDED_DEFAULT } catch { return SIDEBAR_EXPANDED_DEFAULT }
  })

  // Mobile detection
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    setIsMobile(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Persist sidebar state
  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_OPEN_KEY, String(!collapsed))
      if (!collapsed) localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarWidth))
    } catch {}
  }, [collapsed, sidebarWidth])

  // Close mobile sidebar on nav
  useEffect(() => {
    if (!isMobile) setMobileOpen(false)
  }, [isMobile])

  // Resize drag handle
  const dragging = useRef(false)
  const startX   = useRef(0)
  const startW   = useRef(0)

  const onResizeStart = useCallback((e: React.MouseEvent) => {
    dragging.current = true
    startX.current   = e.clientX
    startW.current   = sidebarWidth
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return
      const delta = ev.clientX - startX.current
      const next  = Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, startW.current + delta))
      setSidebarWidth(next)
    }
    const onUp = () => {
      dragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [sidebarWidth])

  const effectiveWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : sidebarWidth
  const hasBottomBar   = !!bottomBar

  return (
    <Ctx.Provider value={{ collapsed, setCollapsed, sidebarWidth, isMobile, mobileOpen, setMobileOpen }}>
      <div
        className={cn('bp-shell', className)}
        data-theme={theme}
        style={{
          display: 'flex',
          height: '100dvh',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* ── Desktop sidebar ─────────────────────────────────────────── */}
        {!isMobile && (
          <aside
            className="bp-shell__sidebar"
            style={{
              width: effectiveWidth,
              minWidth: effectiveWidth,
              maxWidth: effectiveWidth,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              flexShrink: 0,
              transition: collapsed ? 'width 180ms ease, min-width 180ms ease, max-width 180ms ease' : undefined,
              position: 'relative',
            }}
          >
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {sidebar}
            </div>

            {/* Resize handle */}
            {!collapsed && (
              <div
                onMouseDown={onResizeStart}
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 4,
                  height: '100%',
                  cursor: 'col-resize',
                  zIndex: 10,
                  opacity: 0,
                  transition: 'opacity 150ms',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                className="bp-resize-handle"
              />
            )}
          </aside>
        )}

        {/* ── Mobile sidebar overlay ───────────────────────────────────── */}
        {isMobile && mobileOpen && (
          <>
            <div
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 40,
                background: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(4px)',
              }}
            />
            <aside
              className="bp-shell__sidebar bp-shell__sidebar--mobile"
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: SIDEBAR_EXPANDED_DEFAULT,
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {sidebar}
            </aside>
          </>
        )}

        {/* ── Main column ─────────────────────────────────────────────── */}
        <div
          className="bp-shell__main-col"
          style={{
            flex: 1,
            minWidth: 0,           // prevents flex children from overflowing
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            height: '100%',
          }}
        >
          {/* Top bar */}
          {topBar && (
            <header
              className="bp-shell__topbar"
              style={{ flexShrink: 0 }}
            >
              {topBar}
            </header>
          )}

          {/* Scrollable content */}
          <main
            className="bp-shell__content"
            style={{
              flex: 1,
              minHeight: 0,          // allows flex child to scroll
              overflow: 'auto',
              paddingBottom: hasBottomBar ? '4.5rem' : undefined,
            }}
          >
            {children}
          </main>

          {/* Bottom bar */}
          {bottomBar && (
            <div
              className="bp-shell__bottombar bottom-bar-host"
              style={{ flexShrink: 0 }}
            >
              {bottomBar}
            </div>
          )}
        </div>
      </div>
    </Ctx.Provider>
  )
}

// ── Sidebar building blocks ───────────────────────────────────────────────────

interface SidebarHeaderProps {
  logo: ReactNode
  title: string
  subtitle?: string
  /** Injected by AppShell automatically when used inside it */
  onToggle?: () => void
}

export function SidebarHeader({ logo, title, subtitle }: SidebarHeaderProps) {
  const { collapsed, setCollapsed } = useAppShell()
  return (
    <div
      className="bp-sidebar-header"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 12px',
        height: 56,
        flexShrink: 0,
        borderBottom: '1px solid var(--sidebar-border, rgba(255,255,255,0.07))',
        overflow: 'hidden',
      }}
    >
      <div style={{ flexShrink: 0 }}>{logo}</div>
      {!collapsed && (
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <p style={{ fontWeight: 800, fontSize: 13, margin: 0, lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {title}
          </p>
          {subtitle && (
            <p style={{ fontSize: 9, margin: '3px 0 0', opacity: 0.4, letterSpacing: '0.12em', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="bp-sidebar-toggle tap-target"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        style={{
          marginLeft: collapsed ? 'auto' : undefined,
          flexShrink: 0,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 4,
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.4,
          transition: 'opacity 150ms',
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.9')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '0.4')}
      >
        {/* Hamburger icon — 3 lines */}
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <rect x="0" y="2" width="14" height="1.5" rx="0.75"/>
          <rect x="0" y="6.25" width={collapsed ? 14 : 10} height="1.5" rx="0.75"/>
          <rect x="0" y="10.5" width="14" height="1.5" rx="0.75"/>
        </svg>
      </button>
    </div>
  )
}

interface SidebarNavItem {
  id: string
  icon: React.ElementType
  label: string
  badge?: number | string
  onClick?: () => void
  active?: boolean
  href?: string
}

interface SidebarNavSection {
  label?: string
  items: SidebarNavItem[]
}

interface SidebarNavProps {
  sections: SidebarNavSection[]
  activeId?: string
  onSelect?: (id: string) => void
  accentColor?: string
}

export function SidebarNav({ sections, activeId, onSelect, accentColor = 'hsl(var(--bp-cyan))' }: SidebarNavProps) {
  const { collapsed } = useAppShell()

  return (
    <nav
      style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: collapsed ? '8px 6px' : '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
      className="scrollbar-none"
    >
      {sections.map((section, si) => (
        <div key={si} style={{ marginBottom: collapsed ? 0 : 6 }}>
          {/* Section label — hidden when collapsed */}
          {section.label && !collapsed && (
            <p style={{
              fontSize: 9,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              opacity: 0.3,
              padding: '6px 10px 2px',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {section.label}
            </p>
          )}

          {section.items.map((item) => {
            const isActive = activeId === item.id || item.active
            const Icon = item.icon

            return (
              <button
                key={item.id}
                onClick={() => { item.onClick?.(); onSelect?.(item.id) }}
                title={collapsed ? item.label : undefined}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: collapsed ? '10px 0' : '8px 10px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: 8,
                  border: 'none',
                  background: isActive ? `color-mix(in srgb, ${accentColor} 14%, transparent)` : 'transparent',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 120ms, color 120ms',
                  minHeight: 36,
                  minWidth: 0,
                  textAlign: 'left',
                }}
                className="tap-target"
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)' }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                {/* Active indicator line */}
                {isActive && !collapsed && (
                  <span style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 3,
                    height: 18,
                    borderRadius: 2,
                    background: accentColor,
                    flexShrink: 0,
                  }} />
                )}

                <Icon
                  size={16}
                  strokeWidth={isActive ? 2.2 : 1.7}
                  style={{
                    flexShrink: 0,
                    color: isActive ? accentColor : 'currentColor',
                    opacity: isActive ? 1 : 0.45,
                    transition: 'color 120ms, opacity 120ms',
                  }}
                />

                {/* Label + badge — hidden when collapsed */}
                {!collapsed && (
                  <>
                    <span style={{
                      flex: 1,
                      minWidth: 0,
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      opacity: isActive ? 1 : 0.6,
                      transition: 'opacity 120ms',
                      color: isActive ? accentColor : 'inherit',
                    }}>
                      {item.label}
                    </span>
                    {item.badge !== undefined && (
                      <span style={{
                        flexShrink: 0,
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: 9999,
                        background: `color-mix(in srgb, ${accentColor} 18%, transparent)`,
                        color: accentColor,
                        minWidth: 18,
                        textAlign: 'center',
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}

                {/* Collapsed badge dot */}
                {collapsed && item.badge !== undefined && (
                  <span style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'hsl(var(--bp-danger))',
                  }} />
                )}
              </button>
            )
          })}
        </div>
      ))}
    </nav>
  )
}

interface SidebarFooterProps {
  avatar?: string
  name: string
  email?: string
  onLogout?: () => void
}

export function SidebarFooter({ avatar, name, email, onLogout }: SidebarFooterProps) {
  const { collapsed } = useAppShell()
  const initials = name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

  return (
    <div style={{
      flexShrink: 0,
      padding: '8px 6px',
      borderTop: '1px solid var(--sidebar-border, rgba(255,255,255,0.07))',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      overflow: 'hidden',
    }}>
      {/* Avatar */}
      <div style={{
        width: 30,
        height: 30,
        borderRadius: 8,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        fontWeight: 700,
        background: 'linear-gradient(135deg, hsl(var(--bp-navy)), hsl(var(--bp-teal)))',
        color: '#fff',
        overflow: 'hidden',
      }}>
        {avatar ? <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
      </div>

      {!collapsed && (
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
            {name}
          </p>
          {email && (
            <p style={{ margin: 0, fontSize: 10, opacity: 0.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4 }}>
              {email}
            </p>
          )}
        </div>
      )}

      {!collapsed && onLogout && (
        <button
          onClick={onLogout}
          aria-label="Sign out"
          style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', opacity: 0.3, padding: 4, borderRadius: 4, transition: 'opacity 120ms', display: 'flex' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.8')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '0.3')}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      )}
    </div>
  )
}

// ── Top bar building blocks ───────────────────────────────────────────────────
interface TopBarProps {
  left?: ReactNode
  center?: ReactNode
  right?: ReactNode
  className?: string
  style?: React.CSSProperties
  mobileMenuButton?: boolean
}

export function TopBar({ left, center, right, className, style, mobileMenuButton = true }: TopBarProps) {
  const { setMobileOpen, isMobile } = useAppShell()
  return (
    <div
      className={cn('bp-topbar', className)}
      style={{
        display: 'flex',
        alignItems: 'center',
        height: 56,
        padding: '0 16px',
        gap: 12,
        flexShrink: 0,
        borderBottom: '1px solid var(--admin-nav-border, rgba(255,255,255,0.07))',
        ...style,
      }}
    >
      {/* Mobile hamburger */}
      {isMobile && mobileMenuButton && (
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="tap-target"
          style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, display: 'flex', padding: 4, flexShrink: 0 }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <rect x="0" y="2" width="18" height="2" rx="1"/>
            <rect x="0" y="8" width="13" height="2" rx="1"/>
            <rect x="0" y="14" width="18" height="2" rx="1"/>
          </svg>
        </button>
      )}

      {left && <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>{left}</div>}
      {center && <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{center}</div>}
      {right && <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto', flexShrink: 0 }}>{right}</div>}
    </div>
  )
}

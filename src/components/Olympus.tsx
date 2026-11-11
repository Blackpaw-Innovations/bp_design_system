/**
 * Olympus component kit (Wave 0b, 12 Nov 2026). Styles: tokens/olympus-kit.css. Docs: docs/OLYMPUS_KIT.md.
 *
 * Replicates the approved renders 1:1 (olympus-renders/build/olympus-kit.reference.css). Light is the default;
 * `dk` on the screen root is dark mode. No colours here: every colour is an --ol-* token in the CSS.
 *
 *   Mast, Kpi            page header with its own sky band and KPI strip
 *   Hero                 the night stage panel (night in both modes)
 *   Card, CardTitle, Row solid card, its title, a list row
 *   Pills, FilterPills   tabs (the selected pill glides) and filter pills
 *   Chip                 neutral, ok, warn, bad, info
 *   OlAvatar, HermesMark profile circle, and Hermes's sparkle in the LED ring
 *   NeedsYou             the turning LED ring around whatever waits for this person
 *   Ring, Bar            progress
 *   Callout, AppTile     a decision the person owns; an app's photo tile
 */
import { useLayoutEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '../lib/utils'
import { stars } from '../lib/stars'
import { initials } from './Data'

/* ─────────── Mast ─────────── */

export interface Kpi {
  /** The figure. Pass `<>121<small>/140</small></>` for a dimmed denominator. */
  value: ReactNode
  label: ReactNode
  /** Small note under the label. A string starting with "-" (or "−") shows red, without the sign. */
  note?: ReactNode
}

export interface MastProps {
  /** Title, weight 200. Put the second part in `strong` (weight 500), as the renders do: "Team **board**". */
  title: ReactNode
  strong?: ReactNode
  sub?: ReactNode
  /** Right-hand slot: actions, a status chip. */
  right?: ReactNode
  kpis?: Kpi[]
  /** App photo for the band (dark scrim over it, in both modes). Without it: day sky in light mode, night in dark. */
  photo?: string
  /** One craft object per page, placed clear of the text. Not drawn over a photo. */
  craft?: string
  /** Star seed: the renders use the screen's name. Same seed → same sky. */
  seed?: string
  className?: string
}

/** The renders draw the band's stars at 1280 × 360 (shell.py `sky(…, 360, …)`). */
const BAND_W = 1280, BAND_H = 360

function kpiNote(note: ReactNode) {
  if (typeof note === 'string' && /^[-−]/.test(note)) return <em className="ol-down">{note.slice(1).trimStart()}</em>
  return note == null || note === '' ? null : <em>{note}</em>
}

export function Mast({ title, strong, sub, right, kpis, photo, craft, seed = 'Olympus', className }: MastProps) {
  const filter = `m${seed.replace(/[^\w-]/g, '')}`
  return (
    <header className={cn('ol-mast', photo && 'ol-mast-photo', className)}>
      {photo ? (
        <div className="ol-mast-bg ol-sky ol-sky-photo" aria-hidden="true"><img src={photo} alt="" /><span className="ol-scrim" /></div>
      ) : (
        <div className="ol-mast-bg ol-sky ol-sky-day" aria-hidden="true">
          <span className="ol-mast-stars ol-mast-stars-day" dangerouslySetInnerHTML={{ __html: stars(seed, BAND_W, BAND_H, { day: true, filterId: `${filter}d` }) }} />
          <span className="ol-mast-stars ol-mast-stars-night" dangerouslySetInnerHTML={{ __html: stars(seed, BAND_W, BAND_H, { filterId: `${filter}n` }) }} />
          {craft && <img className="ol-craft" src={craft} alt="" />}
        </div>
      )}
      <div className="ol-mast-head">
        <div className="ol-mast-t">
          <h1 className="ol-title">{title}{strong != null && <> <span>{strong}</span></>}</h1>
          {sub && <span className="ol-mast-sub">{sub}</span>}
        </div>
        {right && <div className="ol-mast-right">{right}</div>}
      </div>
      {kpis && kpis.length > 0 && (
        <div className="ol-kpis">
          {kpis.map((k, i) => (
            <div className="ol-kpi" key={i}><b>{k.value}</b><span>{k.label}</span>{kpiNote(k.note)}</div>
          ))}
        </div>
      )}
    </header>
  )
}

/* ─────────── Hero ─────────── */

let heroStars: string | undefined
/** night.py: the hero panel's stars are stars('hero-panel', 900, 300, 1 constellation, filter 'h') as a background image. */
const heroStarsUrl = () => (heroStars ??= `url("data:image/svg+xml,${encodeURIComponent(stars('hero-panel', 900, 300, { constellations: 1, filterId: 'h' }))}")`)

export interface HeroFigure { value: ReactNode; label: ReactNode }

export interface HeroProps {
  /** Small label above the title (the renders' `.lbl`), e.g. the date. */
  kicker?: ReactNode
  /** Weight 200; `strong` follows at weight 500. Use a `<br />` inside `title` to break before it. */
  title: ReactNode
  strong?: ReactNode
  /** A status chip above the title. */
  chip?: ReactNode
  sub?: ReactNode
  figures?: HeroFigure[]
  /** Buttons. On the night panel the primary is white, the secondary outlined. */
  actions?: ReactNode
  craft?: string
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

/** The night stage panel. Night in both modes: it carries `dk`, so everything inside takes its dark values. */
export function Hero({ kicker, title, strong, chip, sub, figures, actions, craft, children, className, style }: HeroProps) {
  return (
    <section className={cn('ol-hero dk', className)} style={{ ['--ol-hero-stars' as string]: heroStarsUrl(), ...style }}>
      {craft && <img className="ol-hcraft" src={craft} alt="" />}
      <div className="ol-hero-lead">
        {chip}
        {kicker && <span className="ol-lbl">{kicker}</span>}
        <h1 className="ol-h1">{title}{strong != null && <> <span>{strong}</span></>}</h1>
        {sub && <span className="ol-hero-sub">{sub}</span>}
        {children}
      </div>
      {figures && figures.length > 0 && (
        <div className="ol-figs">{figures.map((f, i) => <div className="ol-fig" key={i}><b>{f.value}</b><span>{f.label}</span></div>)}</div>
      )}
      {actions && <div className="ol-hero-acts">{actions}</div>}
    </section>
  )
}

/* ─────────── Card, CardTitle, Row ─────────── */

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'section' | 'div' | 'article' | 'aside' | 'li'
  /** Selected or locked: the inverted card (night on light pages, light on dark). */
  selected?: boolean
  /** Lifts 2 px on hover with a deeper shadow and a darker hairline. */
  interactive?: boolean
}

export function Card({ as: Tag = 'section', selected, interactive, className, ...rest }: CardProps) {
  return <Tag className={cn('ol-card ol-select', interactive && 'ol-lift ol-press', selected && 'ol-sel', className)} {...rest} />
}

export function CardTitle({ className, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('ol-h2', className)} {...rest} />
}

export interface RowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode
  /** The light line under the title. */
  detail?: ReactNode
  left?: ReactNode
  right?: ReactNode
  selected?: boolean
}

export function Row({ title, detail, left, right, selected, className, ...rest }: RowProps) {
  return (
    <div className={cn('ol-row ol-select', selected && 'ol-sel', className)} {...rest}>
      {left}
      <div className="ol-row-tx"><span className="ol-med">{title}</span>{detail && <span className="ol-light">{detail}</span>}</div>
      {right}
    </div>
  )
}

/* ─────────── Pills and filter pills ─────────── */

export interface PillItem { id: string; label: ReactNode; href?: string }

export interface PillsProps {
  items: PillItem[]
  value: string
  onChange?: (id: string) => void
  /** Accessible name of the tab list. */
  label: string
  className?: string
}

/** Tabs. Selected = the theme's dark purple; the pill glides to the new tab (motion: ol-glide). */
export function Pills({ items, value, onChange, label, className }: PillsProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [glide, setGlide] = useState<{ x: number; w: number } | null>(null)
  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return
    const measure = () => {
      const el = root.querySelector<HTMLElement>('[aria-current],[aria-selected="true"]')
      setGlide((p) => (!el ? null : p && p.x === el.offsetLeft && p.w === el.offsetWidth ? p : { x: el.offsetLeft, w: el.offsetWidth }))
    }
    measure()
    // Widths change when the font arrives or the labels change.
    const ro = new ResizeObserver(measure)
    ro.observe(root)
    return () => ro.disconnect()
  }, [value, items])
  return (
    <div ref={ref} className={cn('ol-pills', className)} role={items.some((i) => i.href) ? undefined : 'tablist'} aria-label={label} data-glide={glide ? '' : undefined}>
      {glide && <span className="ol-pill-glider ol-glide" style={{ width: glide.w, transform: `translateX(${glide.x}px)` }} />}
      {items.map((it) => {
        const on = it.id === value
        return it.href
          ? <a key={it.id} className="ol-pill" href={it.href} aria-current={on ? 'page' : undefined} onClick={() => onChange?.(it.id)}>{it.label}</a>
          : <button key={it.id} type="button" className="ol-pill" role="tab" aria-selected={on} onClick={() => onChange?.(it.id)}>{it.label}</button>
      })}
    </div>
  )
}

export interface FilterPillsProps {
  items: { id: string; label: ReactNode }[]
  value: string
  onChange: (id: string) => void
  label: string
  className?: string
}

export function FilterPills({ items, value, onChange, label, className }: FilterPillsProps) {
  return (
    <div className={cn('ol-fpills', className)} role="group" aria-label={label}>
      {items.map((it) => (
        <button key={it.id} type="button" className="ol-fpill ol-select" aria-pressed={it.id === value} onClick={() => onChange(it.id)}>{it.label}</button>
      ))}
    </div>
  )
}

/* ─────────── Chip ─────────── */

export type OlChipTone = 'neutral' | 'ok' | 'warn' | 'bad' | 'info'

export function Chip({ tone = 'neutral', className, ...rest }: HTMLAttributes<HTMLSpanElement> & { tone?: OlChipTone }) {
  return <span className={cn('ol-chip', tone !== 'neutral' && `ol-${tone}`, className)} {...rest} />
}

/* ─────────── Profile circle, Hermes, needs-you ─────────── */

export interface OlAvatarProps {
  /** Full name: the circle shows 1–2 initials. */
  name: string
  src?: string
  /** Diameter in px. The renders use 30–34 in cards, 44 in headers. Default 32. */
  size?: number
  className?: string
}

/** Profile circle: night radial gradient, fine light ring, white initials. Same look for everyone. */
export function OlAvatar({ name, src, size = 32, className }: OlAvatarProps) {
  return (
    <span className={cn('ol-av', className)} style={{ width: size, height: size, fontSize: Math.round(size * 0.41) }} role="img" aria-label={name}>
      {src ? <img src={src} alt="" /> : initials(name)}
    </span>
  )
}

export interface HermesMarkProps {
  /** Default 44 (the top-bar button). */
  size?: number
  /** Hermes is waiting for this person: the ring turns. Otherwise it is still. */
  needsYou?: boolean
  /** Force the night look (on a night band or the hero). By default it follows the mode: day in light, night in dark. */
  night?: boolean
  label?: string
  className?: string
}

/** Hermes's sparkle inside the conic LED ring (the renders' `.hermes`). */
export function HermesMark({ size = 44, needsYou, night, label = 'Hermes', className }: HermesMarkProps) {
  const icon = Math.round(size * 0.45)
  return (
    <span className={cn('ol-hermes', needsYou ? 'ol-glow' : 'ol-led', night && 'ol-hermes-night', className)}
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.27) }} role="img" aria-label={label}>
      <svg width={icon} height={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
      </svg>
    </span>
  )
}

export interface NeedsYouProps {
  children: ReactNode
  /** Off: no ring (render the child as is). Default on. */
  active?: boolean
  /** Corner radius of the wrapped thing. Default 18 (an app tile). */
  radius?: number
  /** How far the ring sits outside it. Default 4 (the renders' tile ring). */
  gap?: number
  className?: string
}

/** The conic LED ring, one turn every 5 s, around something waiting for this person. Still under reduced motion. */
export function NeedsYou({ children, active = true, radius = 18, gap = 4, className }: NeedsYouProps) {
  if (!active) return <>{children}</>
  const style = { borderRadius: radius, ['--ol-glow-inset' as string]: `${-gap}px`, ['--ol-glow-radius' as string]: `${radius + gap}px` }
  return <div className={cn('ol-needs ol-glow', className)} style={style}>{children}</div>
}

/* ─────────── Ring and bar ─────────── */

export interface RingProps {
  value: number
  total?: number
  /** Default 22 (the renders' inline ring). */
  size?: number
  stroke?: number
  /** Centre label, e.g. "2/4". */
  label?: ReactNode
  /** Ring colour; default currentColor. Use a token, e.g. 'var(--ol-success)'. */
  color?: string
  className?: string
}

/** SVG progress ring (screens.py `ring()`): faint track, round-capped arc from 12 o'clock. */
export function Ring({ value, total = 1, size = 22, stroke = 2.5, label, color, className }: RingProps) {
  const r = (size - stroke * 1.6) / 2
  const c = 2 * Math.PI * r
  const part = total ? Math.min(1, Math.max(0, value / total)) : 0
  return (
    <span className={cn('ol-ring', className)} style={{ width: size, height: size, color }} role="img" aria-label={`${Math.round(part * 100)}%`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r.toFixed(2)} fill="none" stroke="currentColor" strokeOpacity=".22" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r.toFixed(2)} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${(c * part).toFixed(2)} ${c.toFixed(2)}`} />
      </svg>
      {label != null && <span className="ol-ring-label">{label}</span>}
    </span>
  )
}

export interface BarProps {
  value: number
  total?: number
  tone?: 'accent' | 'ok' | 'warn' | 'bad'
  label?: string
  className?: string
}

export function Bar({ value, total = 1, tone = 'accent', label, className }: BarProps) {
  const pct = total ? Math.min(100, Math.max(0, (value / total) * 100)) : 0
  return (
    <span className={cn('ol-bar', className)} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label={label}>
      <i className={tone === 'accent' ? undefined : `ol-${tone}`} style={{ width: `${pct}%` }} />
    </span>
  )
}

/* ─────────── Callout and app tile ─────────── */

export interface CalloutProps {
  title: ReactNode
  children?: ReactNode
  /** The square mark on the left. Default ✓. */
  mark?: ReactNode
  className?: string
}

/** A decision the person owns ("This one is yours to decide"). */
export function Callout({ title, children, mark = '✓', className }: CalloutProps) {
  return (
    <aside className={cn('ol-callout', className)}>
      <span className="ol-count" aria-hidden="true">{mark}</span>
      <div className="ol-callout-tx"><span className="ol-heavy">{title}</span>{children && <span className="ol-light">{children}</span>}</div>
    </aside>
  )
}

export interface AppTileProps {
  name: string
  image: string
  /** Shown on hover or keyboard focus, in place of the name. */
  details?: ReactNode
  /** Coral count of things waiting in this app. */
  badge?: number
  href?: string
  onClick?: () => void
  /** Show the hover look without hovering (the renders' `.atile.hov`). */
  hovered?: boolean
  className?: string
}

/** 16:10 app photo with its name; on hover it grows and shows the details. */
export function AppTile({ name, image, details, badge, href, onClick, hovered, className }: AppTileProps) {
  const body = (
    <>
      <img src={image} alt="" />
      {badge ? <span className="ol-atile-badge">{badge}</span> : null}
      <span className="ol-atile-nm">{name}</span>
      {details && <div className="ol-atile-det"><b>{name}</b><span>{details}</span></div>}
    </>
  )
  const cls = cn('ol-atile', hovered && 'ol-hov', className)
  const aria = badge ? `${name}, ${badge} waiting` : name
  if (href) return <a className={cls} href={href} onClick={onClick} aria-label={aria}>{body}</a>
  return <button type="button" className={cls} onClick={onClick} aria-label={aria}>{body}</button>
}

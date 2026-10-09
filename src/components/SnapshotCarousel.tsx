import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { cn } from '../lib/utils'

/**
 * SnapshotCarousel: the Home snapshot (standards §5a, ruled 9 Oct 2026).
 * Reference render: Hakiqa Business Snapshot.dc.html.
 *
 *   - Up to 4 named pages of up to 3 cards. Empty pages are dropped; "Needs you" goes first.
 *   - Desktop/tablet: 3 cards per page, arrows move a page.
 *   - Phone (< 600px): one card per swipe, next card peeks, arrows move a card.
 *   - Native swipe via CSS scroll-snap; arrow keys when focused; no autoplay.
 *   - Flat --identity surface, white text; colour only in 9px dots and chart fills.
 * Styles: tokens/guardrails.css §8.
 */

export type SnapshotTone = 'neutral' | 'attention' | 'positive'

export type SnapshotChart =
  /** Horizontal bars, e.g. arrears by days past due. pct is 0–100 of the track. */
  | { kind: 'bars'; rows: { label: string; value: string; pct: number; tone?: SnapshotTone }[] }
  /** One split bar with a legend, e.g. occupancy. */
  | { kind: 'split'; segments: { label: string; n: number; tone?: SnapshotTone }[] }
  /** Up to 5 columns, e.g. enquiries by stage. */
  | { kind: 'columns'; columns: { label: string; n: number; tone?: SnapshotTone }[] }

export interface SnapshotCard {
  id: string
  /** Sentence case, own line: "Rent and service charge owed". */
  label: string
  /** Pre-formatted figure. Use fmtKM for large amounts ("192.5M"); full amounts belong on the detail page. */
  value: string
  /** Small unit before the value: "KES". */
  unit?: string
  /** One line under the figure. Stays white; tone shows as a dot. */
  note?: string
  tone?: SnapshotTone
  chart?: SnapshotChart
  /** Where the card goes (its list). */
  href?: string
}

export interface SnapshotPage {
  /** What the page is about: "Needs you", "Money", "Space", "Leasing". */
  title: string
  cards: SnapshotCard[]
  /** The one primary action for this page. */
  action: { label: string; onClick?: () => void; href?: string }
}

export interface SnapshotCarouselProps {
  pages: SnapshotPage[]
  /** "Show all 12" target: the full list on its own page. */
  showAllHref?: string
  /** Rendered as a link; pass your router's Link if you need client navigation. */
  renderLink?: (props: { href: string; className?: string; children: ReactNode; 'aria-label'?: string }) => ReactNode
  eyebrow?: string
  className?: string
}

// Vite sets import.meta.env.DEV; anywhere else the dev warnings stay off.
const dev = (import.meta as { env?: { DEV?: boolean } }).env?.DEV === true
const warn = (m: string) => { if (dev) console.warn(`[@blackpaw/ui] SnapshotCarousel: ${m}`) }
const PHONE = '(max-width: 599px)'

function useIsPhone() {
  const [phone, setPhone] = useState(() => typeof window !== 'undefined' && window.matchMedia(PHONE).matches)
  useEffect(() => {
    const mq = window.matchMedia(PHONE)
    const on = () => setPhone(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return phone
}

function Dot({ tone }: { tone?: SnapshotTone }) {
  if (!tone || tone === 'neutral') return null
  return <i className="bp-snap-dot" data-tone={tone} aria-hidden="true" />
}

function Chart({ chart }: { chart: SnapshotChart }) {
  if (chart.kind === 'bars') {
    return (
      <div className="bp-snap-bars">
        {chart.rows.map((r) => (
          <div key={r.label}>
            <p><span>{r.label}</span><b>{r.value}</b></p>
            <span className="track"><span className="fill" data-tone={r.tone ?? 'neutral'} style={{ width: `${Math.max(0, Math.min(100, r.pct))}%` }} /></span>
          </div>
        ))}
      </div>
    )
  }
  if (chart.kind === 'split') {
    const total = chart.segments.reduce((a, s) => a + Math.max(0, s.n), 0) || 1
    return (
      <div className="bp-snap-split">
        <span className="bar" role="img" aria-label={chart.segments.map((s) => `${s.n} ${s.label}`).join(', ')}>
          {chart.segments.filter((s) => s.n > 0).map((s) => <span key={s.label} data-tone={s.tone ?? 'neutral'} style={{ width: `${(s.n / total) * 100}%` }} />)}
        </span>
        <ul>{chart.segments.map((s) => <li key={s.label}><i data-tone={s.tone ?? 'neutral'} aria-hidden="true" /><b>{s.n}</b>{s.label}</li>)}</ul>
      </div>
    )
  }
  const cols = chart.columns.slice(0, 5)
  if (chart.columns.length > 5) warn('columns chart shows 5 columns at most.')
  const max = Math.max(1, ...cols.map((c) => c.n))
  return (
    <div className="bp-snap-cols" role="img" aria-label={cols.map((c) => `${c.n} ${c.label}`).join(', ')}>
      {cols.map((c) => (
        <div key={c.label}>
          <b>{c.n}</b>
          <span data-tone={c.tone ?? 'neutral'} style={{ height: `calc(var(--snap-col-h) * ${Math.max(0.1, c.n / max)})` }} />
          <small>{c.label}</small>
        </div>
      ))}
    </div>
  )
}

export function SnapshotCarousel({ pages: input, showAllHref, renderLink, eyebrow = 'Business snapshot', className }: SnapshotCarouselProps) {
  const pages = input.filter((p) => p.cards.length > 0).slice(0, 4)
  if (input.length > 4) warn('more than 4 pages; showing the first 4. Put the rest behind "Show all".')
  pages.forEach((p) => { if (p.cards.length > 3) warn(`page "${p.title}" has ${p.cards.length} cards; showing 3.`) })
  const cards = pages.flatMap((p, pi) => p.cards.slice(0, 3).map((c, ci) => ({ ...c, pi, first: ci === 0 })))
  const total = cards.length

  const phone = useIsPhone()
  const track = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const page = cards[index]?.pi ?? 0

  const scrollToCard = useCallback((i: number) => {
    const el = track.current?.children[i] as HTMLElement | undefined
    if (!el || !track.current) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    track.current.scrollTo({ left: el.offsetLeft - track.current.offsetLeft, behavior: reduce ? 'auto' : 'smooth' })
  }, [])

  const firstOfPage = (p: number) => cards.findIndex((c) => c.pi === p)
  const go = useCallback((dir: 1 | -1) => {
    if (!total) return
    if (phone) scrollToCard((index + dir + total) % total)
    else scrollToCard(firstOfPage((page + dir + pages.length) % pages.length))
  }, [phone, index, page, total, pages.length, scrollToCard]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const el = track.current
    if (!el) return
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const kids = Array.from(el.children) as HTMLElement[]
        const left = el.scrollLeft + el.offsetLeft
        let best = 0
        kids.forEach((k, i) => { if (Math.abs(k.offsetLeft - left) < Math.abs(kids[best].offsetLeft - left)) best = i })
        setIndex(best)
      })
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => { el.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
  }, [])

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1) }
  }

  if (!total) return null
  const current = pages[page]
  const link = (href: string, children: ReactNode, cls?: string, label?: string) =>
    renderLink ? renderLink({ href, className: cls, children, 'aria-label': label }) : <a href={href} className={cls} aria-label={label}>{children}</a>
  const action = current.action.href
    ? link(current.action.href, current.action.label, 'bp-btn')
    : <button type="button" className="bp-btn" onClick={current.action.onClick}>{current.action.label}</button>
  const rangeLabel = phone ? `${index + 1} of ${total}` : `${firstOfPage(page) + 1}–${firstOfPage(page) + current.cards.slice(0, 3).length} of ${total}`

  const Arrow = ({ dir }: { dir: 1 | -1 }) => (
    <button type="button" className="bp-snap-arrow" onClick={() => go(dir)} aria-label={dir === 1 ? (phone ? 'Next card' : 'Next page') : (phone ? 'Previous card' : 'Previous page')}>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={dir === 1 ? 'm9 18 6-6-6-6' : 'm15 18-6-6 6-6'} /></svg>
    </button>
  )

  return (
    <section className={cn('bp-snap', className)} aria-roledescription="carousel" aria-label={eyebrow}>
      <header className="bp-snap-head">
        <div className="min-w-0">
          <p className="eyebrow">{eyebrow}{phone ? ` · ${current.title}` : ''}</p>
          {!phone && <h2>{current.title}</h2>}
        </div>
        <p className="range" aria-live="polite">{rangeLabel}</p>
        {!phone && <div className="arrows"><Arrow dir={-1} /><Arrow dir={1} /></div>}
      </header>

      <div className="bp-snap-track" ref={track} tabIndex={0} onKeyDown={onKey} aria-label={`${eyebrow} cards`}>
        {cards.map((c, i) => {
          const body = (
            <>
              <p className="label">{c.label}</p>
              <p className="value">{c.unit && <small>{c.unit}</small>}{c.value}</p>
              {c.note && <p className="note"><Dot tone={c.tone} />{c.note}</p>}
              {c.chart && <div className="chart"><Chart chart={c.chart} /></div>}
            </>
          )
          return (
            <article key={c.id} className="bp-snap-card" data-page-start={c.first || undefined} aria-roledescription="slide" aria-label={`${i + 1} of ${total}: ${c.label}`}>
              {c.href ? link(c.href, body, 'bp-snap-card-link') : body}
            </article>
          )
        })}
      </div>

      <footer className="bp-snap-foot">
        {phone && <Arrow dir={-1} />}
        <div className="dots">
          {pages.map((p, i) => (
            <button key={p.title} type="button" aria-label={`Show ${p.title}`} aria-current={i === page || undefined} onClick={() => scrollToCard(firstOfPage(i))}><span /></button>
          ))}
        </div>
        {phone && <Arrow dir={1} />}
        {!phone && showAllHref && link(showAllHref, `Show all ${total}`, 'bp-btn bp-snap-all')}
        {!phone && <span className="bp-snap-primary">{action}</span>}
      </footer>
      {phone && <div className="bp-snap-primary" data-full>{action}</div>}
    </section>
  )
}

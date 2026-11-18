import { useRef, useState, type ReactNode } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { IconButton } from './Guarded'
import type { RenderLink } from './PremiumKit'

/**
 * Spotlight (v1.32.0, 17 Nov 2026): one waiting thing as a coloured craft card. The colour says what kind of demand it
 * is: burgundy urgent, navy act today, olive coming up, cream good news (the one light card). It carries an orange
 * eyebrow, one heavy line that names the record ("Daniel Kiprop's glasses are ready"), one sentence, one button and a
 * craft object. `art` is the object's base path in the app ("/assets/objects/gears"); the app ships
 * `<art>-160.webp`, `-320.webp` and `-640.webp`. Home shows several in a SpotlightCarousel; a working page shows one.
 * Styles: tokens/spotlight.css.
 */
export type SpotlightTone = 'navy' | 'burgundy' | 'olive' | 'cream'

export interface SpotlightCardProps {
  tone?: SpotlightTone
  eyebrow: string
  title: string
  body?: ReactNode
  action: string
  href: string
  art: string
  renderLink?: RenderLink
  eager?: boolean
  className?: string
}

export function SpotlightCard({ tone = 'navy', eyebrow, title, body, action, href, art, renderLink, eager = false, className }: SpotlightCardProps) {
  const cta = <>{action}<ArrowRight size={18} aria-hidden="true" /></>
  return (
    <section className={['bp-spot', className].filter(Boolean).join(' ')} data-tone={tone} aria-label={`${eyebrow}: ${title}`}>
      <div className="bp-spot-body">
        <div>
          <div className="bp-spot-head"><span className="bp-spot-eyebrow">{eyebrow}</span></div>
          <h2 className="bp-spot-title">{title}</h2>
          {body && <p className="bp-spot-text">{body}</p>}
        </div>
        {renderLink ? renderLink({ href, className: 'bp-spot-cta', children: cta }) : <a href={href} className="bp-spot-cta">{cta}</a>}
      </div>
      <picture className="bp-spot-art" aria-hidden="true">
        <source media="(max-width: 639px)" srcSet={`${art}-160.webp 1x, ${art}-320.webp 2x`} type="image/webp" />
        <source srcSet={`${art}-320.webp 1x, ${art}-640.webp 2x`} type="image/webp" />
        <img src={`${art}-320.webp`} alt="" width={320} height={320} loading={eager ? 'eager' : 'lazy'} decoding="async" />
      </picture>
    </section>
  )
}

export interface SpotlightItem extends Omit<SpotlightCardProps, 'renderLink' | 'eager' | 'className'> { key: string }

const ORDER: Record<SpotlightTone, number> = { burgundy: 0, navy: 1, olive: 2, cream: 3 }
/** Most urgent first: burgundy, navy, olive, cream; the given order inside a colour. */
export const byUrgency = <T extends { tone?: SpotlightTone }>(items: T[]) => [...items].sort((a, b) => ORDER[a.tone ?? 'navy'] - ORDER[b.tone ?? 'navy'])

/** Home's carousel of spotlights: swipe on a phone, dots and arrows on a wider screen, no autoplay. Five at most. */
export function SpotlightCarousel({ items, renderLink, label = 'What needs you', max = 5 }: { items: SpotlightItem[]; renderLink?: RenderLink; label?: string; max?: number }) {
  const track = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const cards = items.slice(0, max)
  if (cards.length === 0) return null
  const go = (i: number) => track.current?.scrollTo({ left: i * track.current.clientWidth, behavior: 'smooth' })
  const step = (dir: 1 | -1) => go((active + dir + cards.length) % cards.length)
  return (
    <section className="bp-spot-carousel" aria-roledescription="carousel" aria-label={label}>
      <div ref={track} className="bp-spot-track" onScroll={(e) => setActive(Math.round(e.currentTarget.scrollLeft / Math.max(1, e.currentTarget.clientWidth)))}>
        {cards.map(({ key, ...card }, i) => (
          <div key={key} className="bp-spot-slide" aria-roledescription="slide" aria-label={`${i + 1} of ${cards.length}`}>
            <SpotlightCard {...card} renderLink={renderLink} eager={i === 0} />
          </div>
        ))}
      </div>
      {cards.length > 1 && (
        <div className="bp-spot-controls">
          <div className="bp-spot-dots">
            {cards.map((card, i) => (
              <button key={card.key} type="button" onClick={() => go(i)} aria-label={`Show ${i + 1} of ${cards.length}: ${card.title}`} aria-current={i === active}>
                <span data-on={i === active ? '' : undefined} />
              </button>
            ))}
          </div>
          <div className="bp-spot-arrows">
            <IconButton icon={ChevronLeft} label="Previous" onClick={() => step(-1)} />
            <IconButton icon={ChevronRight} label="Next" onClick={() => step(1)} />
          </div>
        </div>
      )}
    </section>
  )
}

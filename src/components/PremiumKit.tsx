import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight, Check, ChevronRight, Copy, Equal, MessageCircle, Sparkles } from 'lucide-react'
import { cn, type IconComponent } from '../lib/utils'
import { whatsAppLink } from '../lib/whatsapp'
import { formatMoney } from '../lib/format'
import { Avatar, initials } from './Data'
import { ButtonLink } from './Guarded'
import { Select } from './Select'
import { timeSlots } from './DatePicker'

/**
 * Premium patterns (v1.25.0, 3 Nov 2026): the phone look every Hakiqa vertical builds its screens from.
 * Spec: docs/PREMIUM_PATTERNS.md. Styles: tokens/premium-kit.css (`.bp-pk-*`). First built for Stay in hakiqa-connect.
 * One navy hero per screen, receipts as proof rows inside one quiet card per day, one "needs you" card that owns the
 * screen's orange action, a day-close card that shares to WhatsApp. Nothing here knows a domain: it is given names,
 * money, words and handlers. Links go through `href` + `renderLink` (the DataTable convention), so no router is needed.
 * Motion is CSS only and stands still under prefers-reduced-motion.
 */

/** Same shape as DataTable's: wrap an app router's Link around a DS link. Without it, a plain <a href>. */
export type RenderLink = (props: { href: string; className?: string; children: ReactNode; 'aria-label'?: string; 'data-tour'?: string }) => ReactNode

function LinkOrA({ href, renderLink, ...rest }: { href: string; renderLink?: RenderLink; className?: string; children: ReactNode; 'aria-label'?: string; 'data-tour'?: string }) {
  return renderLink ? <>{renderLink({ href, ...rest })}</> : <a href={href} {...rest} />
}

const prefersReducedMotion = () => typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)

/**
 * A number that counts to its new value (700 ms, exponential ease-out) on first show and whenever it changes.
 * Reduced motion: the final value at once. Read the real value from the caller, never from this (it is only paint).
 * A page in the background gets no animation frames, so a timer lands the figure on its value when the count should
 * be over: the hero never stays on an old number beside a list that already shows the new one.
 */
export function useCountUp(target: number, duration = 700): number {
  const [reduced] = useState(prefersReducedMotion)
  const [shown, setShown] = useState(0)
  const from = useRef(0)
  useEffect(() => {
    if (reduced) return
    const begin = from.current
    const start = performance.now()
    let frame = 0
    const land = () => { cancelAnimationFrame(frame); from.current = target; setShown(target) }
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const value = t === 1 ? target : begin + (target - begin) * (1 - 2 ** (-10 * t))
      from.current = value
      setShown(value)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    const timer = window.setTimeout(land, duration + 50)
    return () => { cancelAnimationFrame(frame); window.clearTimeout(timer) }
  }, [target, duration, reduced])
  return reduced ? target : shown
}

/**
 * Items that arrive while the screen is open: the ids not seen on first paint, for 2 s (then they are ordinary rows),
 * with a short buzz on phones that allow it. The first load never counts as an arrival.
 */
export function useArrivals<T extends string | number>(ids: T[], ready: boolean): Set<T> {
  const seen = useRef<Set<T> | null>(null)
  const latest = useRef(ids)
  latest.current = ids
  const [fresh, setFresh] = useState<Set<T>>(() => new Set())
  const key = ids.join(',')
  useEffect(() => {
    if (!ready) return
    const known = seen.current
    if (!known) { seen.current = new Set(latest.current); return }
    const added = latest.current.filter((id) => !known.has(id))
    added.forEach((id) => known.add(id))
    if (added.length === 0) return
    setFresh(new Set(added))
    try { navigator.vibrate?.(20) } catch { /* not allowed here: the tick is enough */ }
    const t = window.setTimeout(() => setFresh(new Set()), 2000)
    return () => window.clearTimeout(t)
  }, [key, ready])
  return fresh
}

/** Currency code and figure apart, for an amount that gets its own emphasis. Whole amounts drop the ".00". */
export function moneyParts(amount: number | null | undefined, currency?: string | null): { currency: string | null; figure: string } | null {
  if (amount == null || Number.isNaN(amount)) return null
  const whole = Number.isInteger(amount)
  return { currency: currency ?? null, figure: new Intl.NumberFormat('en-KE', { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 }).format(amount) }
}

/** Money at strength: currency 13/700 muted, figure 20/800 (17 in dense lists) tabular. A dash when there is no amount. */
export function MoneyFigure({ amount, currency, size = 20 }: { amount: number | null | undefined; currency?: string | null; size?: 17 | 20 }) {
  const parts = moneyParts(amount, currency)
  if (!parts) return <span className="bp-pk-muted">—</span>
  return (
    <span className="bp-pk-figure" data-size={size}>
      <span className="cur">{parts.currency}</span>
      <span className="num">{parts.figure}</span>
    </span>
  )
}

export interface StatStripItem { key: string; label: string; value: ReactNode; onClick?: () => void; href?: string }

/**
 * Two to four small figures side by side. On navy (inside a hero) everything is white; on a page it sits on a
 * hairline. An item with somewhere to go is a 44 px button with a chevron; one without is plain text.
 */
export function StatStrip({ items, onNavy = false, renderLink }: { items: StatStripItem[]; onNavy?: boolean; renderLink?: RenderLink }) {
  return (
    <dl className="bp-pk-strip" data-navy={onNavy || undefined} style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map((item) => {
        const body = (
          <>
            <dt>{item.label}{(item.onClick || item.href) && <ChevronRight size={14} aria-hidden="true" />}</dt>
            <dd>{item.value}</dd>
          </>
        )
        return item.href ? <LinkOrA key={item.key} href={item.href} renderLink={renderLink} className="bp-pk-strip-item">{body}</LinkOrA>
          : item.onClick ? <button key={item.key} type="button" onClick={item.onClick} className="bp-pk-strip-item">{body}</button>
          : <div key={item.key} className="bp-pk-strip-item">{body}</div>
      })}
    </dl>
  )
}

export interface HeroComparison { direction: 'up' | 'down' | 'same' | 'new'; text: string }

/**
 * The screen's one big number in money, on the navy hero card. The figure counts up on first show and on every
 * change; `floor` says "At least" when the total is a lower bound. `compare` says what it is measured against (only
 * when that is known for sure). `stats` is a StatStrip on navy along the bottom.
 */
export function MoneyHero({ amount, currency, caption, floor, compare, stats, renderLink, children }: {
  amount: number; currency?: string | null; caption: string; floor?: boolean; compare?: HeroComparison | null; stats?: StatStripItem[]; renderLink?: RenderLink; children?: ReactNode
}) {
  const shown = useCountUp(amount)
  const parts = moneyParts(Number.isInteger(amount) ? Math.round(shown) : shown, currency)
  return (
    <HeroCard spoken={`${floor ? 'At least ' : ''}${formatMoney(amount, currency)} ${caption}`} floor={floor} caption={caption} compare={compare} stats={stats} renderLink={renderLink}
      figure={<><span className="cur">{parts?.currency}</span><span className="num">{parts?.figure}</span></>}>
      {children}
    </HeroCard>
  )
}

/**
 * The same navy hero for a screen whose one number is a count ("5 of 17 free tonight", "12 jobs for today").
 * `title` names the record on a detail screen; a list screen leaves it out. `chip` is one white-on-fill line under the
 * caption, never coloured text. `headline` replaces the figure when the day's job is done ("Everyone is in.") with a
 * calm check; `progress` is a thin white bar (3 of 7 done).
 */
export function CountHero({ title, count = 0, caption, floor, headline, chip, progress, stats, renderLink, children }: {
  title?: string; count?: number; caption: string; floor?: boolean; headline?: string; chip?: ReactNode
  progress?: { done: number; total: number; label: string }; stats?: StatStripItem[]; renderLink?: RenderLink; children?: ReactNode
}) {
  const shown = Math.round(useCountUp(count))
  const share = progress && progress.total > 0 ? Math.min(1, progress.done / progress.total) : 0
  const figure = headline ? (
    <span className="bp-pk-headline">
      <span className="tick"><Check size={24} strokeWidth={2.5} /></span>
      <span>{headline}</span>
    </span>
  ) : <span className="num">{shown.toLocaleString('en-KE')}</span>
  return (
    <HeroCard title={title} spoken={headline ? `${headline} ${caption}` : `${floor ? 'At least ' : ''}${count} ${caption}`} floor={!headline && floor} caption={caption} chip={chip} stats={stats} renderLink={renderLink} figure={figure}>
      {progress && progress.total > 0 && (
        <div className="bp-pk-progress">
          <p>{progress.label}</p>
          <div aria-hidden="true" className="track"><div style={{ width: `${share * 100}%` }} /></div>
        </div>
      )}
      {children}
    </HeroCard>
  )
}

function HeroCard({ title, spoken, figure, caption, floor, compare, chip, stats, renderLink, children }: {
  title?: string; spoken: string; figure: ReactNode; caption: string; floor?: boolean; compare?: HeroComparison | null; chip?: ReactNode; stats?: StatStripItem[]; renderLink?: RenderLink; children?: ReactNode
}) {
  const Arrow = compare?.direction === 'up' ? ArrowUpRight : compare?.direction === 'down' ? ArrowDownRight : compare?.direction === 'new' ? Sparkles : Equal
  return (
    <header className="hero-card bp-pk-hero">
      {title && <p className="title">{title}</p>}
      <h1>
        <span className="bp-pk-sr">{spoken}</span>
        <span aria-hidden="true" className="body">
          {floor && <span className="floor">At least</span>}
          <span className="figure">{figure}</span>
          <span className="caption">{caption}</span>
        </span>
      </h1>
      {compare && <p className="bp-pk-pill"><Arrow size={15} aria-hidden="true" />{compare.text}</p>}
      {chip && <p className="bp-pk-pill" data-chip="">{chip}</p>}
      {children}
      {stats && stats.length > 0 && <div className="stats"><StatStrip items={stats} onNavy renderLink={renderLink} /></div>}
    </header>
  )
}

/**
 * A job finished: a green check that pops in once, what is now true ("Bay 3 is ready"), for whom, and what is next.
 * The check is still under reduced motion. Not for routine saves (a toast is).
 */
export function DoneCard({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <section className="bp-pk-card bp-pk-lead" role="status" aria-label={title}>
      <div className="row">
        <span className="bp-pk-pop"><Check size={22} strokeWidth={3} aria-hidden="true" /></span>
        <div className="text"><h2>{title}</h2>{children && <div className="why">{children}</div>}</div>
      </div>
      {action && <div className="action">{action}</div>}
    </section>
  )
}

/**
 * The moment after a decision that reaches a customer, in the sheet or row where it was made: a check, what happened
 * in one line, and the one follow-up as the card's blue (Send on WhatsApp). Calmer than DoneCard.
 */
export function DoneNote({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div role="status" className="bp-pk-note">
      <p className="title"><span aria-hidden="true" className="tick"><Check size={15} strokeWidth={3} /></span>{title}</p>
      {children && <p className="why">{children}</p>}
      {action && <div className="action">{action}</div>}
    </div>
  )
}

/**
 * A step that undoes or removes something (Cancel this order, Disconnect): red text, no fill, no border, at the bottom
 * of its sheet over a hairline. It always opens a confirm step; it never acts on the first tap.
 */
export function DangerAction({ icon: Icon, onClick, children }: { icon?: IconComponent; onClick: () => void; children: ReactNode }) {
  return (
    <div className="bp-pk-danger">
      <button type="button" onClick={onClick}>{Icon && <Icon size={17} aria-hidden="true" />}{children}</button>
    </div>
  )
}

/** A record's face in a list: its initials on a navy tile, ringed by how full it is (0..1; white on navy, no colour). */
export function InitialsTile({ name, filled }: { name: string; filled: number | null }) {
  const r = 21, c = 2 * Math.PI * r
  return (
    <span className="bp-pk-tile" aria-hidden="true">
      <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r={r} fill="none" stroke="currentColor" strokeOpacity=".22" strokeWidth="2.5" />
        {filled != null && filled > 0 && <circle cx="24" cy="24" r={r} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={`${c * Math.min(1, filled)} ${c}`} />}</svg>
      {initials(name)}
    </span>
  )
}

/** One "needs you" card: a glowing dot, what needs a person and why, and the screen's single orange action. */
export function NeedsYouCard({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <section className="bp-pk-card bp-pk-lead" aria-label={title}>
      <div className="row">
        <span aria-hidden="true" className="bp-pk-dot" />
        <div className="text"><h2>{title}</h2>{children && <div className="why">{children}</div>}</div>
      </div>
      {action && <div className="action">{action}</div>}
    </section>
  )
}

function GroupHead({ title, aside }: { title: string; aside?: ReactNode }) {
  return <div className="bp-pk-group-head"><h2>{title}</h2>{aside && <span className="aside">{aside}</span>}</div>
}

/**
 * A day's heading and its total over one quiet card of rows (ReceiptRow, TapRow). Never a card per row. Rows that
 * arrive while the screen is open slide in through their own `fresh` flag; the first paint does not animate.
 */
export function DayGroup({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="bp-pk-group" aria-label={title}>
      <GroupHead title={title} aside={aside} />
      <ul className="bp-pk-list">{children}</ul>
    </section>
  )
}

/** A titled group of TapRows in one quiet card, for lists that do not grow while you look. */
export function RowGroup({ title, aside, children }: { title?: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="bp-pk-group" aria-label={title}>
      {title && <GroupHead title={title} aside={aside} />}
      <ul className="bp-pk-list">{children}</ul>
    </section>
  )
}

/** A titled quiet card for content that is not rows (a history, a note). */
export function CardSection({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="bp-pk-group" aria-label={title}>
      <div className="bp-pk-group-head" data-tall=""><h2>{title}</h2>{aside}</div>
      <div className="bp-pk-card" data-flush="">{children}</div>
    </section>
  )
}

/** A reference code (M-Pesa, bank, order) as a quiet mono chip; tapping copies it and says so. 44 px hit area, 28 px chip. */
export function CodeChip({ label, value }: { label?: string; value: string }) {
  const [copied, setCopied] = useState(false)
  useEffect(() => { if (!copied) return; const t = window.setTimeout(() => setCopied(false), 1600); return () => window.clearTimeout(t) }, [copied])
  return (
    <button type="button" className="bp-pk-code" aria-label={`Copy ${label ? `${label} code ` : ''}${value}`}
      onClick={() => { void navigator.clipboard?.writeText(value).then(() => setCopied(true)).catch(() => undefined) }}>
      {label && <span className="label">{label}</span>}
      <span className="value">{value}</span>
      {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
      <span className="bp-pk-sr" aria-live="polite">{copied ? 'Copied' : ''}</span>
    </button>
  )
}

/**
 * Proof that money came in: who (calm initials avatar), how much at strength, when and for which record, and the
 * provider's code as a CodeChip. `status` is a chip for anything not final ("To confirm"). Not a link.
 * `as` / `rowProps` let an app swap the <li> for an animated one (e.g. motion's `m.li` with layout and exit).
 */
export function ReceiptRow({ name, avatarKey, amount, currency, meta, code, codeLabel, status, fresh, freshLabel = 'Just paid', as: Row = 'li', rowProps }: {
  name: string; avatarKey?: string; amount: number | null | undefined; currency?: string | null; meta: string; code?: string | null; codeLabel?: string; status?: ReactNode
  /** Just arrived while the screen is open (useArrivals): slides in, a soft green wash and a tick on the avatar for 2 s. */
  fresh?: boolean; freshLabel?: string
  as?: ElementType; rowProps?: Record<string, unknown>
}) {
  return (
    <Row {...rowProps} className="bp-pk-receipt" data-fresh={fresh || undefined}>
      <span className="lead">
        <Avatar calm name={name} id={avatarKey} />
        {fresh && <span className="badge"><Check size={12} strokeWidth={3} aria-hidden="true" /></span>}
      </span>
      <div className="body">
        <div className="line1"><p className="name">{name}</p><span className="amt"><MoneyFigure amount={amount} currency={currency} /></span></div>
        <div className="line2"><p className="meta">{meta}</p>{status}</div>
        {code && <div className="code"><CodeChip label={codeLabel} value={code} /></div>}
        {fresh && <span className="bp-pk-sr" role="status">{freshLabel}</span>}
      </div>
    </Row>
  )
}

/** The inside of a row that opens something: leading (avatar), title and sub, a figure, the chevron (only if it opens). */
function TapBody({ title, sub, figure, leading, opens = true }: { title: ReactNode; sub?: ReactNode; figure?: ReactNode; leading?: ReactNode; opens?: boolean }) {
  return (<>
    {leading}
    <span className="text"><span className="t">{title}</span>{sub && <span className="s">{sub}</span>}</span>
    {figure && <span className="fig">{figure}</span>}
    {opens && <ChevronRight size={18} aria-hidden="true" className="chev" />}
  </>)
}

/**
 * A row that opens its record: the whole row is the target, a chevron says so, a press darkens it. `href` navigates
 * (through `renderLink` for an app router); `onClick` opens a sheet and keeps the scroll. `after` is the row's one quick
 * action, under the row and outside its target. With neither it is the same row without the chevron or press state.
 * `id` lets a screen scroll to it; `glow` lights it for 2 s after it was just made or changed.
 */
export function TapRow({ href, onClick, renderLink, title, sub, figure, leading, label, after, tour, id, glow }: {
  href?: string; onClick?: () => void; renderLink?: RenderLink; title: ReactNode; sub?: ReactNode; figure?: ReactNode; leading?: ReactNode; label?: string; after?: ReactNode; tour?: string
  id?: string; glow?: boolean
}) {
  const body = <TapBody title={title} sub={sub} figure={figure} leading={leading} opens={Boolean(href || onClick)} />
  return (
    <li id={id} className={cn('bp-pk-row', glow && 'bp-pk-glow')}>
      {href ? <LinkOrA href={href} renderLink={renderLink} aria-label={label} data-tour={tour} className="bp-pk-tap">{body}</LinkOrA>
        : onClick ? <button type="button" aria-label={label} data-tour={tour} onClick={onClick} className="bp-pk-tap">{body}</button>
        : <div className="bp-pk-tap" data-static="">{body}</div>}
      {after && <div className="after">{after}</div>}
    </li>
  )
}

/**
 * A person with one job today (a guest, a member, a customer collecting): the row opens the person (calm avatar,
 * name, line 2, money at strength, chevron); under it only what is not ready yet (warn TintChips) and the one action
 * for this person. `title` and `leading` let a record lead with something else (a pickup leads with its time).
 */
export function PersonCard({ name, avatarKey, title, leading, sub, figure, chips, action, onOpen, tour, as: Row = 'li', rowProps }: {
  name: string; avatarKey?: string; title?: ReactNode; leading?: ReactNode; sub: ReactNode; figure?: ReactNode; chips?: ReactNode; action?: ReactNode; onOpen: () => void; tour?: string
  as?: ElementType; rowProps?: Record<string, unknown>
}) {
  return (
    <Row {...rowProps} className="bp-pk-row">
      <button type="button" data-tour={tour} onClick={onOpen} className="bp-pk-tap">
        <TapBody leading={leading ?? <Avatar calm name={name} id={avatarKey} size={40} />} title={title ?? name} sub={sub} figure={figure} />
      </button>
      {(chips || action) && (
        <div className="bp-pk-person-foot">
          {chips && <span className="chips">{chips}</span>}
          {action && <span className="act">{action}</span>}
        </div>
      )}
    </Row>
  )
}

/** A small state chip: `warn` what still needs doing, `pos` good news, `plain` a neutral fact. */
export function TintChip({ tone = 'warn', children }: { tone?: 'warn' | 'pos' | 'plain'; children: ReactNode }) {
  return <span className="bp-pk-chip" data-tone={tone}>{children}</span>
}

/** A real arrival or departure: a check that draws itself in a soft ring, 600 ms, once. Reduced motion: finished at once. */
export function CheckBurst() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true" className="bp-pk-burst">
      <circle cx="36" cy="36" r="34" />
      <path d="M23 37.5l8.5 8.5L50 27.5" pathLength={1} />
    </svg>
  )
}

/** A line of a breakdown that opens nothing (an item's share, a channel's total): what, a muted line, the figure. */
export function FigureRow({ title, sub, figure }: { title: ReactNode; sub?: ReactNode; figure?: ReactNode }) {
  return (
    <li className="bp-pk-row">
      <div className="bp-pk-tap" data-static=""><span className="text"><span className="t">{title}</span>{sub && <span className="s">{sub}</span>}</span>{figure}</div>
    </li>
  )
}

/**
 * The end of the day (or of a deposit, a month, a trip) in a few lines, ready to send: the date, the facts, and
 * Share on WhatsApp (the card's one blue). `phone` sends it straight to one person, otherwise WhatsApp asks who.
 */
export function DayCloseCard({ date, lines, message, title = 'Close the day', share = 'Share on WhatsApp', phone }: {
  date: string; lines: Array<{ label: string; value: ReactNode }>; message: string; title?: string; share?: string; phone?: string | null
}) {
  return (
    <section className="bp-pk-card bp-pk-slip" data-close="" aria-label={title}>
      <div className="head"><h2>{title}</h2><span className="aside">{date}</span></div>
      <dl className="lines">
        {lines.map((line) => <div key={line.label}><dt>{line.label}</dt><dd>{line.value}</dd></div>)}
      </dl>
      <ButtonLink variant="secondary" icon={MessageCircle} fullWidth className="bp-pk-share" href={whatsAppLink(phone, message)} target="_blank" rel="noopener noreferrer">{share}</ButtonLink>
    </section>
  )
}

export interface SlipLine { key?: string; label: ReactNode; sub?: ReactNode; value: ReactNode }

/**
 * A calm receipt, like a till or folio slip: title and reference, the lines (dashed hairlines), then the totals under
 * a solid rule with the last one at strength. `children` is the footer (how to pay, Share on WhatsApp).
 */
export function ReceiptCard({ title, aside, lines, totals, children, id }: {
  title: string; aside?: ReactNode; lines: SlipLine[]; totals: SlipLine[]; children?: ReactNode; id?: string
}) {
  const row = (line: SlipLine, i: number, strong: boolean) => (
    <div key={line.key ?? i} data-strong={strong || undefined}>
      <dt>{line.label}{line.sub && <span className="sub">{line.sub}</span>}</dt>
      <dd>{line.value}</dd>
    </div>
  )
  return (
    <section id={id} className="bp-pk-card bp-pk-slip" aria-label={title}>
      <div className="head"><h2>{title}</h2>{aside && <span className="aside">{aside}</span>}</div>
      {lines.length > 0 && <dl className="lines">{lines.map((l, i) => row(l, i, false))}</dl>}
      <dl className="totals">{totals.map((l, i) => row(l, i, i === totals.length - 1))}</dl>
      {children && <div className="foot">{children}</div>}
    </section>
  )
}

/**
 * An empty list that feels looked after: a mascot pose for the situation (`image`, 112 px), a title that says what
 * will appear here, one line on how it gets here, and at most one action. Only when the whole list is empty.
 */
export function CaredEmpty({ image, title, children, action }: { image?: string; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <section className="bp-pk-card bp-pk-empty">
      {image && <img src={image} alt="" width={112} height={112} loading="lazy" />}
      <h2>{title}</h2>
      {children && <p>{children}</p>}
      {action && <div className="action">{action}</div>}
    </section>
  )
}

/**
 * Settings as a phone reads them: a titled group (20/800) over one quiet card of rows, with at most one quiet action on
 * the right ("Change"). Rows are SettingsItem, SwitchRow or TimeRow; a group never holds cards.
 * (The desktop band-and-pill settings layout is SettingsCard / SettingsGroup / SettingRow.)
 */
export function SettingsList({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="bp-pk-group" aria-label={title}>
      <div className="bp-pk-group-head" data-tall=""><h2>{title}</h2>{action}</div>
      <ul className="bp-pk-list">{children}</ul>
    </section>
  )
}

/** One setting as it stands now: what it is (17/700) and its plain value under it (15, muted). Not a link. */
export function SettingsItem({ label, value }: { label: ReactNode; value?: ReactNode }) {
  return (
    <li className="bp-pk-setting">
      <span className="t">{label}</span>
      {value != null && <span className="s">{value}</span>}
    </li>
  )
}

/**
 * A setting that takes effect the moment it is tapped: what it is, one line of why, the DS switch on the right, green
 * when on (a state, not an action). The whole 56 px row is the target. The caller saves on change; `disabled` holds the
 * row while a save it depends on runs, `busy` only tells assistive tech.
 */
export function SwitchRow({ label, hint, checked, disabled, busy, onChange }: {
  label: string; hint?: ReactNode; checked: boolean; disabled?: boolean; busy?: boolean; onChange: (next: boolean) => void
}) {
  return (
    <li className="bp-pk-setting" data-control="">
      <button type="button" role="switch" aria-checked={checked} aria-busy={busy || undefined} disabled={disabled} onClick={() => onChange(!checked)} className="bp-pk-switch">
        <span className="text"><span className="t">{label}</span>{hint != null && <span className="s">{hint}</span>}</span>
        <span className="bp-switch" aria-hidden="true" />
      </button>
    </li>
  )
}

const QUARTER_HOURS = timeSlots(15, '00:00', '23:45')

/** A time of day chosen in place inside a SettingsList (a morning brief at 07:00), saved on change. */
export function TimeRow({ label, value, onChange }: { label: string; value: string; onChange: (hhmm: string) => void }) {
  return (
    <li className="bp-pk-setting" data-time="">
      <span className="t">{label}</span>
      <div className="pick"><Select label={label} value={value} onChange={onChange} options={QUARTER_HOURS} /></div>
    </li>
  )
}

/** "Good morning" / "Good afternoon" / "Good evening" by the phone's clock. */
export const greetingFor = (hour = new Date().getHours()) => (hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening')

/**
 * A mascot (`image`, 48 px) and one plain sentence about today above Home's hero ("Good morning, Marvin." then
 * "3 orders to collect today."). Never a card, never a button: the hero stays the number.
 */
export function Greeting({ name, image, children }: { name?: string | null; image?: string; children?: ReactNode }) {
  const first = name?.trim().split(/\s+/)[0]
  return (
    <div className="bp-pk-greeting">
      {image && <img src={image} alt="" width={48} height={48} />}
      <p>
        <span className="t">{greetingFor()}{first ? `, ${first}` : ''}.</span>
        {children && <span className="s">{children}</span>}
      </p>
    </div>
  )
}

/** The account page's one navy moment, as a pass: who is signed in, how they are reached and what they may do. */
export function ProfileHero({ name, detail, role }: { name: string; detail?: string | null; role: string }) {
  return (
    <header className="hero-card bp-pk-hero" data-profile="">
      <Avatar name={name} size={64} className="ring" />
      <div className="who">
        <h2>{name}</h2>
        {detail && <p className="detail">{detail}</p>}
        <p className="bp-pk-pill">{role}</p>
      </div>
    </header>
  )
}

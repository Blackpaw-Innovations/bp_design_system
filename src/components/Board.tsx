import { useState, type ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { Avatar, Plate } from './Data'
import { Button } from './Guarded'
import { Sheet, useIsPhone } from './Overlay'
import { CountBadge } from './StatusChip'

/**
 * Board (standards §17.17, round 2 W3). Built on the Car Parts workshop board: every card has a
 * "Move to [next stage]" button, so nobody has to drag. A card that can't move says why instead.
 *   - 3–6 columns, one per real stage. The column is the status: no status chip on cards.
 *   - Column head: key square in the stage colour, name, count, money total where it matters.
 *   - Card: plate or id, job, person, time in this stage (crit after `staleAfterHours`), amount.
 *     `live` stage (work happening now) renders navy cards. The orange dot = needs you.
 *   - Phone: stage chips with counts, one column of cards, "Move to …" opens a sheet when more than one next stage exists.
 *   - Click on a card opens the SlideOver (`onOpen`). A move that needs input opens it too (`needsInput`).
 */
export interface BoardStage { key: string; label: string; /** CSS colour for the key square: a status token, var(--c-navy) for live. */ color: string; live?: boolean }

export interface BoardCard {
  id: string
  stage: string
  title: string
  plate?: string
  person?: string
  /** "3 h", "2 days". */
  inStage: string
  stale?: boolean
  amount?: string
  attention?: boolean
  /** When set, the move button is replaced by this reason and `blockedAction`. */
  blocked?: string
  blockedAction?: { label: string; onClick: () => void }
}

export interface BoardProps {
  stages: BoardStage[]
  cards: BoardCard[]
  onMove: (cardId: string, toStage: string) => void
  onOpen: (cardId: string) => void
  /** Money total per stage, already formatted with fmtKM. */
  totals?: Record<string, string>
  /** Stages whose entry needs input (e.g. "quoted" needs a price): moving there calls onOpen instead. */
  needsInput?: string[]
  emptyText?: string
}

function Card({ c, stage, next, onMove, onOpen }: { c: BoardCard; stage: BoardStage; next?: BoardStage; onMove: () => void; onOpen: () => void }) {
  return (
    <article className="bp-card" data-live={stage.live || undefined} onClick={onOpen} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') onOpen() }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {c.plate && <Plate value={c.plate} />}
        <span className="bp-card-muted" style={{ flex: 1, fontWeight: 700 }}>{c.id}</span>
        {c.attention && <span className="bp-attn-dot" role="img" aria-label="Needs you" />}
      </div>
      <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.3 }}>{c.title}</div>
      <div className="bp-card-muted" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {c.person ? <Avatar name={c.person} size={24} /> : null}
        <span style={{ flex: 1, fontWeight: 600, color: c.person ? undefined : 'var(--v-warn)' }}>{c.person ?? 'Not assigned'}</span>
        <span style={{ fontWeight: c.stale ? 800 : 600, color: c.stale && !stage.live ? 'var(--v-crit)' : undefined }}>{c.inStage}{c.stale ? ' here' : ''}</span>
      </div>
      {c.amount && <div style={{ fontSize: 15, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{c.amount}</div>}
      <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {c.blocked
          ? <><div className="bp-card-blocked">{c.blocked}</div>{c.blockedAction && <Button variant="secondary" fullWidth onClick={c.blockedAction.onClick}>{c.blockedAction.label}</Button>}</>
          : next && <Button variant="secondary" fullWidth icon={ArrowRight} onClick={onMove}>{`Move to ${next.label}`}</Button>}
      </div>
    </article>
  )
}

export function Board({ stages, cards, onMove, onOpen, totals, needsInput = [], emptyText = 'No jobs here' }: BoardProps) {
  const phone = useIsPhone()
  const [phoneStage, setPhoneStage] = useState(stages[0]?.key)
  const nextOf = (k: string) => stages[stages.findIndex((s) => s.key === k) + 1]
  const move = (c: BoardCard) => { const n = nextOf(c.stage); if (!n) return; if (needsInput.includes(n.key)) onOpen(c.id); else onMove(c.id, n.key) }
  if (stages.length < 3 || stages.length > 6) console.warn('[@blackpaw/ui] Board: 3–6 stages. More, or stages nobody moves between, is a table with a status filter.')
  const column = (s: BoardStage): ReactNode => {
    const list = cards.filter((c) => c.stage === s.key)
    return list.length
      ? list.map((c) => <Card key={c.id} c={c} stage={s} next={nextOf(s.key)} onMove={() => move(c)} onOpen={() => onOpen(c.id)} />)
      : <div style={{ border: '1.5px dashed var(--c-border)', borderRadius: 14, padding: 16, fontSize: 14, color: 'var(--c-muted)', textAlign: 'center' }}>{emptyText}</div>
  }
  if (phone) {
    const s = stages.find((x) => x.key === phoneStage) ?? stages[0]
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="bp-quickviews" role="group" aria-label="Stage">
          {stages.map((x) => <button key={x.key} type="button" className="bp-qv" aria-pressed={x.key === s.key} onClick={() => setPhoneStage(x.key)}>{x.label}<CountBadge n={cards.filter((c) => c.stage === x.key).length} /></button>)}
        </div>
        {column(s)}
      </div>
    )
  }
  return (
    <div className="bp-board" style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(240px, 1fr))` }}>
      {stages.map((s) => {
        const n = cards.filter((c) => c.stage === s.key).length
        return (
          <section key={s.key} className="bp-col" aria-label={`${s.label}, ${n}`}>
            <header style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '4px 6px 2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span className="bp-col-key" style={{ background: s.color }} /><span style={{ flex: 1, fontSize: 17, fontWeight: 800 }}>{s.label}</span><span className="bp-count" style={{ background: 'var(--c-surface)' }}>{n}</span></div>
              {totals?.[s.key] && <span className="bp-help" style={{ paddingLeft: 18, fontWeight: 600 }}>{totals[s.key]}</span>}
            </header>
            {column(s)}
          </section>
        )
      })}
    </div>
  )
}

/** "Move to…" sheet for boards where a card can go to more than one stage (e.g. back to Diagnosis). */
export function MoveToSheet({ open, onClose, stages, current, onPick }: { open: boolean; onClose: () => void; stages: BoardStage[]; current: string; onPick: (k: string) => void }) {
  return (
    <Sheet open={open} title="Move to" onClose={onClose}>
      {stages.filter((s) => s.key !== current).map((s) => <button key={s.key} type="button" className="bp-opt" style={{ width: '100%', border: 0, background: 'transparent' }} onClick={() => { onPick(s.key); onClose() }}><span className="bp-col-key" style={{ background: s.color }} />{s.label}</button>)}
    </Sheet>
  )
}

/* ── Lane board (v1.21) ────────────────────────────────────── */
/**
 * A record list shown as lanes, switched from the table with `<Segmented>` ("List | Board"). Unlike `<Board>`
 * (a workflow where cards move stage to stage), lanes only group records by what they need: the page's
 * status → lane map lives in the app manifest, and `laneFor` applies it.
 *   - 3–5 lanes. Lane head tones: attention (the blue band), waiting, ready, plain.
 *   - Card: title + amount, one summary line, a "why it is here" pill, at most one secondary action.
 *   - Phone: lane chips with counts, one lane of cards.
 */
export type LaneTone = 'attention' | 'waiting' | 'ready' | 'plain'
export interface Lane { key: string; label: string; tone?: LaneTone; /** Statuses that land in this lane (from the manifest). */ states?: string[] }
export interface LaneCard {
  id: string
  lane: string
  title: string
  amount?: string
  line?: string
  why?: string
  whyTone?: 'warn' | 'info' | 'pos' | 'draft'
  /** At most one, always secondary. */
  action?: { label: string; onClick: () => void }
  href?: string
}

/** The lane a status belongs to, from the manifest's lanes; the last lane catches anything unmapped. */
export function laneFor(status: string, lanes: Lane[]): string {
  return (lanes.find((l) => l.states?.includes(status)) ?? lanes[lanes.length - 1])?.key ?? ''
}

export function LaneBoard({ lanes, cards, onOpen, renderLink, emptyText = 'Nothing here' }: {
  lanes: Lane[]; cards: LaneCard[]; onOpen?: (id: string) => void
  renderLink?: (props: { href: string; className?: string; children: ReactNode }) => ReactNode
  emptyText?: string
}) {
  const phone = useIsPhone()
  const [phoneLane, setPhoneLane] = useState(lanes[0]?.key)
  if (lanes.length < 3 || lanes.length > 5) console.warn('[@blackpaw/ui] LaneBoard: 3–5 lanes.')
  const title = (c: LaneCard) => c.href
    ? (renderLink ? renderLink({ href: c.href, className: 'bp-lane-card-title', children: c.title }) : <a href={c.href} className="bp-lane-card-title">{c.title}</a>)
    : onOpen ? <button type="button" className="bp-lane-card-title" onClick={() => onOpen(c.id)}>{c.title}</button>
    : <span className="bp-lane-card-title" style={{ cursor: 'default' }}>{c.title}</span>
  const lane = (l: Lane) => {
    const list = cards.filter((c) => c.lane === l.key)
    return (
      <section key={l.key} className="bp-lane" aria-label={`${l.label}, ${list.length}`}>
        <div className="bp-lane-head" data-tone={l.tone ?? 'plain'}><span>{l.label}</span><CountBadge n={list.length} /></div>
        {list.length
          ? list.map((c) => (
            <article key={c.id} className="bp-lane-card">
              <div className="bp-lane-card-top">{title(c)}{c.amount && <span className="bp-lane-card-amount">{c.amount}</span>}</div>
              {c.line && <span className="bp-lane-card-line">{c.line}</span>}
              {c.why && <span className="bp-why" data-tone={c.whyTone ?? 'draft'}>{c.why}</span>}
              {c.action && <Button variant="secondary" fullWidth onClick={c.action.onClick}>{c.action.label}</Button>}
            </article>
          ))
          : <div style={{ border: '1.5px dashed var(--c-border)', borderRadius: 14, padding: 16, fontSize: 14, color: 'var(--c-muted)', textAlign: 'center' }}>{emptyText}</div>}
      </section>
    )
  }
  if (phone) {
    const l = lanes.find((x) => x.key === phoneLane) ?? lanes[0]
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="bp-quickviews" role="group" aria-label="Lane">
          {lanes.map((x) => <button key={x.key} type="button" className="bp-qv" aria-pressed={x.key === l.key} onClick={() => setPhoneLane(x.key)}>{x.label}<CountBadge n={cards.filter((c) => c.lane === x.key).length} /></button>)}
        </div>
        {l && lane(l)}
      </div>
    )
  }
  return <div className="bp-lanes" style={{ gridTemplateColumns: `repeat(${lanes.length}, minmax(240px, 1fr))` }}>{lanes.map(lane)}</div>
}

import type { ReactNode } from 'react'
import { cn } from '../lib/utils'
import { TIER_META, type BadgeTier } from '../badges/tokens'

/**
 * The "bar badge" KPI card (BADGE_APPLICATIONS_MAP.md): live progress toward
 * a badge's next tier, not the badge itself. Two shapes -- pick per metric,
 * not per taste: `variant="ring"` for one number against one target (days
 * active, orders this month); `variant="trend"` for a metric better read as
 * a line over time (revenue, growth). Both read tier colour/label from
 * src/badges/tokens.ts, so this card and the BadgeMedal it sits beside can
 * never disagree about what a tier means.
 */
export type ProgressCardVariant = 'ring' | 'trend'

interface BaseProps {
  title: string
  /** The tier this metric is currently in (drives the ring/line colour and the chip). */
  tier: BadgeTier
  /** Small round thumbnail for the tier chip -- typically the current tier's medal thumb-256. */
  tierIconSrc?: string
  /** What's next, e.g. "30 Day Streak". Omit at the top tier. */
  nextLabel?: string
  className?: string
}

export interface RingProgressCardProps extends BaseProps {
  variant: 'ring'
  value: number
  target: number
  /** Unit shown under the number, e.g. "of 30 days". Defaults to "of {target}". */
  unit?: string
  size?: number
}

export interface TrendProgressCardProps extends BaseProps {
  variant: 'trend'
  /** Already-formatted headline, e.g. "KES 412,000" -- formatting is the caller's job (currency/locale vary per client). */
  displayValue: ReactNode
  /** Chronological, oldest first. */
  series: number[]
  trendLabel?: ReactNode
  /** e.g. "Next tier at KES 500,000". */
  targetLabel?: ReactNode
}

export type BadgeProgressCardProps = RingProgressCardProps | TrendProgressCardProps

function TierChip({ tier, iconSrc }: { tier: BadgeTier; iconSrc?: string }) {
  const meta = TIER_META[tier]
  return (
    <span className="bdg-tier-chip">
      {iconSrc && <img src={iconSrc} alt="" />}
      <span>{meta.label}</span>
    </span>
  )
}

function Ring({ value, target, unit, size = 168, tier }: Pick<RingProgressCardProps, 'value' | 'target' | 'unit' | 'size' | 'tier'>) {
  const r = size / 2 - 14
  const c = 2 * Math.PI * r
  const frac = target > 0 ? Math.max(0, Math.min(1, value / target)) : 0
  const color = `hsl(var(${TIER_META[tier].ringColorVar}))`
  return (
    <div className="bdg-ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle className="bdg-ring-track" cx={size / 2} cy={size / 2} r={r} strokeWidth={12} />
        <circle
          className="bdg-ring-fill" cx={size / 2} cy={size / 2} r={r} strokeWidth={12}
          stroke={color} strokeDasharray={c} strokeDashoffset={c * (1 - frac)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="bdg-ring-num" style={{ fontSize: size * 0.02 }}>
        <b style={{ fontSize: size * 0.2 }}>{value.toLocaleString()}</b>
        <small>{unit ?? `of ${target.toLocaleString()}`}</small>
      </div>
    </div>
  )
}

function Sparkline({ series, tier }: { series: number[]; tier: BadgeTier }) {
  if (series.length < 2) return null
  const w = 300, h = 56, min = Math.min(...series), max = Math.max(...series), range = max - min || 1
  const pts = series.map((v, i) => `${(i / (series.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' L')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: h }} aria-hidden="true">
      <path d={`M${pts}`} className="bdg-trend-line" stroke={`hsl(var(${TIER_META[tier].ringColorVar}))`} />
    </svg>
  )
}

export function BadgeProgressCard(props: BadgeProgressCardProps) {
  const { title, tier, tierIconSrc, nextLabel, className } = props

  if (props.variant === 'ring') {
    const toGo = Math.max(0, props.target - props.value)
    return (
      <div className={cn('p-card p-5', className)}>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[13px] font-bold text-[hsl(var(--color-muted))]">{title}</h3>
          <TierChip tier={tier} iconSrc={tierIconSrc} />
        </div>
        <div className="flex justify-center py-4">
          <Ring value={props.value} target={props.target} unit={props.unit} size={props.size} tier={tier} />
        </div>
        {nextLabel && (
          <div className="flex items-center justify-between text-xs text-[hsl(var(--color-muted))]">
            <span>Next: <b className="text-[hsl(var(--color-ink))]">{nextLabel}</b></span>
            <span>{toGo.toLocaleString()} to go</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn('p-card p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[14px] font-bold">{title}</h3>
        <TierChip tier={tier} iconSrc={tierIconSrc} />
      </div>
      <div className="mt-2.5 text-[32px] font-extrabold leading-none tracking-tight">{props.displayValue}</div>
      <div className="mt-2.5"><Sparkline series={props.series} tier={tier} /></div>
      {(props.trendLabel || props.targetLabel) && (
        <div className="mt-2 flex items-center justify-between text-xs text-[hsl(var(--color-muted))]">
          <span>{props.trendLabel}</span>
          <span>{props.targetLabel}</span>
        </div>
      )}
    </div>
  )
}

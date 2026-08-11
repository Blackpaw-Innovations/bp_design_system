import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '../lib/utils'

type TrendDirection = 'up' | 'down' | 'flat'

interface SparklineProps {
  data: number[]
  color?: string
  height?: number
}

function Sparkline({ data, color = 'hsl(var(--hk-teal))', height = 32 }: SparklineProps) {
  if (data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const width = 80
  const step = width / (data.length - 1)

  const points = data
    .map((v, i) => {
      const x = i * step
      const y = height - ((v - min) / range) * height
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      className="flex-shrink-0"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface MetricCardProps {
  label: string
  value: string | number
  trend?: {
    direction: TrendDirection
    label: string
  }
  sparkline?: number[]
  icon?: LucideIcon
  band?: 'teal' | 'orange' | 'navy' | 'amber' | 'green'
  className?: string
}

const TREND_ICONS: Record<TrendDirection, LucideIcon> = {
  up:   TrendingUp,
  down: TrendingDown,
  flat: Minus,
}

const TREND_CLASSES: Record<TrendDirection, string> = {
  up:   'status-ok',
  down: 'status-error',
  flat: 'text-muted-foreground',
}

/**
 * KPI metric card with optional sparkline, trend indicator, and accent band.
 * Used across BICC dashboard, Blackpaw Admin, and BP Planner summary views.
 *
 * Usage:
 *   <MetricCard
 *     label="Active Clients"
 *     value={42}
 *     trend={{ direction: 'up', label: '+3 this month' }}
 *     sparkline={[30, 35, 32, 38, 40, 42]}
 *     band="teal"
 *   />
 */
export function MetricCard({
  label,
  value,
  trend,
  sparkline,
  icon: Icon,
  band,
  className,
}: MetricCardProps) {
  const TrendIcon = trend ? TREND_ICONS[trend.direction] : null

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md border border-border bg-card p-4 card-lift',
        band && `bento-band-${band}`,
        className
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="font-label text-muted-foreground">{label}</span>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted flex-shrink-0">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Value + sparkline */}
      <div className="flex items-end justify-between gap-2">
        <span className="text-3xl font-display text-foreground leading-none">{value}</span>
        {sparkline && <Sparkline data={sparkline} />}
      </div>

      {/* Trend */}
      {trend && TrendIcon && (
        <div className={cn('flex items-center gap-1 mt-2 text-xs font-semibold', TREND_CLASSES[trend.direction])}>
          <TrendIcon className="h-3 w-3" />
          {trend.label}
        </div>
      )}
    </div>
  )
}

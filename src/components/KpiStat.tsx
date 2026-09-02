import type { ReactNode } from 'react'
import { cn, type IconComponent } from '../lib/utils'

/**
 * One stat tile (Reconciliation Codex C2, Commandment 20) -- replaces
 * KpiTile/KpiSpotlight, two unrelated components both named `K`, Mini,
 * Fact, StatCell, BoardMetric, QueueMetric, Metric, and GymMemberProfile's
 * navy-tint tiles. `variant="plain"` renders .hq-kpi-card (app-shell.css's
 * existing card, already used verbatim by several of the components this
 * replaces); `variant="hero"` renders the .hero-card recipe (Commandment 8:
 * glow + sheen, one per row/group, never a flat fill).
 */
export type KpiSize = 'sm' | 'md' | 'lg' | 'xl'
export type KpiHeroColor = 'navy' | 'olive' | 'burgundy' | 'orange' | 'teal'

export interface KpiStatProps {
  label: ReactNode
  value: ReactNode
  variant?: 'plain' | 'hero'
  /** Plain mode only: orange ring + orange value text, for a stat that needs attention. */
  urgent?: boolean
  icon?: IconComponent
  size?: KpiSize
  /** Secondary line under the value (was `detail`/`sub` in the components this replaces). */
  footer?: ReactNode
  /** Hero mode only. One hero per row/group -- Commandment 8. */
  heroColor?: KpiHeroColor
  className?: string
}

const VALUE_SIZE: Record<KpiSize, string> = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-xl',
  xl: 'text-3xl',
}

const PADDING: Record<KpiSize, string> = {
  sm: 'p-4', md: 'p-4', lg: 'p-4', xl: 'p-5',
}

export function KpiStat({ label, value, variant = 'plain', urgent, icon: Icon, size = 'md', footer, heroColor = 'navy', className }: KpiStatProps) {
  if (variant === 'hero') {
    return (
      <div className={cn('hero-card', `hero-${heroColor}`, 'rounded-[24px] p-5', className)}>
        <div className="mb-2 flex items-center justify-between">
          <p className="t-label-sm text-white/70">{label}</p>
          {Icon && <Icon size={18} className="text-white/80" />}
        </div>
        <p className="font-urbanist text-3xl font-800 leading-none text-white">{value}</p>
        {footer && <div className="mt-2 text-[13px] text-white/70">{footer}</div>}
      </div>
    )
  }

  return (
    <div className={cn('hq-kpi-card', urgent && 'urgent', PADDING[size], className)}>
      <div className="flex items-center justify-between">
        <p className="t-label-sm text-[hsl(var(--color-muted))]">{label}</p>
        {Icon && <Icon size={size === 'xl' ? 18 : 15} className="icon" />}
      </div>
      <p className={cn('value mt-2 font-urbanist font-800', VALUE_SIZE[size], size === 'xl' && 'font-600 leading-none')}>{value}</p>
      {footer && <div className="footer mt-2 text-xs">{footer}</div>}
    </div>
  )
}

export interface FmtKmOptions {
  prefix?: string
}

/** Commandment 11: comma-formatted below 1,000, K above, M above 1,000,000 -- never a bare decimal. */
export function fmtKM(n: number, opts?: FmtKmOptions): string {
  const prefix = opts?.prefix ?? ''
  const v = Math.round(n)
  const a = Math.abs(v)
  if (a >= 1e6) return prefix + (v / 1e6).toFixed(2) + 'M'
  if (a >= 1000) return prefix + Math.round(v / 1000).toLocaleString() + 'K'
  return prefix + v.toLocaleString()
}

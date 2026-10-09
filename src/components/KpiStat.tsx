import type { ReactNode } from 'react'
import { cn, type IconComponent } from '../lib/utils'

/**
 * One stat tile (Reconciliation Codex C2, Commandment 20).
 * `variant="plain"` renders .hq-kpi-card; `variant="hero"` renders a flat
 * .hero-card (9 Oct 2026: no glow, no sheen; white text at full opacity).
 * For a row of related figures prefer <StatGroup> (Guarded.tsx).
 */
export type KpiSize = 'sm' | 'md' | 'lg' | 'xl'
export type KpiHeroColor = 'navy' | 'olive' | 'burgundy' | 'orange' | 'teal'

export interface KpiStatProps {
  label: ReactNode
  value: ReactNode
  variant?: 'plain' | 'hero'
  /** Plain mode only: a small orange dot by the label. Attention, not alarm. */
  urgent?: boolean
  icon?: IconComponent
  size?: KpiSize
  /** Secondary line under the value. */
  footer?: ReactNode
  /** Hero mode only. One hero per row/group. Hakiqa apps: navy only. */
  heroColor?: KpiHeroColor
  className?: string
}

const VALUE_SIZE: Record<KpiSize, string> = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-3xl',
  xl: 'text-[40px]',
}

const PADDING: Record<KpiSize, string> = {
  sm: 'p-4', md: 'p-5', lg: 'p-5', xl: 'p-6',
}

export function KpiStat({ label, value, variant = 'plain', urgent, icon: Icon, size = 'md', footer, heroColor = 'navy', className }: KpiStatProps) {
  if (variant === 'hero') {
    return (
      <div className={cn('hero-card', `hero-${heroColor}`, 'rounded-[24px] p-5', className)}>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[15px] font-600 text-white">{label}</p>
          {Icon && <Icon size={18} className="text-white" />}
        </div>
        <p className="font-urbanist text-3xl font-800 leading-none text-white">{value}</p>
        {footer && <div className="mt-2 text-[15px] text-white">{footer}</div>}
      </div>
    )
  }

  return (
    <div className={cn('hq-kpi-card', urgent && 'urgent', PADDING[size], className)}>
      <div className="flex items-center justify-between">
        <p className="label text-[15px] font-600">{label}</p>
        {Icon && <Icon size={size === 'xl' ? 18 : 16} className="icon" />}
      </div>
      <p className={cn('value mt-2.5 font-urbanist font-700 leading-none', VALUE_SIZE[size])}>{value}</p>
      {footer && <div className="footer mt-2 text-[15px]">{footer}</div>}
    </div>
  )
}

export interface FmtKmOptions {
  prefix?: string
}

/** Commandment 11: comma-formatted below 1,000, K above, M above 1,000,000. For full amounts use formatMoney (lib/format). */
export function fmtKM(n: number, opts?: FmtKmOptions): string {
  const prefix = opts?.prefix ?? ''
  const v = Math.round(n)
  const a = Math.abs(v)
  if (a >= 1e6) return prefix + (v / 1e6).toFixed(2) + 'M'
  if (a >= 1000) return prefix + Math.round(v / 1000).toLocaleString() + 'K'
  return prefix + v.toLocaleString()
}

/**
 * Canonical badge tier/category data. This is the ONE place a tier's colour,
 * label and progression-order live for the whole badge system -- the KPI
 * ring, the profile achievement case, and the render-3d medal pipeline
 * (badge-system/catalogue.json) all read from this table, so a ring and its
 * medal can never disagree about what "Impressive" means.
 *
 * Mirrors the tier ladder in HAKIQA_BADGE_MASTER_PROMPT.md Part 2 and the
 * `tierNumeralMaterial` table in badge-system/catalogue.json. If either of
 * those changes, this file changes with it -- see BADGE_SYSTEM_HANDOFF.md
 * "Single source of truth" for the sync rule.
 */

export type BadgeTier = 'notable' | 'commendable' | 'impressive' | 'exceptional' | 'elite' | 'legendary'

export type BadgeCategory = 'consistency' | 'volume' | 'skill' | 'loyalty' | 'growth' | 'milestone'

export interface TierMeta {
  label: string
  /** 1 = lowest (Notable) .. 6 = highest (Legendary). Use to compare/sort tiers, never string-compare the id. */
  rank: number
  /** Semantic tone this tier borrows from StatusChip's five tones, for anything that isn't a full medal render (a small dot, a chip). */
  tone: 'neutral' | 'info' | 'accent' | 'warning' | 'success'
  /** HSL token this tier's ring/progress fill uses. References the existing bp-/color- token layer -- never a new hex value (AGENTS.md). */
  ringColorVar: string
}

export const TIER_ORDER: BadgeTier[] = ['notable', 'commendable', 'impressive', 'exceptional', 'elite', 'legendary']

export const TIER_META: Record<BadgeTier, TierMeta> = {
  notable:      { label: 'Notable',      rank: 1, tone: 'neutral', ringColorVar: '--color-muted' },
  commendable:  { label: 'Commendable',  rank: 2, tone: 'info',    ringColorVar: '--bp-info' },
  impressive:   { label: 'Impressive',   rank: 3, tone: 'accent',  ringColorVar: '--color-accent' },
  exceptional:  { label: 'Exceptional',  rank: 4, tone: 'accent',  ringColorVar: '--bp-teal' },
  elite:        { label: 'Elite',        rank: 5, tone: 'warning', ringColorVar: '--bp-purple' },
  legendary:    { label: 'Legendary',    rank: 6, tone: 'warning', ringColorVar: '--bp-orange' },
}

export const CATEGORY_LABEL: Record<BadgeCategory, string> = {
  consistency: 'Consistency',
  volume: 'Volume',
  skill: 'Skill',
  loyalty: 'Loyalty',
  growth: 'Growth',
  milestone: 'Milestone',
}

/** Given a current value and the next tier's threshold, produces the 0..1 fill fraction a BadgeProgressCard ring/bar needs. Clamped -- never lets a stale threshold push a ring past full or negative. */
export function progressFraction(value: number, target: number): number {
  if (!Number.isFinite(target) || target <= 0) return 0
  return Math.max(0, Math.min(1, value / target))
}

export function nextTier(tier: BadgeTier): BadgeTier | null {
  const i = TIER_ORDER.indexOf(tier)
  return i >= 0 && i < TIER_ORDER.length - 1 ? TIER_ORDER[i + 1] : null
}

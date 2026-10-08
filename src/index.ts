// Layout shell
export {
  AppShell, useAppShell,
  SidebarHeader, SidebarNav, SidebarFooter,
  TopBar,
} from './components/AppShell'

// Command palette
export { CommandPalette, useCommandPalette } from './components/CommandPalette'
export type { CommandItem } from './components/CommandPalette'

// Data display
export { Skeleton, MetricCardSkeleton, TableRowSkeleton, ListItemSkeleton } from './components/Skeleton'
export { EmptyState } from './components/EmptyState'
export { MetricCard } from './components/MetricCard'
export { ViewToggle } from './components/ViewToggle'
export type { ViewMode } from './components/ViewToggle'
export { StatusChip, STATUS_TONE_MAP } from './components/StatusChip'
export type { ChipTone, StatusChipProps } from './components/StatusChip'
export { ToastProvider, useToast } from './components/Toast'
export type { ToastIntent, ToastOptions, ToastSupportEscalation, ToastAction } from './components/Toast'
export { HakiTip } from './components/HakiTip'
export type { HakiTipTone, HakiTipProps } from './components/HakiTip'
export { SlideOver } from './components/SlideOver'
export type { SlideOverProps } from './components/SlideOver'
export { Select } from './components/Select'
export type { SelectOption, SelectProps } from './components/Select'
export { KpiStat, fmtKM } from './components/KpiStat'
export type { KpiStatProps, KpiSize, KpiHeroColor, FmtKmOptions } from './components/KpiStat'

// Badges
export { BadgeMedal } from './components/BadgeMedal'
export type { BadgeMedalProps, MedalSize } from './components/BadgeMedal'
export { BadgeProgressCard } from './components/BadgeProgressCard'
export type { BadgeProgressCardProps, RingProgressCardProps, TrendProgressCardProps, ProgressCardVariant } from './components/BadgeProgressCard'
export { CompletionBadge, CompletionList } from './components/CompletionBadge'
export type { CompletionBadgeProps, CompletionListProps } from './components/CompletionBadge'
export { TIER_ORDER, TIER_META, CATEGORY_LABEL, progressFraction, nextTier } from './badges/tokens'
export type { BadgeTier, BadgeCategory, TierMeta } from './badges/tokens'

// Utilities
export { cn } from './lib/utils'
export { BLACKPAW_SUPPORT_PHONE, buildWhatsAppUrl } from './lib/whatsapp'

// Premium set (2026-10-08): page structure + ledgers + sealed surfaces
export { PageHeader, MetricLedger, MetricProportion, SealedCard, Dock, DockSection, Facts } from './components/Premium'
export type { PageHeaderProps, MetricItem, MetricNoteTone, ProportionSegment, ProportionTone } from './components/Premium'

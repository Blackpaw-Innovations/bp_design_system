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
export { MetricCard } from './components/MetricCard'
/** @deprecated 10 Oct 2026: icon-only and 28 px. Use <Segmented>. Removed after callers move. */
export { ViewToggle } from './components/ViewToggle'
export type { ViewMode } from './components/ViewToggle'
export { StatusChip, STATUS_TONE_MAP, CountBadge } from './components/StatusChip'
export type { ChipTone, StatusChipProps } from './components/StatusChip'
export { ToastProvider, useToast } from './components/Toast'
export type { ToastIntent, ToastOptions, ToastSupportEscalation, ToastAction } from './components/Toast'
export { Select, MultiSelect } from './components/Select'
export type { SelectOption, SelectProps, MultiSelectProps } from './components/Select'
export { KpiStat, fmtKM } from './components/KpiStat'
export type { KpiStatProps, KpiSize, KpiHeroColor, FmtKmOptions } from './components/KpiStat'

// Components §17 (proposed 10 Oct 2026, round 2): docs/HAKIQA_COMPONENTS.md, styles tokens/components.v17.css
export { Field, Input, Textarea, CharCount, MoneyInput, parseMoney, QuantityInput, Checkbox, RadioGroup, Switch, Segmented } from './components/Form'
export type { FieldProps, InputProps, TextareaProps, MoneyInputProps, CheckboxProps, ChoiceOption } from './components/Form'
export { DatePicker, DateRangePicker, formatRange, parseTypedDate, presetRange, timeSlots, toISO, fromISO } from './components/DatePicker'
export type { DatePickerProps, DateRangePickerProps, PresetKey, ISODate } from './components/DatePicker'
export { Sheet, FormDialog, SlideOver, Menu, useIsPhone, usePopover } from './components/Overlay'
export type { SheetProps, FormDialogProps, SlideOverProps, MenuProps, MenuItem, MenuGroup } from './components/Overlay'
export { Activity, ContactActions } from './components/Activity'
export type { ActivityEntry, ActivityKind, ActivityProps } from './components/Activity'
export { Banner, EmptyState, ErrorState, InlineError, ErrorSummary, Tooltip, HakiTip, HAKI_STATE } from './components/Feedback'
export type { BannerProps, BannerTone, EmptyStateProps, ErrorStateProps, HakiTipProps, HakiState } from './components/Feedback'
export { TableFoot, BulkBar, SortHeader, SelectCell, ColumnFilter, QuickViews, FilterChips, FilterBar, Comparison, SplitBar, CHART_SERIES, Steps, ProgressBar, Avatar, AvatarGroup, PersonRow, Plate, AVATAR_PAIRS, initials } from './components/Data'
export type { SortDir, ColumnFilterOption, QuickView, ActiveFilter, FilterButton, Step, StepState, AvatarSize } from './components/Data'
export { Board, MoveToSheet } from './components/Board'
export type { BoardProps, BoardStage, BoardCard } from './components/Board'
export { ResourceDay, Agenda, MonthCell } from './components/Calendar'
export type { Booking, BookingTone, Resource, ResourceDayProps } from './components/Calendar'
export { FileUpload, resizeImage } from './components/FileUpload'
export type { FileUploadProps, UploadItem, UploadState } from './components/FileUpload'
export { SignaturePad } from './components/SignaturePad'
export type { SignaturePadProps, SignatureValue } from './components/SignaturePad'
export { DangerZone, HoldToConfirm, TypeToConfirmDialog } from './components/Danger'

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
export { formatMoney, formatDate, formatDateTime, formatPeriod, normaliseCurrency, isDateOnly } from './lib/format'
export type { MoneyOptions } from './lib/format'

// Premium set (2026-10-08): page structure + ledgers + sealed surfaces
export { PageHeader, MetricLedger, MetricProportion, SealedCard, Dock, DockSection, Facts } from './components/Premium'
export type { PageHeaderProps, MetricItem, MetricNoteTone, ProportionSegment, ProportionTone } from './components/Premium'

// Guarded set (2026-10-09): the rules live in the props
export { Button, ButtonLink, IconButton, ConfirmDialog, PageTitle, DecisionPanel, StatGroup, DataTable, Money, RecordId } from './components/Guarded'
export type { ButtonProps, ButtonLinkProps, ButtonVariant, ButtonSize, IconButtonProps, ConfirmDialogProps, PageTitleProps, DecisionPanelProps, PanelAction, StatGroupProps, StatItem, StatTone, DataTableProps, Column, ColumnKind } from './components/Guarded'

// Home snapshot (2026-10-09, standards §5a)
export { SnapshotCarousel } from './components/SnapshotCarousel'
export type { SnapshotCarouselProps, SnapshotPage, SnapshotCard, SnapshotChart, SnapshotTone } from './components/SnapshotCarousel'

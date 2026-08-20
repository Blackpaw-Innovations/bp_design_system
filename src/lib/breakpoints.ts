/**
 * The three breakpoints Hakiqa Duka's responsive audit settled on
 * (see hakiqa-handoff/DESIGN_SYSTEM_NOTES.md) — the only place in the org
 * where this was actually worked out. Exported here so a product can use
 * the same numbers in JS (matchMedia, a resize hook, etc.) without
 * re-deriving or guessing them.
 */
export const BREAKPOINTS = {
  /** Desktop → tablet: side padding only, no layout reflow. */
  tablet: 1024,
  /** Tablet → phone: app-top wraps, search collapses, touch targets grow to 44px. */
  phone: 720,
  /** Phone: the sidebar/rail becomes a fixed bottom tab bar. */
  compact: 600,
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

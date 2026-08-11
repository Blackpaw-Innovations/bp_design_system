import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

/**
 * Wraps app-shell.css's `.haki-tip` spec (Reconciliation Codex C5) --
 * defined, styled, and used nowhere: every page that wanted a mascot-tip
 * banner hand-built its own lookalike instead. Pose comes from the 7-key
 * brandAssets map (Commandment 14), never a string literal.
 */
export type HakiTipTone = 'tip' | 'advice' | 'warning' | 'announce' | 'alert'

export interface HakiTipProps {
  /** The mascot pose image src -- pass manifest.brandAssets.mascot.icon (or another pose) from the call site; this component doesn't know about the manifest. */
  mascotSrc: string
  title: ReactNode
  children: ReactNode
  tone?: HakiTipTone
  /** Called when the dismiss (×) button is shown. Omit to render without a dismiss control. */
  onDismiss?: () => void
  className?: string
}

export function HakiTip({ mascotSrc, title, children, tone = 'tip', onDismiss, className }: HakiTipProps) {
  return (
    <div className={cn('haki-tip', `ht-${tone}`, className)}>
      <img src={mascotSrc} alt="" />
      <div>
        <div className="ht-title">{title}</div>
        <div className="ht-body">{children}</div>
      </div>
      {onDismiss && (
        <button type="button" className="ht-dismiss" onClick={onDismiss} aria-label="Dismiss">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      )}
    </div>
  )
}

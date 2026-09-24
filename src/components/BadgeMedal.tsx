import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { cn } from '../lib/utils'

/**
 * Displays one collectible badge: the earned 3D medal (front/back plates
 * rendered by badge-system/render-3d, flips on click/Enter) or, if not yet
 * earned, its silhouette with a progress bar underneath -- the same object
 * read two ways, not two different components. See BADGE_APPLICATIONS_MAP.md
 * "Bar badge" for why a locked medal is a progress read, not a lesser medal.
 *
 * `frontSrc`/`backSrc` are the exported PNGs from badge-system/exports/<id>/
 * (thumb-256 for case/grid use, front/back full-res for a celebration
 * moment) -- this component never renders 3D itself.
 */
export type MedalSize = 'sm' | 'md' | 'lg'

export interface BadgeMedalProps {
  /** Achievement name, shown under the medal and used for the accessible label. */
  label: string
  frontSrc: string
  /** Omit for a locked medal -- there is nothing to flip to yet. */
  backSrc?: string
  earned: boolean
  /** 0..1, locked medals only. Ignored (and hidden) once `earned`. */
  progress?: number
  size?: MedalSize
  className?: string
  /** Fires each time the medal flips, earned medals only. */
  onFlip?: (showingBack: boolean) => void
}

const BOX: Record<MedalSize, number> = { sm: 64, md: 88, lg: 140 }

export function BadgeMedal({ label, frontSrc, backSrc, earned, progress = 0, size = 'md', className, onFlip }: BadgeMedalProps) {
  const [flipped, setFlipped] = useState(false)
  const box = BOX[size]
  const canFlip = earned && !!backSrc

  const toggle = () => {
    if (!canFlip) return
    const next = !flipped
    setFlipped(next)
    onFlip?.(next)
  }
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle() }
  }

  return (
    <div className={cn('inline-flex flex-col items-center', className)} style={{ width: box }}>
      <button
        type="button"
        className={cn('bdg-medal', !earned && 'locked', flipped && 'is-flipped')}
        style={{ width: box, height: box }}
        onClick={toggle}
        onKeyDown={onKeyDown}
        disabled={!canFlip}
        aria-pressed={canFlip ? flipped : undefined}
        aria-label={canFlip ? `${label}, ${flipped ? 'showing award details, tap to show front' : 'tap to flip and show award details'}` : `${label}${earned ? '' : ', locked'}`}
      >
        <div className="bdg-medal-inner">
          <div className="bdg-medal-face front">
            <img src={frontSrc} alt="" loading="lazy" />
          </div>
          {backSrc && (
            <div className="bdg-medal-face back">
              <img src={backSrc} alt="" loading="lazy" />
            </div>
          )}
        </div>
      </button>
      <div className="bdg-medal-label" style={{ width: box + 24 }}>{label}</div>
      {!earned && (
        <div className="bdg-medal-bar" style={{ width: box }} aria-hidden="true">
          <i style={{ width: `${Math.round(Math.max(0, Math.min(1, progress)) * 100)}%` }} />
        </div>
      )}
    </div>
  )
}

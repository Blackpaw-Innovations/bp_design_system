import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ComponentType } from 'react'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Structural, not `LucideIcon` from 'lucide-react' directly -- a consuming
 * app's own lucide-react install is a different physical package than this
 * one's (peerDependency, not deduped across a `link:`-consumed package), so
 * two nominally-typed `LucideIcon`s don't structurally unify even when
 * they're the same icon. Any component shaped like one (lucide-react's,
 * or otherwise) satisfies this.
 */
export type IconComponent = ComponentType<{ size?: number | string; className?: string; strokeWidth?: number }>

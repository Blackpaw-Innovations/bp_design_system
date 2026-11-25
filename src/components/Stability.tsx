import { Component, useEffect, useRef, useState, type ErrorInfo, type ReactNode } from 'react'
import { reportError } from '../lib/errorReporting'
import { Button } from './Guarded'

/**
 * App-wide stability pieces (v1.43.0).
 *
 *   AppErrorBoundary  the outermost boundary: calm Haki, one plain line, Reload. Reports the error.
 *                     Put narrower boundaries (a stale-chunk reload) inside it so they catch first.
 *   OfflineBanner     mount once in the app shell. Slim sticky strip while offline, "Back online" for 3 s after.
 */

/* ── AppErrorBoundary ──────────────────────────────────────── */
export interface AppErrorBoundaryProps {
  children: ReactNode
  /** The calm Haki: manifest.brandAssets.mascot.icon. Leave out for no picture. */
  mascotSrc?: string
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    if (error instanceof Error && info.componentStack) error.stack = `${error.stack ?? ''}\nComponent stack:${info.componentStack}`
    reportError(error, 'boundary')
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <main className="bp-crash">
        {this.props.mascotSrc && <img src={this.props.mascotSrc} alt="" width={120} height={120} />}
        <h1>Something went wrong. Reload and you can carry on.</h1>
        <Button variant="primary" onClick={() => window.location.reload()}>Reload</Button>
      </main>
    )
  }
}

/* ── OfflineBanner ─────────────────────────────────────────── */
export interface OfflineBannerProps {
  /** The small offline Haki: haki-offline.png (resized copy in the app's public folder). */
  mascotSrc?: string
  className?: string
}

export function OfflineBanner({ mascotSrc, className }: OfflineBannerProps) {
  const [state, setState] = useState<'online' | 'offline' | 'back'>(() => (typeof navigator !== 'undefined' && navigator.onLine === false ? 'offline' : 'online'))
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    const offline = () => { window.clearTimeout(timer.current); setState('offline') }
    const online = () => {
      setState((s) => (s === 'offline' ? 'back' : s))
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setState('online'), 3000)
    }
    window.addEventListener('offline', offline)
    window.addEventListener('online', online)
    return () => { window.removeEventListener('offline', offline); window.removeEventListener('online', online); window.clearTimeout(timer.current) }
  }, [])

  // The live region stays mounted so screen readers announce the change.
  return (
    <div className={['bp-offline', className].filter(Boolean).join(' ')} role="status" aria-live="polite" data-state={state}>
      {state === 'offline' && (
        <div className="bp-offline-bar">
          {mascotSrc && <img src={mascotSrc} alt="" width={32} height={32} />}
          <span>You're offline. We'll reconnect when you're back.</span>
        </div>
      )}
      {state === 'back' && <div className="bp-offline-bar"><span>Back online</span></div>}
    </div>
  )
}

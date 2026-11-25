/**
 * Crash reporting (v1.43.0). One install per app, in main.tsx:
 *
 *   installErrorReporting({ app: 'hakiqa-connect', vertical: () => ..., version, endpoint: '/api/client-errors' })
 *
 * Hooks window `error` and `unhandledrejection`; AppErrorBoundary calls reportError(). Sends only app, vertical,
 * version, route (path only, no query), user agent, a correlation ID when the error carries one, and the message
 * and stack with emails and token-like strings masked. Never form values. Off the production host it logs to the
 * console instead of sending. No imports: scripts/check-error-reporting.mts runs this file directly under Node.
 */

export interface ErrorReportingOptions {
  app: string
  /** A string, or a function read at report time (the vertical can change after start-up). */
  vertical?: string | (() => string | undefined)
  version: string
  /** Same-origin path or URL that accepts a JSON POST. */
  endpoint: string
  /** Send for real. Default: false on localhost / 127.0.0.1 / *.local, true elsewhere. Pass import.meta.env.PROD. */
  production?: boolean
}

export interface ErrorReport {
  app: string
  vertical?: string
  version: string
  route: string
  userAgent: string
  correlationId?: string
  kind: 'error' | 'unhandledrejection' | 'boundary'
  message: string
  stack?: string
  at: string
}

export const MAX_REPORTS_PER_SESSION = 20
export const SAME_MESSAGE_WINDOW_MS = 60_000

/** True when a report with this key may be sent now: the same key once per window, at most `max` in all. */
export function createReportLimiter(max = MAX_REPORTS_PER_SESSION, windowMs = SAME_MESSAGE_WINDOW_MS) {
  const lastSent = new Map<string, number>()
  let sent = 0
  return (key: string, now = Date.now()): boolean => {
    if (sent >= max) return false
    const last = lastSent.get(key)
    if (last !== undefined && now - last < windowMs) return false
    lastSent.set(key, now)
    sent += 1
    return true
  }
}

/** Masks emails, bearer/JWT tokens, long opaque strings and URL query strings, then caps the length. */
export function scrub(text: string, max = 500): string {
  // Bounded quantifiers and a pre-cut input keep every pattern linear (CodeQL js/polynomial-redos).
  return text
    .slice(0, max * 4)
    .replace(/[\w.+-]{1,64}@[\w-]{1,63}(?:\.[\w-]{1,63}){1,6}/g, '[email]')
    .replace(/\bBearer\s{1,4}\S{1,2000}/gi, 'Bearer [token]')
    .replace(/\beyJ[\w-]{1,2000}\.[\w-]{1,2000}\.[\w-]{0,2000}/g, '[token]')
    .replace(/(https?:\/\/[^\s?)]{1,500})\?[^\s):]{0,2000}/g, '$1')
    .replace(/[A-Za-z0-9_-]{32,2000}/g, '[token]')
    .slice(0, max)
}

let options: ErrorReportingOptions | null = null
let allow = createReportLimiter()

function isProduction(): boolean {
  if (options?.production !== undefined) return options.production
  const host = typeof location === 'undefined' ? '' : location.hostname
  return !(host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host.endsWith('.local'))
}

export function buildReport(error: unknown, kind: ErrorReport['kind']): ErrorReport | null {
  if (!options) return null
  const err = error instanceof Error ? error : null
  const message = scrub(err ? `${err.name}: ${err.message}` : typeof error === 'string' ? error : safeString(error))
  const correlation = (error as { correlationId?: unknown } | null)?.correlationId
  const vertical = typeof options.vertical === 'function' ? options.vertical() : options.vertical
  return {
    app: options.app.slice(0, 60),
    vertical: vertical?.slice(0, 60),
    version: options.version.slice(0, 60),
    route: typeof location === 'undefined' ? '' : location.pathname.slice(0, 200),
    userAgent: typeof navigator === 'undefined' ? '' : navigator.userAgent.slice(0, 300),
    correlationId: typeof correlation === 'string' && /^[\w-]{1,64}$/.test(correlation) ? correlation : undefined,
    kind,
    message,
    stack: err?.stack ? scrub(err.stack, 4000) : undefined,
    at: new Date().toISOString(),
  }
}

function safeString(value: unknown): string {
  try { return String(value) } catch { return 'Unknown error' }
}

/** Report one error. Safe to call before install (it does nothing) and from anywhere. */
export function reportError(error: unknown, kind: ErrorReport['kind'] = 'boundary'): void {
  try {
    const report = buildReport(error, kind)
    if (!report || !allow(report.message)) return
    if (!isProduction()) { console.info('[error-report] not sent outside production:', report); return }
    const body = JSON.stringify(report)
    const blob = new Blob([body], { type: 'application/json' })
    if (typeof navigator !== 'undefined' && navigator.sendBeacon?.(options!.endpoint, blob)) return
    void fetch(options!.endpoint, { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {})
  } catch {
    // A reporter must never throw into the page it is watching.
  }
}

/** Install once. Calling again replaces the options and keeps the listeners. */
export function installErrorReporting(next: ErrorReportingOptions): void {
  const first = options === null
  options = next
  allow = createReportLimiter()
  if (!first || typeof window === 'undefined') return
  window.addEventListener('error', (event) => {
    if (!event.error && !event.message) return
    reportError(event.error ?? event.message, 'error')
  })
  window.addEventListener('unhandledrejection', (event) => reportError(event.reason, 'unhandledrejection'))
}

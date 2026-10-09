/**
 * The only money and date formatters apps should use (ruled 9 Oct 2026).
 *   formatMoney(92000)        -> "KES 92,000"
 *   formatMoney(42.1)         -> "KES 42.10"
 *   formatMoney(-350)         -> "−KES 350"
 *   formatDate('2026-09-04')  -> "4 Sep 2026"   (never "Sept", never ISO)
 *   formatDateTime(d)         -> "9 Oct 2026, 09:48"
 * Date-only strings ("2026-09-04") are read as LOCAL dates. new Date() reads
 * them as UTC midnight, which shows as 03:00 in Nairobi and can slip a day
 * in other time zones. Never pass a date-only value to formatDateTime.
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/

export interface MoneyOptions {
  /** 'auto' (default): decimals only when the amount has cents. */
  decimals?: 'auto' | 0 | 2
}

export function normaliseCurrency(code?: string | null): string {
  const c = (code ?? 'KES').trim().toUpperCase()
  return c === 'KSH' || c === 'KSHS' ? 'KES' : c
}

export function formatMoney(amount: number | null | undefined, currency?: string | null, opts: MoneyOptions = {}): string {
  if (amount == null || Number.isNaN(amount)) return '—'
  const cents = Math.round(Math.abs(amount) * 100) % 100
  const decimals = opts.decimals === undefined || opts.decimals === 'auto' ? (cents === 0 ? 0 : 2) : opts.decimals
  const body = Math.abs(amount).toLocaleString('en-KE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  return `${amount < 0 ? '−' : ''}${normaliseCurrency(currency)} ${body}`
}

export function isDateOnly(value: unknown): boolean {
  return typeof value === 'string' && DATE_ONLY.test(value)
}

function toDate(value: Date | string | number): Date | null {
  if (typeof value === 'string') {
    const m = value.match(DATE_ONLY)
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  }
  const d = value instanceof Date ? value : new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatDate(value: Date | string | number | null | undefined): string {
  if (value == null || value === '') return '—'
  const d = toDate(value)
  return d ? `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` : '—'
}

export function formatDateTime(value: Date | string | number | null | undefined): string {
  if (value == null || value === '') return '—'
  if (isDateOnly(value)) return formatDate(value)
  const d = toDate(value)
  if (!d) return '—'
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${formatDate(d)}, ${hh}:${mm}`
}

export function formatPeriod(from: Date | string, to: Date | string): string {
  return `${formatDate(from)} to ${formatDate(to)}`
}

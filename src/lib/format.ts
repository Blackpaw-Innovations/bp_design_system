/**
 * The only money and date formatters apps should use (ruled 9 Oct 2026; v1.25.2: moneyParts is the same format in parts).
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

/** An amount split for display: `sign` ("−" or ""), the ISO `currency` label and the unsigned `figure`. */
export interface MoneyParts { sign: '' | '−'; currency: string; figure: string }

/**
 * The one money format, in parts, for a figure that gets its own emphasis (MoneyFigure, MoneyHero). formatMoney is
 * these parts joined, so a hero, a row and a sentence always agree. Currency: ISO, "KSh"/"Ksh"/"KShs" become "KES",
 * missing means KES. Null for no amount (show a dash).
 */
export function moneyParts(amount: number | null | undefined, currency?: string | null, opts: MoneyOptions = {}): MoneyParts | null {
  if (amount == null || Number.isNaN(amount)) return null
  const cents = Math.round(Math.abs(amount) * 100) % 100
  const decimals = opts.decimals === undefined || opts.decimals === 'auto' ? (cents === 0 ? 0 : 2) : opts.decimals
  const figure = Math.abs(amount).toLocaleString('en-KE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  return { sign: amount < 0 && figure !== '0' ? '−' : '', currency: normaliseCurrency(currency), figure }
}

export function formatMoney(amount: number | null | undefined, currency?: string | null, opts: MoneyOptions = {}): string {
  const p = moneyParts(amount, currency, opts)
  return p ? `${p.sign}${p.currency} ${p.figure}` : '—'
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

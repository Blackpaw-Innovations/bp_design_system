/**
 * Pure helpers behind the round 3 patterns (v1.46.0, Marvin 26 Nov 2026). No React here, so
 * scripts/check-patterns.mts can test the rules themselves: histories newest first by day, lists in pages of 10,
 * readable times, a term bar's today marker, and a Home carousel that never repeats a card below it.
 */

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/

export function toLocalDate(value: Date | string | number): Date | null {
  if (typeof value === 'string') {
    const m = value.match(DATE_ONLY)
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  }
  const d = value instanceof Date ? value : new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const dayDiff = (a: Date, b: Date) => Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / 86_400_000)
const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

/** "Today", "Yesterday", "Tomorrow", "3 days ago", "In 3 days". The plain helper line under a time. */
export function dayWords(value: Date | string | number, now: Date = new Date()): string {
  const d = toLocalDate(value)
  if (!d) return ''
  const n = dayDiff(d, now)
  if (n === 0) return 'Today'
  if (n === -1) return 'Yesterday'
  if (n === 1) return 'Tomorrow'
  return n < 0 ? `${-n} days ago` : `In ${n} days`
}

/** "Tue 25 Nov, 09:10" (the year only when it is not this year). A date-only value has no time. Readable times rule. */
export function formatDayTime(value: Date | string | number | null | undefined, now: Date = new Date()): string {
  if (value == null || value === '') return '—'
  const d = toLocalDate(value)
  if (!d) return '—'
  const day = `${DAYS[d.getDay()].slice(0, 3)} ${d.getDate()} ${MONTHS[d.getMonth()]}${d.getFullYear() === now.getFullYear() ? '' : ` ${d.getFullYear()}`}`
  return typeof value === 'string' && DATE_ONLY.test(value) ? day : `${day}, ${hhmm(d)}`
}

/** A timeline's day heading: "Today", "Yesterday", else "Tuesday 25 Nov" (plus the year when it is not this year). */
export function dayHeading(d: Date, now: Date = new Date()): string {
  const n = dayDiff(d, now)
  if (n === 0) return 'Today'
  if (n === -1) return 'Yesterday'
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}${d.getFullYear() === now.getFullYear() ? '' : ` ${d.getFullYear()}`}`
}

export interface DayBucket<T> { key: string; title: string; items: (T & { time: string })[] }

/** Newest first, grouped by local day. Entries without a readable `at` are dropped. */
export function groupByDay<T extends { at: string }>(entries: T[], now: Date = new Date()): DayBucket<T>[] {
  const dated = entries
    .map((e) => ({ e, d: toLocalDate(e.at) }))
    .filter((x): x is { e: T; d: Date } => x.d !== null)
    .sort((a, b) => b.d.getTime() - a.d.getTime())
  const out: DayBucket<T>[] = []
  for (const { e, d } of dated) {
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    let bucket = out[out.length - 1]
    if (!bucket || bucket.key !== key) { bucket = { key, title: dayHeading(d, now), items: [] }; out.push(bucket) }
    bucket.items.push({ ...e, time: hhmm(d) })
  }
  return out
}

export type SortDirection = 'asc' | 'desc'

export interface LedgerQuery<T> {
  query?: string
  /** Text each row is searched by (lower-cased here). */
  searchText?: (row: T) => string
  /** The active filter's test; omit for All. */
  test?: (row: T) => boolean
  sortValue?: (row: T) => string | number | null | undefined
  dir?: SortDirection
  page?: number
  pageSize?: number
}

export interface LedgerPage<T> { rows: T[]; total: number; page: number; pages: number; from: number; to: number }

/** Search, filter, sort and one page of rows. Pages are 1-based; a page past the end lands on the last page. Default 10. */
export function ledgerPage<T>(all: T[], q: LedgerQuery<T>): LedgerPage<T> {
  const needle = (q.query ?? '').trim().toLowerCase()
  let rows = all.filter((r) => (!q.test || q.test(r)) && (!needle || !q.searchText || q.searchText(r).toLowerCase().includes(needle)))
  if (q.sortValue) {
    const get = q.sortValue
    const sign = q.dir === 'asc' ? 1 : -1
    rows = rows
      .map((r, i) => ({ r, i, v: get(r) }))
      .sort((a, b) => {
        if (a.v == null || b.v == null) return a.v == null ? (b.v == null ? a.i - b.i : 1) : -1
        const c = typeof a.v === 'number' && typeof b.v === 'number' ? a.v - b.v : String(a.v).localeCompare(String(b.v))
        return c === 0 ? a.i - b.i : c * sign
      })
      .map((x) => x.r)
  }
  const size = Math.max(1, q.pageSize ?? 10)
  const total = rows.length
  const pages = Math.max(1, Math.ceil(total / size))
  const page = Math.min(Math.max(1, q.page ?? 1), pages)
  const start = (page - 1) * size
  const slice = rows.slice(start, start + size)
  return { rows: slice, total, page, pages, from: total ? start + 1 : 0, to: start + slice.length }
}

/** Where today sits between two dates: 0–1, plus the days gone and left. Before the start is 0, after the end is 1. */
export function termProgress(start: Date | string, end: Date | string, today: Date | string = new Date()): { fraction: number; daysGone: number; daysLeft: number } {
  const s = toLocalDate(start), e = toLocalDate(end), t = toLocalDate(today)
  if (!s || !e || !t) return { fraction: 0, daysGone: 0, daysLeft: 0 }
  const span = Math.max(1, dayDiff(e, s))
  const gone = Math.min(span, Math.max(0, dayDiff(t, s)))
  return { fraction: gone / span, daysGone: gone, daysLeft: Math.max(0, dayDiff(e, t)) }
}

/**
 * The Home carousel rule: a slide about a record that a card below already shows is dropped, so Home never says the
 * same thing twice. Items carry `about` (the record's key, e.g. "SR-2026-000012"); `shown` lists the keys the cards show.
 */
export function notShownBelow<T extends { about?: string }>(items: T[], shown: readonly string[] = []): T[] {
  if (!shown.length) return items
  const set = new Set(shown)
  return items.filter((i) => !i.about || !set.has(i.about))
}

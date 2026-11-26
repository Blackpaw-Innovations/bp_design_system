// Round 3 patterns (v1.46.0, Marvin 26 Nov 2026): the rules DP-01..DP-09 in conformance/experience-rules.json that a
// script can hold cheaply. Needs Node >= 23.6 (imports the .ts source directly).
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { dayWords, formatDayTime, groupByDay, ledgerPage, notShownBelow, termProgress } from '../src/lib/patterns.ts'

const root = resolve(import.meta.dirname, '..')
const read = (f: string) => readFileSync(join(root, f), 'utf8')
const now = new Date(2026, 10, 26, 12, 0) // Thu 26 Nov 2026

// DP-04 readable times
assert.equal(formatDayTime('2026-11-25T09:10:00', now), 'Wed 25 Nov, 09:10')
assert.equal(formatDayTime('2026-11-27', now), 'Fri 27 Nov')
assert.equal(formatDayTime('2025-03-01T08:00:00', now), 'Sat 1 Mar 2025, 08:00')
assert.equal(formatDayTime(null), '—')
assert.equal(dayWords('2026-11-25T09:10:00', now), 'Yesterday')
assert.equal(dayWords('2026-11-26', now), 'Today')
assert.equal(dayWords('2026-11-29', now), 'In 3 days')

// DP-05 timelines: newest first, grouped by day, whatever order the entries arrive in
const days = groupByDay([
  { id: 'a', at: '2026-11-18T08:12:00' }, { id: 'c', at: '2026-11-25T07:50:00' },
  { id: 'd', at: '2026-11-25T09:10:00' }, { id: 'b', at: '2026-11-19T13:45:00' }, { id: 'x', at: 'not a date' },
], now)
assert.deepEqual(days.map((d) => d.title), ['Yesterday', 'Thursday 19 Nov', 'Wednesday 18 Nov'])
assert.deepEqual(days.flatMap((d) => d.items.map((i) => i.id)), ['d', 'c', 'b', 'a'])
assert.equal(days[0].items[0].time, '09:10')

// DP-06 long lists: 10 a page by default, search + filter + sort, clamped pages
const rows = Array.from({ length: 23 }, (_, i) => ({ n: i + 1, kind: i % 3 === 0 ? 'payment' : 'charge', text: `Row ${i + 1}` }))
const p1 = ledgerPage(rows, {})
assert.equal(p1.rows.length, 10); assert.equal(p1.pages, 3); assert.equal(p1.from, 1); assert.equal(p1.to, 10)
const p9 = ledgerPage(rows, { page: 9 })
assert.equal(p9.page, 3); assert.equal(p9.rows.length, 3); assert.equal(p9.to, 23)
const pay = ledgerPage(rows, { test: (r) => r.kind === 'payment', sortValue: (r) => r.n, dir: 'desc' })
assert.equal(pay.total, 8); assert.equal(pay.rows[0].n, 22)
assert.equal(ledgerPage(rows, { query: 'row 2', searchText: (r) => r.text }).total, 5) // 2, 20, 21, 22, 23
assert.equal(ledgerPage([], {}).from, 0)
const data = read('src/components/Data.tsx')
assert.match(data, /export function Ledger<T>\([^)]*pageSize = 10[,}]/, 'Ledger must default to 10 rows a page')
assert.match(data, /Math\.min\(50, /, 'Ledger must cap a page at 50 rows')

// DP-07 Home carousel never repeats a card below
const slides = [{ key: '1', about: 'SR-12' }, { key: '2', about: 'NOTICE-4' }, { key: '3' }]
assert.deepEqual(notShownBelow(slides, ['SR-12']).map((s) => s.key), ['2', '3'])
assert.equal(notShownBelow(slides).length, 3)
assert.match(read('src/components/Spotlight.tsx'), /notShownBelow\(items, shownBelow\)/, 'SpotlightCarousel must drop slides shown below')

// DP-09 term bar
assert.deepEqual(termProgress('2026-03-01', '2027-02-28', '2026-11-26'), { fraction: 270 / 364, daysGone: 270, daysLeft: 94 })
assert.equal(termProgress('2026-03-01', '2027-02-28', '2026-01-01').fraction, 0)
assert.equal(termProgress('2026-03-01', '2027-02-28', '2027-06-01').fraction, 1)

// DP-01 colour = meaning: navy fill ("live") is In progress only; WhoPill is an outline; token colours only
const chip = read('src/components/StatusChip.tsx')
const live = [...chip.matchAll(/(\w+): \{ tone: 'live', label: '([^']+)' \}/g)].map((m) => m[2])
assert.ok(live.length > 0 && live.every((l) => ['In progress', 'In the bay'].includes(l)), `Only "In progress" may be live (navy); found: ${live.join(', ')}`)
const css = read('src/tokens/patterns.css')
assert.match(css, /\.bp-who \{[^}]*background: transparent/, 'WhoPill must be an outline, never a fill')
const raw = css.replace(/\/\*[\s\S]*?\*\//g, '').match(/#(?!fff\b|ffffff\b)[0-9a-f]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|oklch)\(/gi)
assert.equal(raw, null, `patterns.css: raw colours are not allowed, use tokens (${raw?.join(', ')})`)

// The rules are written down where builders read them
const registry = JSON.parse(read('conformance/experience-rules.json'))
const principles = read('BUILDING_PRINCIPLES.md')
for (const r of registry.patternRules) assert.ok(principles.includes(r.id), `BUILDING_PRINCIPLES.md does not state ${r.id}`)

console.log(`Pattern checks passed: ${registry.patternRules.length} round 3 rules (DP-01..DP-${String(registry.patternRules.length).padStart(2, '0')}).`)

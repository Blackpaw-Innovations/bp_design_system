// stars() must draw exactly what night.py drew for the approved renders.
// Hashes are of night.py `stars(seed, w, h, ink=day)` output (Python 3.12). Needs Node ≥ 22.18 (runs .ts directly).
import { createHash } from 'node:crypto'
import { stars } from '../src/lib/stars.ts'

const cases: [string, number, number, boolean, string][] = [
  ['Tasks', 1280, 300, false, '8e010cca4d9e45cc60b65854e8bf3b61ad22136ac38849001a968fd05d1836d9'],
  ['Today', 1280, 300, true, '55f76df49bfb98dcd5d867dc3c9f4245e3bae630544d4ffeb7de37e927a44a51'],
  ['hero-panel', 900, 300, false, '803b3567c539b60a09058476efda2bf4e49cac429dbb83b8f94b834a8138e354'],
  ['x', 390, 240, true, 'e53118c7e080241a7f63673efc89a24a30b6bacd565458ca15ef9bf8c8e37b44'],
  ['', 50, 40, false, '9cbe04020f5cab57175b048571884d41a17424aefc1571f2a8390337f6cf38ee'],
  ['Agora longer seed ✓', 1280, 820, false, 'dbe663d990b766804ecc005226ab7642d26a732f584a5be9734cee7322bb016e'],
]
const bad = cases.filter(([seed, w, h, day, want]) => createHash('sha256').update(stars(seed, w, h, { day })).digest('hex') !== want)
if (bad.length) { console.error('stars() differs from night.py for:', bad.map(c => JSON.stringify(c[0])).join(', ')); process.exit(1) }
console.log(`stars() matches night.py for ${cases.length} seeds.`)

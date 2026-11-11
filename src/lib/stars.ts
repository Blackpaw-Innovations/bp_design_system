/**
 * Seeded stars and constellations for the Olympus sky (night.py `stars()`, ported 1:1).
 *
 * Same seed, width and height → the same SVG as the approved renders, byte for byte:
 * the random stream is Python's (crc32 seed → Mersenne Twister → random/uniform/choice/randint).
 * Returns an SVG string with class="stars"; drop it inside `.ol-sky` (it fills the band).
 *
 *   el.innerHTML = stars('Tasks', 1280, 300)              // night
 *   el.innerHTML = stars('Tasks', 1280, 300, { day: true }) // day sky, ink stars
 */
export interface StarsOptions {
  /** Day sky (light mode): ink stars instead of near-white. */
  day?: boolean
  /** Number of constellations. Default 2. */
  constellations?: number
  /** SVG filter id; give each sky on one page its own. Default 'g'. */
  filterId?: string
}

export function stars(seed: string, width: number, height: number, opts: StarsOptions = {}): string {
  const { day = false, constellations = 2, filterId = 'g' } = opts
  const [S, L, N] = day ? ['#2A2655', '#2A2655', '#57546F'] : ['#F1F0FB', '#F1F0FB', '#9A97C0']
  const r = new PyRandom(crc32(seed))
  const w = width, h = height
  let dots = ''
  for (let i = 0, n = Math.trunc(w * h / 5200); i < n; i++) {
    const cx = f0(r.uniform(0, w)), cy = f0(r.uniform(0, h * .92))
    const rad = r.choice([.6, .8, 1, 1, 1.3, 1.6])
    const op = (r.uniform(.2, .85) * (day ? .55 : 1)).toFixed(2)
    dots += `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${S}" fill-opacity="${op}"/>`
  }
  let cs = ''
  for (let c = 0; c < constellations; c++) {
    const cx = r.uniform(w * .45, w * .92), cy = r.uniform(h * .2, h * .65)
    const k = r.randint(5, 7)
    const pts: [number, number][] = []
    for (let i = 0; i < k; i++) pts.push([cx + r.uniform(-95, 95), cy + r.uniform(-50, 50)])
    pts.sort((a, b) => a[0] - b[0] || a[1] - b[1])
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i]
      cs += `<line x1="${f0(a[0])}" y1="${f0(a[1])}" x2="${f0(b[0])}" y2="${f0(b[1])}" stroke="${L}" stroke-opacity="${day ? .22 : .18}"/>`
    }
    pts.forEach(([x, y], i) => {
      cs += i % 3
        ? `<circle cx="${f0(x)}" cy="${f0(y)}" r="2.3" fill="${S}" filter="url(#${filterId})"/>`
        : `<circle cx="${f0(x)}" cy="${f0(y)}" r="2.6" fill="none" stroke="${N}"/>`
    })
  }
  return `<svg class="stars" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><filter id="${filterId}" x="-3" y="-3" width="7" height="7">`
    + `<feGaussianBlur stdDeviation="2.4" result="b"/><feFlood flood-color="#3228CF"/><feComposite in2="b" operator="in"/><feMerge><feMergeNode/><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>${dots}${cs}</svg>`
}

/** Python's f'{x:.0f}': round half to even, keeps '-0'. */
function f0(x: number): string {
  const fl = Math.floor(x)
  const n = x - fl === .5 ? (fl % 2 === 0 ? fl : fl + 1) : Math.round(x)
  return n === 0 && x < 0 ? '-0' : String(n)
}

function crc32(s: string): number {
  let c = ~0
  for (const byte of new TextEncoder().encode(s)) {
    c ^= byte
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xEDB88320 : c >>> 1
  }
  return ~c >>> 0
}

/** The parts of CPython's random.Random that stars() uses, seeded with a 32-bit int. */
class PyRandom {
  private mt = new Uint32Array(624)
  private i = 625

  constructor(seed: number) {
    // init_genrand(19650218) then init_by_array([seed])
    const mt = this.mt
    mt[0] = 19650218
    for (let i = 1; i < 624; i++) mt[i] = Math.imul(1812433253, mt[i - 1] ^ (mt[i - 1] >>> 30)) + i
    let i = 1, j = 0
    for (let k = 624; k; k--) {
      mt[i] = (mt[i] ^ Math.imul(mt[i - 1] ^ (mt[i - 1] >>> 30), 1664525)) + seed + j
      i++; j++
      if (i >= 624) { mt[0] = mt[623]; i = 1 }
      if (j >= 1) j = 0
    }
    for (let k = 623; k; k--) {
      mt[i] = (mt[i] ^ Math.imul(mt[i - 1] ^ (mt[i - 1] >>> 30), 1566083941)) - i
      i++
      if (i >= 624) { mt[0] = mt[623]; i = 1 }
    }
    mt[0] = 0x80000000
    this.i = 624
  }

  private u32(): number {
    const mt = this.mt
    if (this.i >= 624) {
      for (let k = 0; k < 624; k++) {
        const y = (mt[k] & 0x80000000) | (mt[(k + 1) % 624] & 0x7fffffff)
        mt[k] = mt[(k + 397) % 624] ^ (y >>> 1) ^ (y & 1 ? 0x9908b0df : 0)
      }
      this.i = 0
    }
    let y = mt[this.i++]
    y ^= y >>> 11
    y ^= (y << 7) & 0x9d2c5680
    y ^= (y << 15) & 0xefc60000
    y ^= y >>> 18
    return y >>> 0
  }

  random(): number { return ((this.u32() >>> 5) * 67108864 + (this.u32() >>> 6)) / 9007199254740992 }
  uniform(a: number, b: number): number { return a + (b - a) * this.random() }
  /** _randbelow via getrandbits (n < 2^32). */
  private below(n: number): number {
    const k = 32 - Math.clz32(n)
    let v = this.u32() >>> (32 - k)
    while (v >= n) v = this.u32() >>> (32 - k)
    return v
  }
  choice<T>(seq: T[]): T { return seq[this.below(seq.length)] }
  randint(a: number, b: number): number { return a + this.below(b - a + 1) }
}

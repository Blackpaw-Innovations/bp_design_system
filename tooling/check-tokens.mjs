#!/usr/bin/env node
/**
 * Fails if any `var(--x)` referenced under src/ is never defined by a
 * `--x:` declaration anywhere in src/tokens/*.css.
 *
 * This exists because the whole package once shipped two non-overlapping
 * custom-property vocabularies at once (see AGENTS.md) — components and
 * utility classes referencing legacy --hk-, --signal-, and shadcn-style
 * names that src/tokens/brand.css never defined, so they silently
 * rendered with no color, radius, or motion. Run on every PR
 * (.github/workflows/ci.yml) so that can't happen again without a build
 * failure.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const SRC = join(ROOT, 'src')
const TOKEN_FILES = ['brand.css', 'components.css', 'utilities.css'].map(f =>
  join(SRC, 'tokens', f)
)

function walk(dir, exts) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) out.push(...walk(full, exts))
    else if (exts.includes(extname(entry))) out.push(full)
  }
  return out
}

// 1. Collect every defined custom property: `--name:` at the start of a declaration.
const defined = new Set()
for (const file of TOKEN_FILES) {
  const text = readFileSync(file, 'utf8')
  for (const m of text.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)) defined.add(m[1])
}

// 2. Collect every bare `var(--name)` reference across src/ — but not
//    `var(--name, fallback)`. A fallback makes it a deliberate, safe
//    override hook for consuming apps (e.g. AppShell's --sidebar-border):
//    CSS always resolves it to something, so it isn't the silent-failure
//    bug this check exists to catch.
const files = walk(SRC, ['.css', '.ts', '.tsx'])
const problems = []
for (const file of files) {
  const text = readFileSync(file, 'utf8')
  for (const m of text.matchAll(/var\((--[a-zA-Z0-9-]+)\s*([,)])/g)) {
    const [, name, next] = m
    if (next === ',') continue // has a fallback — not a bug
    if (!defined.has(name)) {
      const line = text.slice(0, m.index).split('\n').length
      problems.push(`${file.replace(ROOT, '')}:${line}  var(${name}) — not defined in src/tokens/*.css`)
    }
  }
}

if (problems.length) {
  console.error(`✗ ${problems.length} undefined token reference(s):\n`)
  for (const p of [...new Set(problems)]) console.error('  ' + p)
  process.exit(1)
}
console.log(`✓ every var(--…) reference under src/ resolves to a token defined in src/tokens/*.css`)

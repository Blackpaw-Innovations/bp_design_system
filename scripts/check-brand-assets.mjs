#!/usr/bin/env node
// Brand asset guard for consumer repos (10 Oct 2026). Run from the consumer's root:
//   node node_modules/@blackpaw/ui/scripts/check-brand-assets.mjs          (npm repos)
//   node <bp_design_system checkout at a tag>/scripts/check-brand-assets.mjs --root .   (Odoo repos)
// Fails when the repo ships
//   1. a retired design-system brand file (manifest status "deprecated", e.g. hakiqa-logo-transparent, *-full-dark, *-gloss),
//   2. a logo / wordmark / favicon / app icon / Haki file that is not a design-system file. Resized copies are allowed
//      when named <design-system file name>-<size>.png (e.g. haki-empty-200.png, hakiqa-appicon-connect-192.png),
//   3. a Haki PNG with an opaque corner (a baked white or coloured tile),
//   4. code that puts Haki on a white tile or fades it, or names a retired logo file.
// Files that are not ours (client logos, payment badges) go in .brand-assets-allow at the repo root: one path or
// folder/ per line, then "# reason".
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, extname, join, relative, resolve } from 'node:path';
import { inflateSync } from 'node:zlib';

const dsRoot = resolve(import.meta.dirname, '..');
const rootArg = process.argv.indexOf('--root');
const root = resolve(rootArg > 0 ? process.argv[rootArg + 1] : process.cwd());
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.wrangler', '.turbo', 'coverage', '.worktrees']);
const IMAGE = /\.(png|svg|ico|webp|jpe?g|gif)$/i;
const BRAND_NAME = /hakiqa|haki[-_]|blackpaw|^bp[-_]|logo|wordmark|favicon|apple-touch|app-?icon|android-chrome|mstile|og[-_]?image|avatar|^pwa-|^icon[-_]?\d/i;
const CODE = /\.(tsx?|jsx?|mjs|html|xml|css|scss|py|json|webmanifest)$/i;

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? (SKIP_DIRS.has(e.name) ? [] : walk(join(dir, e.name))) : [join(dir, e.name)]);
}
const sha = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
const stem = (name) => basename(name, extname(name)).toLowerCase();

// Design-system brand files, keyed by content hash and by file stem.
const manifest = JSON.parse(readFileSync(join(dsRoot, 'src/assets/asset-manifest.json'), 'utf8'));
const byHash = new Map(), approvedStems = new Set(), retiredNames = new Set();
for (const asset of manifest.assets) for (const file of asset.files) {
  const path = join(dsRoot, file);
  if (!existsSync(path)) continue;
  byHash.set(sha(path), { file, id: asset.id, status: asset.status });
  if (asset.status === 'deprecated') retiredNames.add(basename(file).toLowerCase());
  else approvedStems.add(stem(file));
}

const allowPath = join(root, '.brand-assets-allow');
const allow = existsSync(allowPath)
  ? readFileSync(allowPath, 'utf8').split('\n').map((l) => l.replace(/#.*/, '').trim()).filter(Boolean)
  : [];
const allowed = (rel) => allow.some((a) => (a.endsWith('/') ? rel.startsWith(a) : rel === a));

// Alpha of a PNG's four corners; null when it has no 8-bit RGBA channel (palette/greyscale/interlaced).
function cornerAlphas(file) {
  const buf = readFileSync(file);
  let pos = 8, width = 0, height = 0, colorType = 0, bitDepth = 0, interlace = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos), type = buf.toString('ascii', pos + 4, pos + 8), data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') { width = data.readUInt32BE(0); height = data.readUInt32BE(4); bitDepth = data[8]; colorType = data[9]; interlace = data[12]; }
    if (type === 'IDAT') idat.push(data);
    pos += 12 + len;
  }
  if (colorType !== 6 || bitDepth !== 8 || interlace) return null;
  const raw = inflateSync(Buffer.concat(idat)), bpp = 4, stride = width * bpp, rows = [];
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)], line = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? line[x - bpp] : 0, b = prev[x], c = x >= bpp ? prev[x - bpp] : 0;
      const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      const pred = filter === 1 ? a : filter === 2 ? b : filter === 3 ? (a + b) >> 1 : filter === 4 ? (pa <= pb && pa <= pc ? a : pb <= pc ? b : c) : 0;
      line[x] = (line[x] + pred) & 0xff;
    }
    rows.push(line);
    prev = line;
  }
  const alpha = (x, y) => rows[y][x * bpp + 3];
  return [alpha(0, 0), alpha(width - 1, 0), alpha(0, height - 1), alpha(width - 1, height - 1)];
}

const problems = [];
let ok = 0;
const files = walk(root);
for (const file of files.filter((f) => IMAGE.test(f) && BRAND_NAME.test(basename(f)))) {
  const rel = relative(root, file).replaceAll('\\', '/');
  if (allowed(rel)) continue;
  const hit = byHash.get(sha(file));
  const resized = !hit && /\.(png|webp)$/i.test(rel) && approvedStems.has(stem(rel).replace(/-\d+(x\d+)?$/, ''));
  if (hit?.status === 'deprecated') { problems.push(`${rel}: retired design-system file ${hit.file} (${hit.id})`); continue; }
  if (!hit && !resized) { problems.push(`${rel}: not a design-system brand file; use @blackpaw/ui/assets/... (or add to .brand-assets-allow if it is not ours)`); continue; }
  if (/(^|\/)haki-[^/]*\.png$/i.test(rel)) {
    const corners = cornerAlphas(file);
    if (!corners) { problems.push(`${rel}: Haki without an RGBA alpha channel; use the transparent design-system pose`); continue; }
    if (corners.some((a) => a > 8)) { problems.push(`${rel}: Haki with an opaque corner (alpha ${corners.join('/')}), a baked tile`); continue; }
  }
  ok++;
}

const retiredRef = retiredNames.size ? new RegExp([...retiredNames].map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i') : null;
for (const file of files.filter((f) => CODE.test(f))) {
  const rel = relative(root, file).replaceAll('\\', '/');
  if (allowed(rel) || rel === '.brand-assets-allow') continue;
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    if (retiredRef?.test(line)) problems.push(`${rel}:${i + 1}: names a retired logo file`);
    if (/<img\b/.test(line) && /haki-|mascot|alt=["']Haki/i.test(line) && /\bbg-white\b|\bopacity-\d+\b|opacity:\s*0?\.\d/.test(line))
      problems.push(`${rel}:${i + 1}: Haki on a white tile or faded; show the transparent pose as it is`);
  });
}

if (problems.length) {
  console.error(`[check-brand-assets] ${problems.length} problem(s):\n  - ${problems.join('\n  - ')}`);
  process.exit(1);
}
console.log(`[check-brand-assets] ok: ${ok} brand file(s), all from the design system`);

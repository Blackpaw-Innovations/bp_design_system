import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const failures = [];
const required = ['AGENTS.md', 'BRAND.md', 'docs/index.html', 'docs/brand/BRAND_GUIDELINES.md', 'src/tokens/index.css'];
for (const file of required) if (!existsSync(join(root, file))) failures.push(`Missing required file: ${file}`);

const manifestPath = join(root, 'src/assets/asset-manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const ids = new Set();
const declaredFiles = new Set();
for (const asset of manifest.assets) {
  if (ids.has(asset.id)) failures.push(`Duplicate asset ID: ${asset.id}`);
  ids.add(asset.id);
  for (const file of asset.files) {
    declaredFiles.add(file.replaceAll('\\', '/'));
    if (!existsSync(join(root, file))) failures.push(`Manifest asset does not exist: ${file}`);
  }
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const brandAssetRoot = join(root, 'src/assets/brand');
for (const file of walk(brandAssetRoot)) {
  const rel = relative(root, file).replaceAll('\\', '/');
  if (!declaredFiles.has(rel)) failures.push(`Brand asset missing from manifest: ${rel}`);
}

const bannedFonts = /\b(?:Gotham|Google Sans|Playfair|Newsreader|Manrope)\b/i;
const sourceFiles = walk(join(root, 'src')).filter((file) => ['.css', '.ts', '.tsx', '.js', '.jsx'].includes(extname(file)));
for (const file of sourceFiles) {
  if (bannedFonts.test(readFileSync(file, 'utf8'))) failures.push(`Non-Urbanist app font reference: ${relative(root, file)}`);
}

const tokenText = readFileSync(join(root, 'src/tokens/brand.css'), 'utf8');
for (const token of ['--bp-light-blue', '--bp-electric-blue', '--bp-purple', '--bp-coral', '--bp-dark-navy', '--bp-font-ui']) {
  if (!tokenText.includes(token)) failures.push(`Missing canonical token: ${token}`);
}

const html = readFileSync(join(root, 'docs/index.html'), 'utf8');
for (const anchor of ['brand', 'foundations', 'modes', 'identities', 'components', 'documents', 'assets', 'build']) {
  if (!html.includes(`id="${anchor}"`)) failures.push(`Portal missing section: #${anchor}`);
}
for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
  const link = match[1];
  if (/^(?:#|https?:|data:|mailto:)/.test(link)) continue;
  const clean = decodeURIComponent(link.split('#')[0].split('?')[0]);
  if (!existsSync(resolve(dirname(join(root, 'docs/index.html')), clean))) failures.push(`Broken portal link: ${link}`);
}

if (failures.length) {
  console.error(`Brand-system checks failed (${failures.length}):\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
console.log(`Brand-system checks passed: ${manifest.assets.length} asset groups, ${declaredFiles.size} files, canonical portal and tokens present.`);

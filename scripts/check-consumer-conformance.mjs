import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';

const args = process.argv.slice(2);
const valueAfter = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const consumerRoot = resolve(valueAfter('--root') || process.cwd());
const configPath = resolve(consumerRoot, valueAfter('--config') || 'blackpaw.conformance.json');
if (!existsSync(configPath)) {
  console.error(`DS-01: missing ${relative(consumerRoot, configPath)}. Add the vertical conformance declaration.`);
  process.exit(1);
}

const config = JSON.parse(readFileSync(configPath, 'utf8'));
const rules = JSON.parse(readFileSync(resolve(import.meta.dirname, '../conformance/experience-rules.json'), 'utf8'));
const sourceRoots = (config.sourceRoots || ['src']).map((directory) => resolve(consumerRoot, directory));
const excludes = (config.excludes || []).map((part) => part.replaceAll('\\', '/'));
const findings = [];
const extensions = new Set(['.css', '.scss', '.js', '.jsx', '.ts', '.tsx']);

function walk(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    const rel = relative(consumerRoot, path).replaceAll('\\', '/');
    if (excludes.some((excluded) => rel === excluded || rel.startsWith(`${excluded}/`))) return [];
    return entry.isDirectory() ? walk(path) : extensions.has(extname(path)) ? [path] : [];
  });
}

const files = sourceRoots.flatMap(walk);
const packagePath = join(consumerRoot, 'package.json');
const packageJson = existsSync(packagePath) ? JSON.parse(readFileSync(packagePath, 'utf8')) : {};
const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
if (!dependencies['@blackpaw/ui']) findings.push({ gate: 'DS-01', file: 'package.json', message: 'Missing @blackpaw/ui dependency.' });

const allText = files.map((file) => readFileSync(file, 'utf8')).join('\n');
if (!/@blackpaw\/ui\/tokens|@import\s+['"][^'"]*tokens/.test(allText)) {
  findings.push({ gate: 'DS-01', file: '(application styles)', message: 'Canonical @blackpaw/ui token entrypoint is not imported.' });
}

const bannedFont = new RegExp(`\\b(?:${rules.staticDefaults.bannedFonts.map((font) => font.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')).join('|')})\\b`, 'i');
const rawColor = /#[0-9a-f]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\s*\(/i;
const arbitrarySpace = /(?:^|\s)(?:m[trblxy]?|p[trblxy]?|gap|space-[xy]|top|right|bottom|left)-\[[^\]]+\]/;
for (const file of files) {
  const rel = relative(consumerRoot, file).replaceAll('\\', '/');
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, index) => {
    if (/allow-(?:raw-color|font|spacing):/.test(line)) return;
    if (bannedFont.test(line)) findings.push({ gate: 'DS-02', file: rel, line: index + 1, message: 'Unapproved application font.' });
    if (rawColor.test(line) && !/var\(--|(?:token|palette|theme)/i.test(rel)) findings.push({ gate: 'DS-02', file: rel, line: index + 1, message: 'Raw colour outside a token source.' });
    if (arbitrarySpace.test(line)) findings.push({ gate: 'DS-03', file: rel, line: index + 1, message: 'Arbitrary layout spacing.' });
  });
  const base = rel.split('/').at(-1)?.replace(/\.[^.]+$/, '');
  if (base && rules.staticDefaults.sharedComponentNames.includes(base) && !rel.startsWith('src/vendor/')) {
    findings.push({ gate: 'DS-04', file: rel, message: `Local clone of shared ${base} component.` });
  }
}

const baseline = config.legacyBaseline;
if (baseline) {
  if (!baseline.expires || Number.isNaN(Date.parse(baseline.expires))) findings.push({ gate: 'DS-12', file: 'blackpaw.conformance.json', message: 'Legacy baseline requires a valid expiry.' });
  else if (Date.parse(baseline.expires) < Date.now()) findings.push({ gate: 'DS-12', file: 'blackpaw.conformance.json', message: `Legacy baseline expired ${baseline.expires}.` });
}
const counts = findings.reduce((result, finding) => ({ ...result, [finding.gate]: (result[finding.gate] || 0) + 1 }), {});
const excess = findings.filter((finding) => !baseline || (counts[finding.gate] || 0) > (baseline.maximums?.[finding.gate] ?? 0));
const report = { version: rules.version, root: consumerRoot, counts, findings };
if (args.includes('--json')) console.log(JSON.stringify(report, null, 2));
else for (const finding of findings) console.error(`${finding.gate} ${finding.file}${finding.line ? `:${finding.line}` : ''} — ${finding.message}`);
if (excess.length) {
  console.error(`Experience conformance failed: ${excess.length} finding(s) exceed the approved baseline.`);
  process.exit(1);
}
console.log(`Experience conformance passed: ${findings.length} legacy finding(s), no regression.`);

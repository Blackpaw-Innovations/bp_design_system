import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const registryPath = join(root, 'conformance/experience-rules.json');
const standardPath = join(root, 'docs/EXPERIENCE_CONFORMANCE_STANDARD.md');
const failures = [];

if (!existsSync(registryPath)) failures.push('Missing experience gate registry.');
if (!existsSync(standardPath)) failures.push('Missing experience conformance standard.');

if (!failures.length) {
  const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
  const ids = registry.gates.map((gate) => gate.id);
  const expected = Array.from({ length: 13 }, (_, index) => `DS-${String(index + 1).padStart(2, '0')}`);
  if (new Set(ids).size !== ids.length) failures.push('Experience gate IDs must be unique.');
  if (JSON.stringify(ids) !== JSON.stringify(expected)) failures.push(`Expected contiguous gates ${expected.join(', ')}.`);
  if (registry.gates.some((gate) => gate.blocking !== true)) failures.push('Every registered experience gate must be blocking.');
  const standard = readFileSync(standardPath, 'utf8');
  for (const id of expected) if (!standard.includes(id)) failures.push(`Standard does not define ${id}.`);
  if (!standard.includes('390×844') || !standard.includes('768×1024') || !standard.includes('1440×900')) failures.push('Required viewports are not documented.');
}

if (failures.length) {
  console.error(`Experience-contract checks failed (${failures.length}):\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
console.log('Experience-contract checks passed: 13 blocking gates, canonical viewports and documentation agree.');

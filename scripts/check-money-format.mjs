// One money format for every vertical (v1.25.2): "KES 15,000". Needs Node >= 23.6 (imports the .ts source directly).
import assert from 'node:assert/strict';
import { formatMoney, moneyParts } from '../src/lib/format.ts';

assert.equal(formatMoney(92000), 'KES 92,000');
assert.equal(formatMoney(15000, 'KSh'), 'KES 15,000');
assert.equal(formatMoney(42.1), 'KES 42.10');
assert.equal(formatMoney(-350, 'kes'), '−KES 350');
assert.equal(formatMoney(400, 'USD'), 'USD 400');
assert.equal(formatMoney(null), '—');
assert.deepEqual(moneyParts(116000, 'KES'), { sign: '', currency: 'KES', figure: '116,000' });
assert.deepEqual(moneyParts(-0.001), { sign: '', currency: 'KES', figure: '0' });
console.log('Money format checks passed.');

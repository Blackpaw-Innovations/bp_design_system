// renderDocument(): empty columns dropped, blank meta dropped, text escaped, custom docs keep the house layout.
import { renderDocument, buildDocumentHtml } from '../src/lib/printDocument.ts'
import assert from 'node:assert/strict'

const html = renderDocument({
  kind: 'Goods Received Note', title: 'GRN 1', branding: { name: 'Org <A>', accent: '#0a7f5a' },
  columns: [{ key: 'item', label: 'Item' }, { key: 'batch', label: 'Batch' }, { key: 'qty', label: 'Received', align: 'right' }],
  lines: [{ item: 'Maize', batch: '', qty: 10 }, { item: 'Beans', qty: 5 }],
  meta: [{ label: 'Location', value: 'Kitui' }, { label: 'Empty', value: '' }],
  signatures: [{ label: 'Received by', name: 'Jane' }],
})
assert.ok(!html.includes('>Batch<'), 'empty column should be dropped')
assert.ok(html.includes('>Received<') && html.includes('>Maize<'))
assert.ok(!html.includes('>Empty<'), 'blank meta should be dropped')
assert.ok(html.includes('Org &lt;A&gt;') && !html.includes('Org <A>'), 'branding escaped')
assert.ok(html.includes('Goods Received <span class="accent">Note</span>'))
assert.ok(html.includes('Received by · Jane'))
assert.ok(buildDocumentHtml({ title: 't', branding: { name: 'x' }, docType: 'Receipt', bodyHtml: '' }).includes("url('/fonts/google-sans/"), 'default asset base is origin root')
console.log('documents: ok')
// Paper sizes: A4 output unchanged by default, roll80/landscape append their own @page.
const a4 = renderDocument({ kind: 'Receipt', title: 'R', branding: { name: 'x' } })
assert.ok(!a4.includes('80mm') && !a4.includes('landscape'), 'default stays A4 portrait')
assert.ok(renderDocument({ kind: 'Receipt', title: 'R', branding: { name: 'x' }, paper: 'roll80' }).includes('@page { size: 80mm 297mm'))
assert.ok(renderDocument({ kind: 'Statement', title: 'S', branding: { name: 'x' }, paper: 'a4-landscape' }).includes('size: A4 landscape'))
console.log('paper: ok')
// Readable brand colour: light colours get dark text on filled bars and a darker title; dark colours keep white. Ink saver drops fills.
import { readableAccent } from '../src/lib/printDocument.ts'
assert.equal(readableAccent('#F5C400').ink, '#111827', 'yellow bar gets dark text')
assert.notEqual(readableAccent('#F5C400').text.toLowerCase(), '#f5c400', 'yellow title is darkened')
assert.equal(readableAccent('#1E3A7A').ink, '#ffffff', 'navy keeps white text')
assert.equal(readableAccent('#1E3A7A').text, '#1E3A7A', 'navy title unchanged')
const saver = renderDocument({ kind: 'Receipt', title: 'R', branding: { name: 'x', accent: '#0a7f5a', inkSaver: true } })
assert.ok(saver.includes('Ink saver'), 'ink saver style present')
assert.ok(!renderDocument({ kind: 'Receipt', title: 'R', branding: { name: 'x' } }).includes('Ink saver'), 'off by default')
console.log('accent: ok')

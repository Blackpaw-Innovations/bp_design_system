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

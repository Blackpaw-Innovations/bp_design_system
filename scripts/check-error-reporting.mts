// Crash-report dedupe, rate limit and scrubbing. Needs Node >= 22.18 (runs .ts directly).
import assert from 'node:assert/strict'
import { createReportLimiter, scrub } from '../src/lib/errorReporting.ts'

const allow = createReportLimiter(20, 60_000)
assert.equal(allow('A', 0), true, 'first A is sent')
assert.equal(allow('A', 59_999), false, 'same message inside a minute is dropped')
assert.equal(allow('B', 1), true, 'a different message is sent')
assert.equal(allow('A', 60_000), true, 'same message after a minute is sent again')
for (let i = 0; i < 17; i++) assert.equal(allow(`m${i}`, 100), true)
assert.equal(allow('one-more', 100), false, '21st report in a session is dropped')
assert.equal(allow('A', 999_999), false, 'cap holds after the window too')

assert.equal(scrub('Failed for jane.doe@example.co.ke'), 'Failed for [email]')
assert.equal(scrub('Authorization: Bearer abc.def'), 'Authorization: Bearer [token]')
assert.equal(scrub('jwt eyJhbGciOi.eyJzdWIiOi.sig-part here'), 'jwt [token] here')
assert.equal(scrub('at f (https://x.hakiqa.com/assets/a.js?token=s3cret:10:5)'), 'at f (https://x.hakiqa.com/assets/a.js:10:5)')
assert.equal(scrub('key ' + 'a'.repeat(40)), 'key [token]')
assert.equal(scrub('ab '.repeat(300)).length, 500)
assert.equal(scrub('Cannot read properties of undefined (reading \'id\')'), 'Cannot read properties of undefined (reading \'id\')')

const t0 = performance.now()
for (const bad of ['+'.repeat(100_000), '-'.repeat(100_000), 'a@'.repeat(50_000), 'http://' + 'a'.repeat(100_000)]) scrub(bad)
assert.ok(performance.now() - t0 < 500, 'scrub stays fast on hostile input')

console.log('error reporting: dedupe, rate limit and scrub ok.')

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { withRetry } from './retry.js';

test('retries a 503 then succeeds', async () => {
  let n = 0;
  const out = await withRetry(async () => { if (++n < 3) throw Object.assign(new Error('busy'), { status: 503 }); return 'ok'; }, { baseMs: 1 });
  assert.equal(out, 'ok'); assert.equal(n, 3);
});
test('does not retry a 403', async () => {
  let n = 0;
  await assert.rejects(withRetry(async () => { n++; throw Object.assign(new Error('no'), { status: 403 }); }, { baseMs: 1 }));
  assert.equal(n, 1);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeContract } from './analyzer.js';

const text = `12.3 Liability\n\nCustomer's liability to Provider under this Agreement shall not be limited in amount.\n\n13.1 Indemnity\n\nCustomer shall indemnify and hold harmless Provider from any and all claims arising out of its use of the Services.\n\n`.repeat(2) + 'x'.repeat(200);
const failing = (status) => ({ name: 'gemini', model: () => 'test', generateJson: async () => { throw Object.assign(new Error('boom'), { status }); } });

for (const [status, reason] of [[503, 'busy'], [401, 'key'], [404, 'model']]) {
  test(`AI error ${status} falls back to the rule engine and still returns findings`, async () => {
    const r = await analyzeContract({ text, perspective: 'Customer', provider: failing(status), fileName: 'x.txt' });
    assert.equal(r.meta.engine, 'rules');
    assert.ok(r.meta.fallbackReason.toLowerCase().includes(reason));
    assert.ok(r.clauses.some((c) => c.title === 'Unlimited Liability' && c.source === 'rules'));
  });
}

test('invalid JSON from the AI also falls back', async () => {
  const bad = { name: 'gemini', model: () => 't', generateJson: async () => 'not json' };
  assert.equal((await analyzeContract({ text, perspective: 'Customer', provider: bad, fileName: 'x.txt' })).meta.engine, 'rules');
});

test('rules-only provider never calls an AI', async () => {
  const rules = { name: 'rules', model: () => 'r', generateJson: async () => { throw new Error('must not be called'); } };
  assert.equal((await analyzeContract({ text, perspective: 'Customer', provider: rules, fileName: 'x.txt' })).meta.engine, 'rules');
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeContract } from './analyzer.js';

const text = `12.3 Liability\n\nCustomer's liability to Provider under this Agreement shall not be limited in amount.\n\n`.repeat(2) + 'x'.repeat(200);
const failing = (status) => ({ name: 'gemini', model: () => 'test', generateJson: async () => { throw Object.assign(new Error('boom'), { status }); } });

for (const [status, reason] of [[503, 'busy'], [401, 'key'], [404, 'model']]) {
  test(`AI error ${status} falls back to the role-aware rule engine`, async () => {
    const r = await analyzeContract({ text, role: 'buyer', provider: failing(status), fileName: 'x.txt' });
    assert.equal(r.meta.engine, 'rules'); assert.ok(r.meta.fallbackReason.toLowerCase().includes(reason));
    assert.ok(r.findings.some((f) => f.title === 'Unlimited Liability' && f.source === 'rules' && f.stance === 'unfavourable'));
  });
}
test('same text reviewed as Service Provider marks buyer-side exposure favourable', async () => {
  const r = await analyzeContract({ text, role: 'provider', provider: failing(503), fileName: 'x.txt' });
  assert.equal(r.findings.find((f) => f.title === 'Unlimited Liability').stance, 'favourable');
});
test('invalid JSON from the AI also falls back', async () => {
  const bad = { name: 'gemini', model: () => 't', generateJson: async () => 'not json' };
  assert.equal((await analyzeContract({ text, role: 'buyer', provider: bad, fileName: 'x.txt' })).meta.engine, 'rules');
});
test('page numbers are resolved from PDF pages', async () => {
  const pages = ['cover page', "12.3 liability customer's liability to provider under this agreement shall not be limited in amount."];
  const r = await analyzeContract({ text, pages, role: 'buyer', provider: failing(503), fileName: 'x.pdf' });
  assert.equal(r.findings.find((f) => f.title === 'Unlimited Liability').page, 2);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAnalysis, parseModelJson } from './validate.js';

const source = 'Client may terminate the Agreement at any time on 7 days notice.';
const f = { title: 'Termination', section: '9', stance: 'unfavourable', severity: 'high', text: 'Client may terminate the Agreement at any time', explanation: 'x', recommendation: 'y' };

test('keeps findings whose quote exists in the source', () => assert.equal(normalizeAnalysis({ findings: [f] }, source).findings.length, 1));
test('drops fabricated quotes and warns', () => {
  const r = normalizeAnalysis({ findings: [{ ...f, text: 'Provider pays everything' }] }, source);
  assert.equal(r.findings.length, 0); assert.equal(r.warnings.length, 1);
});
test('favourable findings can never carry a risk severity', () => {
  const r = normalizeAnalysis({ findings: [{ ...f, stance: 'favourable', severity: 'critical' }] }, source);
  assert.equal(r.findings[0].severity, 'none');
});
test('unknown category falls back to Miscellaneous', () => assert.equal(normalizeAnalysis({ findings: [{ ...f, category: 'Zzz' }] }, source).findings[0].category, 'Miscellaneous'));
test('parses fenced JSON', () => assert.deepEqual(parseModelJson('```json\n{"a":1}\n```'), { a: 1 }));

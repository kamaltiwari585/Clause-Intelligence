import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAnalysis, parseModelJson } from './validate.js';

const source = 'Customer shall indemnify Provider from all claims.';
const good = { title: 'Indemnity', section: '1', risk: 'high', text: 'Customer shall indemnify Provider', issue: 'x', negotiation: 'y', revision: 'z' };

test('keeps clauses whose quote exists in the source', () => {
  assert.equal(normalizeAnalysis({ clauses: [good] }, source).clauses.length, 1);
});
test('drops fabricated quotes and reports a warning', () => {
  const r = normalizeAnalysis({ clauses: [{ ...good, text: 'Provider pays everything' }] }, source);
  assert.equal(r.clauses.length, 0);
  assert.equal(r.warnings.length, 1);
});
test('parses fenced JSON', () => assert.deepEqual(parseModelJson('```json\n{"a":1}\n```'), { a: 1 }));

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildReview } from './review.js';

const f = (title, severity, stance = 'unfavourable') => ({ title, severity, stance, shortSummary: title, recommendation: `fix ${title}` });
const base = { fileName: 'x.pdf', role: 'provider', warnings: [], meta: {}, overview: '', contractType: '', parties: [] };

test('score counts only unfavourable findings and ranks priorities by severity', () => {
  const r = buildReview({ ...base, findings: [f('A', 'high'), f('B', 'critical'), f('C', 'none', 'favourable')], missing: [] });
  assert.equal(r.score.value, 40); assert.equal(r.score.label, 'MODERATE');
  assert.equal(r.priorities[0].clause, 'B'); assert.equal(r.summary.favourable, 1);
});
test('missing protections are counted and weighted lower', () => {
  const r = buildReview({ ...base, findings: [], missing: [{ title: 'Data Protection', severity: 'high', explanation: 'e', recommendation: 'r' }] });
  assert.equal(r.summary.missing, 1); assert.equal(r.score.value, 9); assert.equal(r.score.label, 'LOW');
});
test('score is capped at 100 and only top 5 priorities are returned', () => {
  const r = buildReview({ ...base, findings: Array.from({ length: 8 }, (_, i) => f(`C${i}`, 'critical')), missing: [] });
  assert.equal(r.score.value, 100); assert.equal(r.priorities.length, 5); assert.equal(r.score.label, 'HIGH');
});

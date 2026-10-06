import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeWithRules } from './ruleEngine.js';
import { normalizeAnalysis } from '../validate.js';

const term = '9.1 Termination\n\nThe Client may terminate the Agreement at any time without cause by giving 7 days\' notice to the Service Provider.';
const find = (r, t) => r.findings.find((f) => f.title === t);

test('7-day client termination: HIGH risk for the Service Provider', () => {
  const f = find(analyzeWithRules(term, 'provider'), 'Termination for Convenience');
  assert.equal(f.stance, 'unfavourable'); assert.equal(f.severity, 'high'); assert.equal(f.section, '9.1');
});
test('same clause is FAVOURABLE (not a risk) for the Buyer', () => {
  const f = find(analyzeWithRules(term, 'buyer'), 'Termination for Convenience');
  assert.equal(f.stance, 'favourable'); assert.equal(f.severity, 'none'); assert.equal(f.suggestedLanguage, '');
});
test('Customer-only indemnity: unfavourable to buyer, favourable to provider', () => {
  const t = '13.1 Indemnity\n\nCustomer shall indemnify and hold harmless Provider from any and all claims arising out of its use of the Services.';
  assert.equal(find(analyzeWithRules(t, 'buyer'), 'Indemnity').stance, 'unfavourable');
  assert.equal(find(analyzeWithRules(t, 'provider'), 'Indemnity').stance, 'favourable');
});
test('mutual indemnity is neutral', () => {
  const t = 'Each party shall indemnify the other against third-party claims arising from its breach of this Agreement and its terms.';
  assert.equal(find(analyzeWithRules(t, 'buyer'), 'Indemnity').stance, 'neutral');
});
test('missing protections depend on role', () => {
  const t = 'This agreement covers consulting services between the parties for the stated term and nothing else of note appears here. '.repeat(3);
  assert.ok(!analyzeWithRules(t, 'buyer').missing.some((m) => m.title === 'Payment Terms'));
  assert.ok(analyzeWithRules(t, 'buyer').missing.some((m) => m.title === 'Data Protection'));
});
test('quotes pass the same verification as AI output', () => {
  const r = analyzeWithRules(term, 'provider');
  assert.equal(normalizeAnalysis({ findings: r.findings }, term).findings.length, r.findings.length);
});

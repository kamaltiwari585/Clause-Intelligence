import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeWithRules } from './ruleEngine.js';
import { normalizeAnalysis } from '../validate.js';

const contract = `1. Services\n\nProvider shall deliver the Services described in Schedule A to the Customer throughout the term.\n\n12.3 Liability\n\nCustomer's liability to Provider under this Agreement shall not be limited in amount.\n\n13.1 Indemnity\n\nCustomer shall indemnify and hold harmless Provider from any and all claims arising out of its use of the Services.\n\n17.2 Termination\n\nProvider may terminate this Agreement at any time on thirty days written notice to the Customer.`;

test('flags liability, indemnity and termination with section numbers', () => {
  const r = analyzeWithRules(contract);
  const by = Object.fromEntries(r.clauses.map((c) => [c.title, c]));
  assert.equal(by['Unlimited Liability'].section, '12.3');
  assert.equal(by['One-sided Indemnity'].section, '13.1');
  assert.equal(by['Unilateral Termination Right'].risk, 'moderate');
});
test('reports absent clauses such as data protection', () => {
  assert.ok(analyzeWithRules(contract).missing.some((m) => m.title === 'Data Protection'));
});
test('mutual indemnity is not flagged', () => {
  const r = analyzeWithRules('Each party shall indemnify the other against third-party claims arising from its breach of this Agreement and the terms hereof.');
  assert.equal(r.clauses.length, 0);
});
test('quotes pass the same verification as AI output', () => {
  const r = analyzeWithRules(contract);
  assert.equal(normalizeAnalysis({ clauses: r.clauses }, contract).clauses.length, r.clauses.length);
});

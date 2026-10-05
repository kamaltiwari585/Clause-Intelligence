import { describe, it, expect } from 'vitest';
import { filterClauses } from './clauseFilters';

const data = [
  { id: 1, risk: 'high', oneSided: true, incomplete: false },
  { id: 2, risk: 'moderate', oneSided: false, incomplete: true },
  { id: 3, risk: 'missing', oneSided: false, incomplete: true },
];

describe('filterClauses', () => {
  it('returns everything for "all"', () => expect(filterClauses(data, 'all')).toHaveLength(3));
  it('filters by risk', () => expect(filterClauses(data, 'high').map((c) => c.id)).toEqual([1]));
  it('filters incomplete', () => expect(filterClauses(data, 'incomplete')).toHaveLength(2));
  it('throws on unknown filter', () => expect(() => filterClauses(data, 'nope')).toThrow());
});

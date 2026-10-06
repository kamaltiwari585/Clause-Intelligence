import { describe, it, expect } from 'vitest';
import { filterFindings, categoriesOf } from './findingFilters';

const data = [
  { id: 1, stance: 'unfavourable', severity: 'critical', category: 'Liability', kind: 'clause' },
  { id: 2, stance: 'favourable', severity: 'none', category: 'Termination', kind: 'clause' },
  { id: 3, stance: 'unfavourable', severity: 'medium', category: 'Data Protection / Privacy', kind: 'missing' },
];

describe('filterFindings', () => {
  it('severity filters only match unfavourable findings', () => expect(filterFindings(data, 'critical').map((f) => f.id)).toEqual([1]));
  it('favourable findings never appear as risks', () => expect(filterFindings(data, 'unfavourable').map((f) => f.id)).toEqual([1, 3]));
  it('combines with category', () => expect(filterFindings(data, 'all', 'Termination').map((f) => f.id)).toEqual([2]));
  it('filters missing protections', () => expect(filterFindings(data, 'missing')).toHaveLength(1));
  it('lists categories present', () => expect(categoriesOf(data)).toHaveLength(3));
  it('throws on unknown filter', () => expect(() => filterFindings(data, 'nope')).toThrow());
});

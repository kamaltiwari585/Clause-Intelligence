/** Pure filter logic: no React, easy to unit test. */
const PREDICATES = {
  all: () => true,
  high: (c) => c.risk === 'high',
  moderate: (c) => c.risk === 'moderate',
  'one-sided': (c) => c.oneSided === true,
  incomplete: (c) => c.incomplete === true,
  missing: (c) => c.risk === 'missing',
};

export function filterClauses(clauses, filterId) {
  const predicate = PREDICATES[filterId];
  if (!predicate) throw new Error(`Unknown clause filter: "${filterId}"`);
  return clauses.filter(predicate);
}

export function countByFilter(clauses, filterIds) {
  return Object.fromEntries(filterIds.map((id) => [id, filterClauses(clauses, id).length]));
}

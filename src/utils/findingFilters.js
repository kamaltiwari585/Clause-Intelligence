/** Pure filter logic: no React, easy to unit test. */
const bad = (f, sev) => f.stance === 'unfavourable' && f.severity === sev;
const PREDICATES = {
  all: () => true,
  critical: (f) => bad(f, 'critical'), high: (f) => bad(f, 'high'), medium: (f) => bad(f, 'medium'), low: (f) => bad(f, 'low'),
  favourable: (f) => f.stance === 'favourable', unfavourable: (f) => f.stance === 'unfavourable',
  neutral: (f) => f.stance === 'neutral', missing: (f) => f.kind === 'missing',
};

export function filterFindings(findings, filterId, category = 'all') {
  const predicate = PREDICATES[filterId];
  if (!predicate) throw new Error(`Unknown finding filter: "${filterId}"`);
  return findings.filter((f) => predicate(f) && (category === 'all' || f.category === category));
}

export const countByFilter = (findings, ids) => Object.fromEntries(ids.map((id) => [id, filterFindings(findings, id).length]));
export const categoriesOf = (findings) => [...new Set(findings.map((f) => f.category))].sort();

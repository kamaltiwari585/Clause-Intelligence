/** Central place for enums and labels so UI and logic never drift apart. */
export const RISK_LABELS = Object.freeze({
  high: 'High risk', moderate: 'Moderate risk', low: 'Low risk', missing: 'Missing',
});

export const FILTERS = Object.freeze([
  { id: 'all', label: 'All' },
  { id: 'high', label: 'High Risk' },
  { id: 'moderate', label: 'Moderate Risk' },
  { id: 'one-sided', label: 'One-sided' },
  { id: 'incomplete', label: 'Incomplete' },
  { id: 'missing', label: 'Missing' },
]);

export const NAV_ITEMS = Object.freeze([
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'contracts', label: 'Contracts' },
  { id: 'clause-review', label: 'Clause Review' },
  { id: 'missing-clauses', label: 'Missing Clauses' },
  { id: 'reports', label: 'Reports' },
  { id: 'settings', label: 'Settings' },
]);

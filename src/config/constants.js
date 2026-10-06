/** Central place for enums and labels so UI and logic never drift apart. */
export const SEVERITY_LABELS = Object.freeze({ critical: 'Critical', high: 'High risk', medium: 'Medium risk', low: 'Low risk' });

export const FILTERS = Object.freeze([
  { id: 'all', label: 'All' }, { id: 'critical', label: 'Critical' }, { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' }, { id: 'low', label: 'Low' }, { id: 'favourable', label: 'Favourable' },
  { id: 'unfavourable', label: 'Unfavourable' }, { id: 'neutral', label: 'Neutral' }, { id: 'missing', label: 'Missing' },
]);

export const ROLE_OPTIONS = Object.freeze([
  { id: 'buyer', title: 'Buyer / Client', blurb: 'Flags excessive obligations, weak vendor warranties, inadequate indemnity, weak termination rights and lock-in.' },
  { id: 'provider', title: 'Service Provider / Vendor', blurb: 'Flags unlimited liability, broad indemnities, harsh SLAs and penalties, broad IP and open-ended audits.' },
]);

export const NAV_ITEMS = Object.freeze([
  { id: 'dashboard', label: 'Dashboard' }, { id: 'contracts', label: 'Contracts' }, { id: 'clause-review', label: 'Clause Review' },
  { id: 'missing-clauses', label: 'Missing Clauses' }, { id: 'reports', label: 'Reports' }, { id: 'settings', label: 'Settings' },
]);

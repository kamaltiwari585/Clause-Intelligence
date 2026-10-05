/** Dashboard summary metrics derived from data; never hard-coded in the UI. */
export function computeSummary(contracts, clauses) {
  return {
    contractsReviewed: contracts.length,
    highRisk: contracts.reduce((n, c) => n + c.high, 0),
    moderateRisk: contracts.reduce((n, c) => n + c.moderate, 0),
    missingOrIncomplete: clauses.filter((c) => c.risk === 'missing' || c.incomplete).length,
  };
}

export function formatDate(iso) {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

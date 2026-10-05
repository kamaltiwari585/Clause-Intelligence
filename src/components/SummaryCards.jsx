const CARDS = [
  { key: 'contractsReviewed', label: 'Contracts Reviewed', tone: 'neutral' },
  { key: 'highRisk', label: 'High Risk Clauses', tone: 'high' },
  { key: 'moderateRisk', label: 'Moderate Risk Clauses', tone: 'moderate' },
  { key: 'missingOrIncomplete', label: 'Missing / Incomplete Clauses', tone: 'missing' },
];

export default function SummaryCards({ summary }) {
  return (
    <section className="cards" aria-label="Summary">
      {CARDS.map(({ key, label, tone }) => (
        <div key={key} className={`card stat stat--${tone}`}>
          <div className="stat__value">{summary[key]}</div>
          <div className="stat__label">{label}</div>
        </div>
      ))}
    </section>
  );
}

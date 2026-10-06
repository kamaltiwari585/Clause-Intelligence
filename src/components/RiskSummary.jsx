const SEV = [['critical', 'Critical Issues'], ['high', 'High Risk'], ['medium', 'Medium Risk'], ['low', 'Low Risk']];
const STATS = [['riskyClauses', 'Risky Clauses'], ['unfavourable', 'Unfavourable Clauses'], ['favourable', 'Favourable Clauses'], ['missing', 'Missing Protections']];

export default function RiskSummary({ summary }) {
  return (
    <section aria-label="Risk summary" className="stack">
      <h2 className="section-title">Risk Summary</h2>
      <div className="cards">
        {SEV.map(([k, label]) => <div key={k} className={`card stat stat--${k}`}><div className="stat__value">{summary.counts[k]}</div><div className="stat__label">{label}</div></div>)}
      </div>
      <div className="cards">
        {STATS.map(([k, label]) => <div key={k} className={`card stat stat--${k === 'favourable' ? 'favourable' : k === 'missing' ? 'missing' : 'neutral'}`}><div className="stat__value">{summary[k]}</div><div className="stat__label">{label}</div></div>)}
      </div>
    </section>
  );
}

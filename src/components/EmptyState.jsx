const STEPS = ['Upload your contract (PDF or DOCX)', 'Choose Buyer / Client or Service Provider / Vendor', 'AI reviews the contract from that position', 'Risky and unfavourable clauses are flagged and explained', 'Get negotiation points and suggested language'];

export default function EmptyState({ onUpload }) {
  return (
    <section className="card empty-state">
      <h2 className="intro__title">Contract Review Dashboard</h2>
      <p className="intro__lead">Identify potentially unfavourable, one-sided and incomplete provisions, judged from the side you are on, with the reasoning and suggested wording for each.</p>
      <ol className="steps">{STEPS.map((s) => <li key={s}>{s}</li>)}</ol>
      <button type="button" className="btn btn--primary" onClick={onUpload}>+ Upload Contract</button>
    </section>
  );
}

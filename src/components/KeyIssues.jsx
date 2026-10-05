export default function KeyIssues({ issues }) {
  return (
    <section className="card">
      <h2 className="section-title">Key Issues Identified</h2>
      <ul className="issues">
        {issues.map((i) => (
          <li key={i.id} className={`issue issue--${i.severity}`}>
            <div>
              <div className="issue__title">{i.title}</div>
              <div className="issue__note">{i.note}</div>
            </div>
            <div className="issue__count" title="Occurrences across reviewed contracts">{i.count}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}

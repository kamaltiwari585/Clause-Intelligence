import RiskBadge from './RiskBadge';

export default function NegotiationPriorities({ priorities, onView }) {
  if (!priorities.length) return null;
  return (
    <section className="card" aria-label="Negotiation priorities">
      <h2 className="section-title">Negotiation Priorities</h2>
      <p className="fineprint">The top {priorities.length} provisions to negotiate first.</p>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>#</th><th>Clause</th><th>Current position</th><th>Risk</th><th>Recommended position</th></tr></thead>
          <tbody>
            {priorities.map((p) => (
              <tr key={p.findingId}>
                <td>{p.priority}</td>
                <td className="table__name"><button type="button" className="link" onClick={() => onView(p.findingId)}>{p.clause}</button></td>
                <td>{p.currentPosition}</td>
                <td><RiskBadge finding={{ stance: 'unfavourable', severity: p.risk }} /></td>
                <td>{p.recommendedPosition}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

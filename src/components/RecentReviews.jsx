import { formatDate } from '../utils/metrics';

const STATUS_TONE = { Cleared: 'low', 'In Review': 'moderate', 'Needs Negotiation': 'high' };

export default function RecentReviews({ contracts }) {
  return (
    <section className="card">
      <h2 className="section-title">Recent Contract Reviews</h2>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Contract</th><th>Type</th><th>Reviewed</th><th>High</th><th>Moderate</th><th>Status</th></tr>
          </thead>
          <tbody>
            {contracts.map((c) => (
              <tr key={c.id}>
                <td className="table__name">{c.name}</td>
                <td>{c.type}</td>
                <td>{formatDate(c.reviewedOn)}</td>
                <td><span className="count count--high">{c.high}</span></td>
                <td><span className="count count--moderate">{c.moderate}</span></td>
                <td><span className={`badge badge--${STATUS_TONE[c.status] ?? 'low'}`}>{c.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

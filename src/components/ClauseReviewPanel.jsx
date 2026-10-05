import FilterBar from './FilterBar';
import RiskBadge from './RiskBadge';
import { useClauseReview } from '../hooks/useClauseReview';

const yesNo = (v) => (v ? 'Yes' : 'No');

function Detail({ clause }) {
  if (!clause) return <p className="empty">No clauses match this filter. Choose another filter to continue reviewing.</p>;
  return (
    <article className="detail">
      <header className="detail__head">
        <div>
          <h3 className="detail__title">{clause.title}</h3>
          <div className="detail__section">Section {clause.section}</div>
        </div>
        <RiskBadge level={clause.risk} />
      </header>

      <dl className="flags">
        <div><dt>One-sided</dt><dd className={clause.oneSided ? 'yes' : 'no'}>{yesNo(clause.oneSided)}</dd></div>
        <div><dt>Incomplete</dt><dd className={clause.incomplete ? 'yes' : 'no'}>{yesNo(clause.incomplete)}</dd></div>
      </dl>

      <h4>Original clause text</h4>
      {clause.text
        ? <blockquote className={`quote quote--${clause.risk}`}>{clause.text}</blockquote>
        : <p className="quote quote--missing">This clause does not appear in the contract.</p>}

      <h4>Issue explanation</h4>
      <p>{clause.issue}</p>
      <h4>Negotiation point</h4>
      <p>{clause.negotiation}</p>
      <h4>Suggested revision</h4>
      <div className="revision">{clause.revision}</div>
    </article>
  );
}

export default function ClauseReviewPanel({ clauses }) {
  const { filter, changeFilter, visible, counts, selected, selectClause } = useClauseReview(clauses);

  return (
    <section className="card review" aria-label="Clause review">
      <h2 className="section-title">Clause Review</h2>
      <FilterBar active={filter} counts={counts} onChange={changeFilter} />
      <div className="review__body">
        <ul className="clause-list">
          {visible.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className={`clause-item clause-item--${c.risk} ${selected?.id === c.id ? 'is-active' : ''}`}
                onClick={() => selectClause(c.id)}
              >
                <span className="clause-item__title">{c.title}</span>
                <span className="clause-item__meta">Section {c.section}</span>
              </button>
            </li>
          ))}
        </ul>
        <Detail clause={selected} />
      </div>
    </section>
  );
}

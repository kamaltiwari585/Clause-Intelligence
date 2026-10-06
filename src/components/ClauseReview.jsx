import { useState } from 'react';
import RiskBadge, { toneOf } from './RiskBadge';
import CopyButton from './CopyButton';
import { FILTERS } from '../config/constants';
import { filterFindings, countByFilter, categoriesOf } from '../utils/findingFilters';
import { useReviewActions } from '../hooks/useReviewActions';
import { createLogger } from '../utils/logger';

const log = createLogger('ClauseReview');

function Detail({ f, position, action, onStatus, onComment }) {
  const [commenting, setCommenting] = useState(Boolean(action?.comment));
  return (
    <article className="detail">
      <header className="detail__head">
        <div><h3 className="detail__title">{f.title}</h3><div className="detail__section">{f.kind === 'missing' ? 'Not present in contract' : `Section ${f.section}${f.page ? ` · Page ${f.page}` : ''}`}</div></div>
        <div className="detail__tags"><RiskBadge finding={f} />{f.source === 'rules' && <span className="tag" title="Found by built-in rules, not AI">Rule-based</span>}{action?.status && <span className="tag">{action.status === 'accepted' ? 'Accepted' : 'Flagged'}</span>}</div>
      </header>

      <dl className="grid-dl">
        <dt>Position</dt><dd>{position}</dd>
        <dt>Favours</dt><dd>{f.favours}</dd>
        <dt>Risk type</dt><dd>{f.riskType}</dd>
        <dt>Category</dt><dd>{f.category}</dd>
      </dl>

      <h4>Original text</h4>
      {f.text ? <blockquote className={`quote quote--${toneOf(f)}`}>{f.text}</blockquote> : <p className="quote quote--missing">This clause does not appear in the contract.</p>}
      <h4>Analysis</h4><p>{f.explanation}</p>
      <h4>Recommendation</h4><p>{f.recommendation}</p>
      {f.suggestedLanguage && (<><h4>Suggested language</h4><div className="revision">{f.suggestedLanguage}</div></>)}

      <div className="actions">
        <button type="button" className={`btn btn--sm ${action?.status === 'accepted' ? 'is-on' : ''}`} onClick={() => onStatus(f.id, 'accepted')}>Accept</button>
        <button type="button" className={`btn btn--sm ${action?.status === 'flagged' ? 'is-on is-flag' : ''}`} onClick={() => onStatus(f.id, 'flagged')}>Flag</button>
        <button type="button" className="btn btn--sm" onClick={() => setCommenting((c) => !c)}>Add Comment</button>
        <CopyButton text={f.suggestedLanguage} />
      </div>
      {commenting && <textarea className="comment" rows={3} placeholder="Add a note for your team…" value={action?.comment ?? ''} onChange={(e) => onComment(f.id, e.target.value)} />}
    </article>
  );
}

export default function ClauseReview({ review, selectedId, onSelect }) {
  const { findings, contract } = review;
  const [filter, setFilter] = useState('all');
  const [category, setCategory] = useState('all');
  const { actions, toggleStatus, setComment } = useReviewActions();

  const counts = countByFilter(findings, FILTERS.map((f) => f.id));
  const visible = filterFindings(findings, filter, category);
  const selected = findings.find((f) => f.id === selectedId) ?? visible[0] ?? null;

  const changeFilter = (id) => { log.info('filter', { id }); setFilter(id); };

  return (
    <section id="clause-review" className="card" aria-label="Clause-by-clause review">
      <h2 className="section-title">Clause-by-Clause Review</h2>
      <div className="filters" role="group" aria-label="Filter findings">
        {FILTERS.map((f) => (
          <button key={f.id} type="button" className={`chip ${filter === f.id ? 'is-active' : ''}`} aria-pressed={filter === f.id} onClick={() => changeFilter(f.id)}>
            {f.label} <span className="chip__count">{counts[f.id]}</span>
          </button>
        ))}
        <select className="select" aria-label="Filter by category" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All categories</option>
          {categoriesOf(findings).map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="review__body">
        <ul className="clause-list">
          {visible.length === 0 && <li className="empty">No findings match these filters.</li>}
          {visible.map((f) => (
            <li key={f.id}>
              <button type="button" className={`clause-item clause-item--${toneOf(f)} ${selected?.id === f.id ? 'is-active' : ''}`} onClick={() => onSelect(f.id)}>
                <span className="clause-item__title">{f.title}</span>
                <span className="clause-item__meta">{f.kind === 'missing' ? 'Missing' : f.page ? `Page ${f.page}` : `Section ${f.section}`} · {f.stance === 'unfavourable' ? f.severity : f.stance}</span>
              </button>
            </li>
          ))}
        </ul>
        {selected ? <Detail key={selected.id} f={selected} position={contract.positionLabel} action={actions[selected.id]} onStatus={toggleStatus} onComment={setComment} /> : <p className="empty">Select a finding to review.</p>}
      </div>
    </section>
  );
}

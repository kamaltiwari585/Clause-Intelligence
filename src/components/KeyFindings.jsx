import { useState } from 'react';
import RiskBadge from './RiskBadge';
import CopyButton from './CopyButton';

const WEIGHT = { critical: 4, high: 3, medium: 2, low: 1 };
const LIMIT = 8;
const yn = (v) => (v === true ? 'Yes' : v === false ? 'No' : 'Unclear');

function FindingCard({ f, onView }) {
  const [mode, setMode] = useState(null);
  const toggle = (m) => setMode((cur) => (cur === m ? null : m));
  const where = f.kind === 'missing' ? 'Not present' : f.page ? `Page ${f.page}` : `Section ${f.section}`;
  return (
    <article className={`finding finding--${f.severity}`}>
      <header className="finding__head">
        <RiskBadge finding={f} />
        <h3>{f.title}</h3>
        <span className="finding__meta">{where} · {f.category} · {f.riskType}</span>
      </header>
      <p className="finding__summary">{f.shortSummary}</p>
      <h4>Why this matters</h4><p>{f.whyUnfavourable}</p>
      <h4>Recommended action</h4><p>{f.recommendation}</p>
      <div className="actions">
        <button type="button" className="btn btn--sm" onClick={() => onView(f.id)}>View Clause</button>
        <button type="button" className="btn btn--sm" aria-expanded={mode === 'explain'} onClick={() => toggle('explain')}>Explain</button>
        <button type="button" className="btn btn--sm" aria-expanded={mode === 'alt'} onClick={() => toggle('alt')}>Suggest Alternative</button>
      </div>
      {mode === 'explain' && (
        <div className="panel">
          <dl className="grid-dl">
            <dt>Who benefits</dt><dd>{f.whoBenefits || f.favours}</dd>
            <dt>Who bears the risk</dt><dd>{f.whoBearsRisk || '—'}</dd>
            <dt>Market standard</dt><dd>{yn(f.marketStandard)}</dd>
            <dt>One-sided</dt><dd>{yn(f.oneSided)}</dd>
          </dl>
          <p>{f.explanation}</p>
        </div>
      )}
      {mode === 'alt' && (
        <div className="panel panel--green">
          <p>{f.suggestedLanguage || 'No suggested wording is available for this finding.'}</p>
          <CopyButton text={f.suggestedLanguage} />
        </div>
      )}
    </article>
  );
}

export default function KeyFindings({ findings, onView }) {
  const risks = findings.filter((f) => f.stance === 'unfavourable').sort((a, b) => WEIGHT[b.severity] - WEIGHT[a.severity]);
  return (
    <section aria-label="Key findings" className="stack">
      <h2 className="section-title">Key Findings</h2>
      {risks.length === 0 && <p className="empty">No unfavourable provisions were found for the selected position.</p>}
      {risks.slice(0, LIMIT).map((f) => <FindingCard key={f.id} f={f} onView={onView} />)}
      {risks.length > LIMIT && <p className="fineprint">Showing the {LIMIT} most severe of {risks.length}. See the clause-by-clause review for all.</p>}
    </section>
  );
}

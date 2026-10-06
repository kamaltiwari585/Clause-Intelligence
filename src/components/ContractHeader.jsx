import { formatDate } from '../utils/format';

export default function ContractHeader({ review }) {
  const { contract, score, summary } = review;
  return (
    <section className="card contract-head">
      <div>
        <h2 className="contract-head__name">{contract.name}</h2>
        <dl className="meta">
          <div><dt>Contract type</dt><dd>{contract.type}</dd></div>
          <div><dt>Parties</dt><dd>{contract.parties?.length ? contract.parties.join(' and ') : 'Not identified'}</dd></div>
          <div><dt>Selected position</dt><dd>{contract.positionLabel}</dd></div>
          <div><dt>Reviewed</dt><dd>{formatDate(contract.reviewedOn)}</dd></div>
        </dl>
        <p className="perspective">Contract reviewed from the perspective of: <strong>{contract.positionLabel.toUpperCase()}</strong></p>
        <p className="summary-text">{summary.text}</p>
      </div>
      <div className={`score score--${score.label.toLowerCase()}`} aria-label={`Overall contract risk ${score.value} out of 100, ${score.label}`}>
        <div className="score__caption">Overall Contract Risk</div>
        <div className="score__value">{score.value}<span> / 100</span></div>
        <div className="score__tag">{score.label} RISK</div>
      </div>
    </section>
  );
}

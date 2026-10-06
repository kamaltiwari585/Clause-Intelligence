import { SEVERITY_LABELS } from '../config/constants';

/** One badge for every state: severity when unfavourable, otherwise favourable / neutral. */
export default function RiskBadge({ finding }) {
  if (finding.stance === 'favourable') return <span className="badge badge--favourable">Favourable</span>;
  if (finding.stance === 'neutral') return <span className="badge badge--neutral">Neutral</span>;
  return <span className={`badge badge--${finding.severity}`}>{SEVERITY_LABELS[finding.severity]}</span>;
}

export const toneOf = (f) => (f.stance === 'unfavourable' ? f.severity : f.stance);

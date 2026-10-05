import { RISK_LABELS } from '../config/constants';

export default function RiskBadge({ level }) {
  return <span className={`badge badge--${level}`}>{RISK_LABELS[level] ?? level}</span>;
}

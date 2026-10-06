import { ROLES, WEIGHT } from '../taxonomy.js';

export const scoreLabel = (v) => (v < 30 ? 'LOW' : v < 55 ? 'MODERATE' : 'HIGH');

/** Turns merged findings into the full review object the dashboard renders. Pure and unit-testable. */
export function buildReview({ fileName, role, findings, missing, warnings, meta, overview, contractType, parties }) {
  const r = ROLES[role];
  const all = [
    ...findings.map((f) => ({ ...f, kind: 'clause' })),
    ...missing.map((m) => ({
      ...m, kind: 'missing', section: 'Not present', page: null, stance: 'unfavourable', favours: r.other, oneSided: false, marketStandard: null,
      whoBenefits: r.other, whoBearsRisk: r.short, text: '', shortSummary: `No ${m.title} clause was found.`, whyUnfavourable: m.explanation,
    })),
  ].map((f, i) => ({ id: `f-${i + 1}`, ...f }));

  const bad = all.filter((f) => f.stance === 'unfavourable');
  const count = (s) => bad.filter((f) => f.severity === s).length;
  const raw = bad.reduce((n, f) => n + WEIGHT[f.severity] * (f.kind === 'missing' ? 0.6 : 1), 0);
  const value = Math.min(100, Math.round(raw));
  const riskyClauses = bad.filter((f) => f.kind === 'clause').length;
  const missingCount = all.filter((f) => f.kind === 'missing').length;

  const priorities = [...bad]
    .sort((a, b) => WEIGHT[b.severity] - WEIGHT[a.severity] || (a.kind === 'missing') - (b.kind === 'missing'))
    .slice(0, 5)
    .map((f, i) => ({ priority: i + 1, findingId: f.id, clause: f.title, currentPosition: f.shortSummary, risk: f.severity, recommendedPosition: f.recommendation }));

  return {
    contract: { name: fileName, type: contractType || 'Commercial Agreement', parties, position: role, positionLabel: r.label, reviewedOn: new Date().toISOString().slice(0, 10) },
    score: { value, label: scoreLabel(value) },
    summary: {
      text: `${overview ? `${overview} ` : ''}${riskyClauses} unfavourable provision(s) and ${missingCount} missing protection(s) were identified for the ${r.short}.`,
      counts: { critical: count('critical'), high: count('high'), medium: count('medium'), low: count('low') },
      riskyClauses, unfavourable: bad.length, favourable: all.filter((f) => f.stance === 'favourable').length,
      neutral: all.filter((f) => f.stance === 'neutral').length, missing: missingCount,
    },
    findings: all, priorities, warnings, meta,
  };
}

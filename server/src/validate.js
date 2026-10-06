import { CATEGORIES, RISK_TYPES, STANCES, SEVERITIES, PARTY_NAMES } from './taxonomy.js';
import { norm } from './utils/text.js';

const str = (v) => typeof v === 'string' && v.trim().length > 0;
const pick = (v, list, fallback) => (list.includes(v) ? v : fallback);

export function parseModelJson(raw) {
  const cleaned = String(raw).replace(/^\s*```(?:json)?/i, '').replace(/```\s*$/, '').trim();
  return JSON.parse(cleaned);
}

/**
 * Validate one model response against its source excerpt.
 * Findings with a bad shape, or a quote not found in the source (possible fabrication), are dropped and reported.
 * Severity is forced to "none" unless the finding is unfavourable, so favourable clauses can never count as risks.
 */
export function normalizeAnalysis(raw, sourceText) {
  const warnings = [];
  const haystack = norm(sourceText);
  const findings = [];

  (Array.isArray(raw?.findings) ? raw.findings : []).forEach((f, i) => {
    const valid = f && ['title', 'text', 'explanation', 'recommendation'].every((k) => str(f[k])) && STANCES.includes(f.stance);
    if (!valid) return warnings.push(`Finding #${i + 1} dropped: invalid structure`);
    if (!haystack.includes(norm(f.text))) return warnings.push(`"${f.title}" dropped: quoted text not found in contract`);
    const bad = f.stance === 'unfavourable';
    findings.push({
      title: f.title.trim(), section: str(f.section) ? f.section.trim() : 'Unnumbered',
      category: pick(f.category, CATEGORIES, 'Miscellaneous'), riskType: pick(f.riskType, RISK_TYPES, 'Commercial'),
      stance: f.stance, severity: bad ? pick(f.severity, SEVERITIES, 'medium') : 'none',
      favours: pick(f.favours, PARTY_NAMES, 'Neutral'), oneSided: f.oneSided === true,
      marketStandard: typeof f.marketStandard === 'boolean' ? f.marketStandard : null,
      whoBenefits: str(f.whoBenefits) ? f.whoBenefits.trim() : '', whoBearsRisk: str(f.whoBearsRisk) ? f.whoBearsRisk.trim() : '',
      text: f.text.trim(), shortSummary: str(f.shortSummary) ? f.shortSummary.trim() : f.explanation.trim().split('. ')[0],
      explanation: f.explanation.trim(), whyUnfavourable: bad ? (str(f.whyUnfavourable) ? f.whyUnfavourable.trim() : f.explanation.trim()) : '',
      recommendation: f.recommendation.trim(), suggestedLanguage: bad && str(f.suggestedLanguage) ? f.suggestedLanguage.trim() : '',
    });
  });

  const missing = (Array.isArray(raw?.missingProtections) ? raw.missingProtections : [])
    .filter((m) => m && ['title', 'explanation', 'recommendation'].every((k) => str(m[k])))
    .map((m) => ({
      title: m.title.trim(), category: pick(m.category, CATEGORIES, 'Miscellaneous'), riskType: pick(m.riskType, RISK_TYPES, 'Legal'),
      severity: pick(m.severity, SEVERITIES, 'medium'), explanation: m.explanation.trim(), recommendation: m.recommendation.trim(),
      suggestedLanguage: str(m.suggestedLanguage) ? m.suggestedLanguage.trim() : '',
    }));

  return {
    findings, missing, warnings,
    overview: str(raw?.overview) ? raw.overview.trim() : '', contractType: str(raw?.contractType) ? raw.contractType.trim() : '',
    parties: Array.isArray(raw?.parties) ? raw.parties.filter(str).slice(0, 4).map((p) => p.trim()) : [],
  };
}

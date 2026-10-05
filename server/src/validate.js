const RISKS = ['high', 'moderate', 'low'];
const norm = (s) => String(s).replace(/\s+/g, ' ').trim().toLowerCase();
const str = (v) => typeof v === 'string' && v.trim().length > 0;

/** Parse model output, tolerating accidental ```json fences. */
export function parseModelJson(raw) {
  const cleaned = String(raw).replace(/^\s*```(?:json)?/i, '').replace(/```\s*$/, '').trim();
  return JSON.parse(cleaned);
}

/**
 * Validate one model response against its source excerpt.
 * Clauses with a bad shape or with quoted text not found in the source are dropped
 * (the model may have fabricated them) and reported in `warnings`.
 */
export function normalizeAnalysis(raw, sourceText) {
  const warnings = [];
  const haystack = norm(sourceText);
  const clauses = [];

  (Array.isArray(raw?.clauses) ? raw.clauses : []).forEach((c, i) => {
    const valid = c && ['title', 'text', 'issue', 'negotiation', 'revision'].every((k) => str(c[k])) && RISKS.includes(c.risk);
    if (!valid) return warnings.push(`Clause #${i + 1} dropped: invalid structure`);
    if (!haystack.includes(norm(c.text))) return warnings.push(`"${c.title}" dropped: quoted text not found in contract`);
    clauses.push({
      title: c.title.trim(), section: str(c.section) ? c.section.trim() : 'Unnumbered', risk: c.risk,
      oneSided: c.oneSided === true, incomplete: c.incomplete === true,
      text: c.text.trim(), issue: c.issue.trim(), negotiation: c.negotiation.trim(), revision: c.revision.trim(),
    });
  });

  const missing = (Array.isArray(raw?.missingClauses) ? raw.missingClauses : [])
    .filter((m) => m && str(m.title) && str(m.issue) && str(m.revision))
    .map((m) => ({ title: m.title.trim(), issue: m.issue.trim(), revision: m.revision.trim() }));

  return { clauses, missing, warnings };
}

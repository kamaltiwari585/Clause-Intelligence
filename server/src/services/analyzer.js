import { config } from '../config.js';
import { createLogger } from '../logger.js';
import { SYSTEM_PROMPT, buildPrompt } from '../prompts.js';
import { parseModelJson, normalizeAnalysis } from '../validate.js';
import { analyzeWithRules } from './ruleEngine.js';

const log = createLogger('analyzer');

/** Split on paragraph boundaries so clauses are not cut in half. */
export function chunkText(text, size) {
  const chunks = []; let current = '';
  for (const para of text.split(/\n\s*\n/)) {
    if (current && current.length + para.length > size) { chunks.push(current); current = ''; }
    current += (current ? '\n\n' : '') + para;
  }
  if (current) chunks.push(current);
  return chunks;
}

const friendlyReason = (err) => {
  if ([429, 500, 502, 503, 504].includes(err.status)) return 'The AI service was busy or unavailable';
  if (err.status === 404) return 'The configured AI model is not available';
  if (err.status === 401 || err.status === 403) return 'The AI key was rejected';
  return 'The AI service returned an unusable response';
};

/** AI first; on any failure, fall back to the rule engine so the user always gets a result. */
async function analyzeChunk(provider, chunk, perspective, index, total) {
  const started = Date.now();
  const label = `chunk ${index + 1}/${total}`;
  if (provider.name === 'rules') return { ...analyzeWithRules(chunk), source: 'rules', reason: 'Rule-based mode is selected' };
  try {
    let raw;
    for (let attempt = 1; attempt <= 2; attempt++) {
      const text = await provider.generateJson({ system: SYSTEM_PROMPT, prompt: buildPrompt({ chunk, perspective, index, total }) });
      try { raw = parseModelJson(text); break; } catch {
        log.warn(`${label} invalid JSON (attempt ${attempt})`);
        if (attempt === 2) throw new Error('Model returned invalid JSON');
      }
    }
    const result = normalizeAnalysis(raw, chunk);
    log.info(`${label} done via AI`, { ms: Date.now() - started, clauses: result.clauses.length, warnings: result.warnings.length });
    return { ...result, source: 'ai' };
  } catch (err) {
    log.error(`${label} AI failed, using rule engine: ${err.message}`);
    const result = analyzeWithRules(chunk);
    log.info(`${label} done via rules`, { ms: Date.now() - started, clauses: result.clauses.length });
    return { ...result, source: 'rules', reason: friendlyReason(err) };
  }
}

export async function analyzeContract({ text, perspective, provider, fileName }) {
  const chunks = chunkText(text, config.chunkChars);
  log.info('analysis started', { provider: provider.name, model: provider.model(), chunks: chunks.length, chars: text.length });

  const results = [];
  for (let i = 0; i < chunks.length; i++) results.push(await analyzeChunk(provider, chunks[i], perspective, i, chunks.length));

  // A clause is only "missing" if EVERY chunk reports it missing.
  const missingSets = results.map((r) => new Map(r.missing.map((m) => [m.title.toLowerCase(), m])));
  const missing = [...missingSets[0].entries()].filter(([k]) => missingSets.every((s) => s.has(k))).map(([, m]) => m);

  const seen = new Set();
  const clauses = results.flatMap((r) => r.clauses.map((c) => ({ ...c, source: r.source }))).filter((c) => {
    const key = `${c.title}|${c.section}`.toLowerCase();
    return seen.has(key) ? false : (seen.add(key), true);
  });

  const all = [
    ...clauses.map((c, i) => ({ id: `a-${i + 1}`, ...c })),
    ...missing.map((m, i) => ({
      id: `m-${i + 1}`, title: m.title, section: 'Not present', risk: 'missing', oneSided: false, incomplete: true,
      text: '', issue: m.issue, negotiation: `Require a ${m.title} clause before signature.`, revision: m.revision,
      source: results.every((r) => r.source === 'rules') ? 'rules' : 'ai',
    })),
  ];
  const high = all.filter((c) => c.risk === 'high').length;
  const moderate = all.filter((c) => c.risk === 'moderate').length;
  const fallback = results.filter((r) => r.source === 'rules');

  return {
    contract: {
      id: `u-${Date.now()}`, name: fileName, type: 'Uploaded contract', reviewedOn: new Date().toISOString().slice(0, 10),
      high, moderate, status: high ? 'Needs Negotiation' : moderate || missing.length ? 'In Review' : 'Cleared',
    },
    clauses: all,
    warnings: results.flatMap((r) => r.warnings),
    meta: {
      provider: provider.name, model: provider.model(), perspective,
      engine: fallback.length === 0 ? 'ai' : fallback.length === results.length ? 'rules' : 'hybrid',
      fallbackChunks: fallback.length, totalChunks: results.length, fallbackReason: fallback[0]?.reason ?? null,
    },
  };
}

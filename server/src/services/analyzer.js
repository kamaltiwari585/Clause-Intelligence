import { config } from '../config.js';
import { createLogger } from '../logger.js';
import { SYSTEM_PROMPT, buildPrompt } from '../prompts.js';
import { parseModelJson, normalizeAnalysis } from '../validate.js';
import { analyzeWithRules } from './ruleEngine.js';
import { buildReview } from './review.js';
import { findPage } from '../utils/text.js';

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

/** AI first; on any failure, fall back to the role-aware rule engine so the user always gets a result. */
async function analyzeChunk(provider, chunk, role, index, total) {
  const started = Date.now();
  const label = `chunk ${index + 1}/${total}`;
  if (provider.name === 'rules') return { ...analyzeWithRules(chunk, role), source: 'rules', reason: 'Rule-based mode is selected' };
  try {
    let raw;
    for (let attempt = 1; attempt <= 2; attempt++) {
      const out = await provider.generateJson({ system: SYSTEM_PROMPT, prompt: buildPrompt({ chunk, role, index, total }) });
      try { raw = parseModelJson(out); break; } catch {
        log.warn(`${label} invalid JSON (attempt ${attempt})`);
        if (attempt === 2) throw new Error('Model returned invalid JSON');
      }
    }
    const result = normalizeAnalysis(raw, chunk);
    log.info(`${label} done via AI`, { ms: Date.now() - started, findings: result.findings.length, warnings: result.warnings.length });
    return { ...result, source: 'ai' };
  } catch (err) {
    log.error(`${label} AI failed, using rule engine: ${err.message}`);
    const result = analyzeWithRules(chunk, role);
    log.info(`${label} done via rules`, { ms: Date.now() - started, findings: result.findings.length });
    return { ...result, source: 'rules', reason: friendlyReason(err) };
  }
}

export async function analyzeContract({ text, pages = null, role, provider, fileName }) {
  const chunks = chunkText(text, config.chunkChars);
  log.info('analysis started', { provider: provider.name, model: provider.model(), role, chunks: chunks.length, chars: text.length, pages: pages?.length ?? null });

  const results = [];
  for (let i = 0; i < chunks.length; i++) results.push(await analyzeChunk(provider, chunks[i], role, i, chunks.length));

  // A protection is only "missing" if EVERY chunk reports it missing.
  const sets = results.map((r) => new Map(r.missing.map((m) => [m.title.toLowerCase(), m])));
  const missing = [...sets[0].entries()].filter(([k]) => sets.every((s) => s.has(k))).map(([, m]) => m);

  const seen = new Set();
  const findings = results.flatMap((r) => r.findings.map((f) => ({ ...f, source: r.source }))).filter((f) => {
    const key = `${f.title}|${f.section}`.toLowerCase();
    return seen.has(key) ? false : (seen.add(key), true);
  }).map((f) => ({ ...f, page: findPage(pages, f.text) }));

  const fallback = results.filter((r) => r.source === 'rules');
  const first = (k) => results.map((r) => r[k]).find((v) => (Array.isArray(v) ? v.length : v)) ?? (k === 'parties' ? [] : '');

  return buildReview({
    fileName, role, findings, missing, warnings: results.flatMap((r) => r.warnings),
    overview: first('overview'), contractType: first('contractType'), parties: first('parties'),
    meta: {
      provider: provider.name, model: provider.model(),
      engine: fallback.length === 0 ? 'ai' : fallback.length === results.length ? 'rules' : 'hybrid',
      fallbackChunks: fallback.length, totalChunks: results.length, fallbackReason: fallback[0]?.reason ?? null,
    },
  });
}

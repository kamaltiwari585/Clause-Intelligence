import { config } from '../config.js';
import { createLogger } from '../logger.js';
import { SYSTEM_PROMPT, buildPrompt } from '../prompts.js';
import { parseModelJson, normalizeAnalysis } from '../validate.js';

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

async function analyzeChunk(provider, chunk, perspective, index, total) {
  const started = Date.now();
  let raw;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      raw = parseModelJson(await provider.generateJson({ system: SYSTEM_PROMPT, prompt: buildPrompt({ chunk, perspective, index, total }) }));
      break;
    } catch (err) {
      log.warn(`chunk ${index + 1}/${total} attempt ${attempt} failed: ${err.message}`);
      if (attempt === 2) throw new Error('The AI service returned an unusable response. Try again.');
    }
  }
  const result = normalizeAnalysis(raw, chunk);
  log.info(`chunk ${index + 1}/${total} done`, { ms: Date.now() - started, clauses: result.clauses.length, warnings: result.warnings.length });
  return result;
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
  const clauses = results.flatMap((r) => r.clauses).filter((c) => {
    const key = `${c.title}|${c.section}`.toLowerCase();
    return seen.has(key) ? false : (seen.add(key), true);
  });

  const all = [
    ...clauses.map((c, i) => ({ id: `a-${i + 1}`, ...c })),
    ...missing.map((m, i) => ({
      id: `m-${i + 1}`, title: m.title, section: 'Not present', risk: 'missing', oneSided: false, incomplete: true,
      text: '', issue: m.issue, negotiation: `Require a ${m.title} clause before signature.`, revision: m.revision,
    })),
  ];
  const high = all.filter((c) => c.risk === 'high').length;
  const moderate = all.filter((c) => c.risk === 'moderate').length;

  return {
    contract: {
      id: `u-${Date.now()}`, name: fileName, type: 'Uploaded contract', reviewedOn: new Date().toISOString().slice(0, 10),
      high, moderate, status: high ? 'Needs Negotiation' : moderate || missing.length ? 'In Review' : 'Cleared',
    },
    clauses: all,
    warnings: results.flatMap((r) => r.warnings),
    meta: { provider: provider.name, model: provider.model(), perspective },
  };
}

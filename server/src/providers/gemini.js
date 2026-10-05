import { config } from '../config.js';
import { createLogger } from '../logger.js';
import { withRetry, isRetryable } from '../utils/retry.js';

const log = createLogger('gemini');

async function call(model, { system, prompt }) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': config.geminiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw Object.assign(new Error(`Gemini ${model} failed (${res.status}): ${detail.slice(0, 200)}`), { status: res.status });
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? '';
}

/** Tries the primary model with retries, then each fallback model. */
export const gemini = {
  name: 'gemini',
  model: () => config.geminiModel,
  async generateJson(input) {
    if (!config.geminiKey) throw Object.assign(new Error('GEMINI_API_KEY is not set'), { status: 401 });
    let lastErr;
    for (const model of [config.geminiModel, ...config.geminiFallbackModels]) {
      try {
        return await withRetry(() => call(model, input), {
          attempts: 3, baseMs: config.retryBaseMs,
          onRetry: (err, n, ms) => log.warn(`${model} attempt ${n} failed (${err.status ?? 'network'}); retrying in ${Math.round(ms)}ms`),
        });
      } catch (err) {
        lastErr = err;
        log.warn(`model ${model} unavailable: ${err.message}`);
        if (!isRetryable(err) && err.status !== 404) throw err; // bad key/request: other models won't help
      }
    }
    throw lastErr;
  },
};

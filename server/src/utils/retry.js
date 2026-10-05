/** Temporary failures worth retrying. Errors without a status are network faults. */
export const isRetryable = (err) => !err.status || [408, 429, 500, 502, 503, 504].includes(err.status);

/** Exponential backoff with jitter. Non-retryable errors (400/401/403/404) fail immediately. */
export async function withRetry(fn, { attempts = 3, baseMs = 1000, onRetry } = {}) {
  let lastErr;
  for (let i = 1; i <= attempts; i++) {
    try { return await fn(i); } catch (err) {
      lastErr = err;
      if (!isRetryable(err) || i === attempts) break;
      const delay = baseMs * 2 ** (i - 1) + Math.random() * 250;
      onRetry?.(err, i, delay);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

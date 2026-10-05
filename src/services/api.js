import { createLogger } from '../utils/logger';

const log = createLogger('api');

/** Uploads a contract for analysis. Throws Error with a user-readable message. */
export async function analyzeContract(file, perspective) {
  const body = new FormData();
  body.append('file', file);
  body.append('perspective', perspective);
  log.info('analyze request', { name: file.name, size: file.size, perspective });

  let res;
  try {
    res = await fetch('/api/analyze', { method: 'POST', body });
  } catch {
    throw new Error('Cannot reach the analysis server. Check that it is running.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    log.warn('analyze failed', { status: res.status, error: data.error });
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  log.info('analyze success', { clauses: data.clauses?.length, warnings: data.warnings?.length });
  return data;
}

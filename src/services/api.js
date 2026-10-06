import { createLogger } from '../utils/logger';

const log = createLogger('api');

/** Uploads a contract for role-based analysis. Throws Error with a user-readable message. */
export async function analyzeContract(file, role) {
  const body = new FormData();
  body.append('file', file);
  body.append('role', role);
  log.info('analyze request', { name: file.name, size: file.size, role });

  let res;
  try { res = await fetch('/api/analyze', { method: 'POST', body }); } catch {
    throw new Error('Cannot reach the analysis server. Check that it is running.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    log.warn('analyze failed', { status: res.status, error: data.error });
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  log.info('analyze success', { findings: data.findings?.length, engine: data.meta?.engine });
  return data;
}

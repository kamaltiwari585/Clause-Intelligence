import { useCallback, useState } from 'react';
import { createLogger } from '../utils/logger';

const log = createLogger('reviewActions');

/** Per-finding Accept / Flag / comment state. In-memory for now; persisted later with the backend. */
export function useReviewActions() {
  const [actions, setActions] = useState({});

  const toggleStatus = useCallback((id, status) => {
    log.info('status', { id, status });
    setActions((a) => ({ ...a, [id]: { ...a[id], status: a[id]?.status === status ? null : status } }));
  }, []);
  const setComment = useCallback((id, comment) => setActions((a) => ({ ...a, [id]: { ...a[id], comment } })), []);

  return { actions, toggleStatus, setComment };
}

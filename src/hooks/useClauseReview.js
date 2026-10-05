import { useCallback, useMemo, useState } from 'react';
import { createLogger } from '../utils/logger';
import { filterClauses, countByFilter } from '../utils/clauseFilters';
import { FILTERS } from '../config/constants';

const log = createLogger('useClauseReview');

/** Owns filter + selection state for the clause review panel. */
export function useClauseReview(clauses) {
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(clauses[0]?.id ?? null);

  const visible = useMemo(() => filterClauses(clauses, filter), [clauses, filter]);
  const counts = useMemo(() => countByFilter(clauses, FILTERS.map((f) => f.id)), [clauses]);
  const selected = visible.find((c) => c.id === selectedId) ?? visible[0] ?? null;

  const changeFilter = useCallback((id) => {
    log.info('Filter changed', { to: id });
    setFilter(id);
  }, []);

  const selectClause = useCallback((id) => {
    log.debug('Clause selected', { id });
    setSelectedId(id);
  }, []);

  return { filter, changeFilter, visible, counts, selected, selectClause };
}

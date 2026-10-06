import { useCallback, useState } from 'react';
import { analyzeContract } from '../services/api';

/** status: 'idle' | 'loading' | 'success' | 'error' */
export function useAnalysis() {
  const [state, setState] = useState({ status: 'idle', result: null, error: '' });

  const run = useCallback(async (file, role) => {
    setState((s) => ({ ...s, status: 'loading', error: '' }));
    try {
      const result = await analyzeContract(file, role);
      setState({ status: 'success', result, error: '' });
      return true;
    } catch (err) {
      setState((s) => ({ ...s, status: 'error', error: err.message }));
      return false;
    }
  }, []);

  const reset = useCallback(() => setState({ status: 'idle', result: null, error: '' }), []);
  return { ...state, run, reset };
}

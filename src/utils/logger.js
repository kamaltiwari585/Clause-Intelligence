/**
 * Scoped logger. Level comes from VITE_LOG_LEVEL (default: debug in dev, warn in prod).
 * Runtime override in the browser console: localStorage.setItem('cci:logLevel', 'debug')
 */
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40, silent: 99 };

function activeLevel() {
  let stored = null;
  try { stored = localStorage.getItem('cci:logLevel'); } catch { /* storage unavailable */ }
  const name = stored || import.meta.env?.VITE_LOG_LEVEL || (import.meta.env?.DEV ? 'debug' : 'warn');
  return LEVELS[name] ?? LEVELS.warn;
}

export function createLogger(scope) {
  const emit = (level, args) => {
    if (LEVELS[level] < activeLevel()) return;
    const stamp = new Date().toISOString().slice(11, 23);
    console[level === 'debug' ? 'log' : level](`[${stamp}] [${level.toUpperCase()}] [${scope}]`, ...args);
  };
  return {
    debug: (...a) => emit('debug', a),
    info: (...a) => emit('info', a),
    warn: (...a) => emit('warn', a),
    error: (...a) => emit('error', a),
  };
}

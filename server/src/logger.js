import { config } from './config.js';

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };

/** Scoped logger. Never log contract text: contracts are confidential. */
export function createLogger(scope) {
  const emit = (level, args) => {
    if (LEVELS[level] < (LEVELS[config.logLevel] ?? 10)) return;
    console[level === 'debug' ? 'log' : level](`${new Date().toISOString()} [${level.toUpperCase()}] [${scope}]`, ...args);
  };
  return Object.fromEntries(Object.keys(LEVELS).map((l) => [l, (...a) => emit(l, a)]));
}

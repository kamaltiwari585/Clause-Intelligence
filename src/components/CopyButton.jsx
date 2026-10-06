import { useState } from 'react';
import { createLogger } from '../utils/logger';

const log = createLogger('copy');

export default function CopyButton({ text, label = 'Copy Suggested Language' }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); } catch (err) { log.warn('clipboard failed', err.message); }
  };
  return <button type="button" className="btn btn--sm" disabled={!text} onClick={copy}>{done ? 'Copied' : label}</button>;
}

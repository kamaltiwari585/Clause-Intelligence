import { config } from '../config.js';
import { gemini } from './gemini.js';
import { anthropic } from './anthropic.js';

const PROVIDERS = { gemini, anthropic };

/** Provider contract: { name, model(), generateJson({system, prompt}) -> string }. Add a provider = add a file + one line here. */
export function getProvider(name = config.provider) {
  const p = PROVIDERS[name];
  if (!p) throw new Error(`Unknown LLM_PROVIDER "${name}". Use: ${Object.keys(PROVIDERS).join(', ')}`);
  return p;
}

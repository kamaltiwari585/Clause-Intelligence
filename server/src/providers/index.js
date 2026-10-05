import { config } from '../config.js';
import { gemini } from './gemini.js';
import { anthropic } from './anthropic.js';

// 'rules' = no AI at all: the built-in rule engine only (offline / zero cost).
const rules = { name: 'rules', model: () => 'rule-engine', generateJson: async () => { throw new Error('rules-only mode'); } };
const PROVIDERS = { gemini, anthropic, rules };

/** Provider contract: { name, model(), generateJson({system, prompt}) -> string }. Add a provider = add a file + one line here. */
export function getProvider(name = config.provider) {
  const p = PROVIDERS[name];
  if (!p) throw new Error(`Unknown LLM_PROVIDER "${name}". Use: ${Object.keys(PROVIDERS).join(', ')}`);
  return p;
}

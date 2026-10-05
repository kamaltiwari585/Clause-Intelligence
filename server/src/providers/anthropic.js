import { config } from '../config.js';

export const anthropic = {
  name: 'anthropic',
  model: () => config.anthropicModel,
  async generateJson({ system, prompt }) {
    if (!config.anthropicKey) throw new Error('ANTHROPIC_API_KEY is not set');
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': config.anthropicKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: config.anthropicModel, max_tokens: 8000, temperature: 0.1, system,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!res.ok) throw Object.assign(new Error(`Anthropic request failed (${res.status})`), { status: res.status });
    const data = await res.json();
    return data.content?.filter((b) => b.type === 'text').map((b) => b.text).join('') ?? '';
  },
};

import { config } from '../config.js';

/** Gemini adapter. Key goes in a header, never in the URL, so it stays out of logs. */
export const gemini = {
  name: 'gemini',
  model: () => config.geminiModel,
  async generateJson({ system, prompt }) {
    if (!config.geminiKey) throw new Error('GEMINI_API_KEY is not set');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': config.geminiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
      }),
    });
    if (!res.ok) throw new Error(`Gemini request failed (${res.status})`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? '';
  },
};

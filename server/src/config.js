import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT || 8787),
  provider: process.env.LLM_PROVIDER || 'gemini',
  geminiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  geminiFallbackModels: (process.env.GEMINI_FALLBACK_MODELS || '').split(',').map((m) => m.trim()).filter(Boolean),
  retryBaseMs: Number(process.env.RETRY_BASE_MS || 1000),
  anthropicKey: process.env.ANTHROPIC_API_KEY,
  anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
  chunkChars: Number(process.env.CHUNK_CHARS || 24000),
  maxUploadBytes: Number(process.env.MAX_UPLOAD_MB || 10) * 1024 * 1024,
  logLevel: process.env.LOG_LEVEL || 'debug',
};

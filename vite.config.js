import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// /api is proxied to the backend so the browser never holds an LLM key.
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:8787' } },
  test: { environment: 'node', include: ['src/**/*.test.js'] },
});

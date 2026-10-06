import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { config } from './config.js';
import { createLogger } from './logger.js';
import { getProvider } from './providers/index.js';
import { extractText } from './services/extractText.js';
import { analyzeContract } from './services/analyzer.js';
import { ROLES } from './taxonomy.js';

const log = createLogger('http');
const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: config.maxUploadBytes } });

app.use(cors({ origin: ['http://localhost:5173'] }));
app.get('/api/health', (_req, res) => res.json({ ok: true, provider: config.provider }));

app.post('/api/analyze', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Attach a contract file.' });
    const role = ROLES[req.body.role] ? req.body.role : 'buyer';
    log.info('analyze request', { file: req.file.originalname, bytes: req.file.size, role });
    const { text, pages } = await extractText(req.file);
    res.json(await analyzeContract({ text, pages, role, provider: getProvider(), fileName: req.file.originalname }));
  } catch (err) {
    log.error('analyze failed', err.message);
    res.status(err.status || 500).json({ error: err.status ? err.message : 'Analysis failed. Check the server logs.' });
  }
});

app.use((err, _req, res, _next) => {
  log.error('unhandled', err.message);
  res.status(err.code === 'LIMIT_FILE_SIZE' ? 413 : 500).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'File is too large.' : 'Server error.' });
});

app.listen(config.port, () => log.info(`API listening on :${config.port}`, { provider: config.provider }));

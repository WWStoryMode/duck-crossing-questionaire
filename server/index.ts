import express from 'express';
import { createServer } from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { loginTeacher } from './store.js';

const PORT = Number(process.env.PORT) || 3000;
const DIST = path.resolve(process.cwd(), 'dist');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true);
app.use(express.json({ limit: '20kb' }));

app.post('/api/teacher/login', (req, res) => {
  const token = loginTeacher(req.body?.code);
  if (!token) return res.status(401).json({ ok: false, error: 'Incorrect access code.' });
  res.json({ ok: true, token });
});

app.get('/api/join-url', (req, res) => {
  const url = process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}/`;
  res.json({ url });
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

if (fs.existsSync(DIST)) {
  app.use(express.static(DIST));
  // SPA fallback for /, /teacher, /results
  app.get(/^\/(?!api\/|socket\.io\/).*/, (_req, res) => res.sendFile(path.join(DIST, 'index.html')));
}

export const httpServer = createServer(app);

httpServer.listen(PORT, () => {
  console.log(`[duck-crossing] listening on http://localhost:${PORT}`);
});

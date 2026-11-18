import express from 'express';
import { createServer } from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { loginTeacher } from './store.js';
import { attachSockets } from './sockets.js';

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

/** First non-internal IPv4 address, so phones on the same Wi-Fi can reach a laptop-hosted session. */
function lanAddress(): string | null {
  for (const addrs of Object.values(os.networkInterfaces())) {
    for (const a of addrs ?? []) if (a.family === 'IPv4' && !a.internal) return a.address;
  }
  return null;
}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

app.get('/api/join-url', (req, res) => {
  if (process.env.PUBLIC_URL) return res.json({ url: process.env.PUBLIC_URL });
  const host = req.get('host') || `localhost:${PORT}`;
  const [hostname, port] = host.startsWith('[') ? [host.slice(0, host.indexOf(']') + 1), host.split(']:')[1]] : host.split(':');
  const lan = LOCAL_HOSTS.has(hostname) ? lanAddress() : null;
  const finalHost = lan ? `${lan}${port ? `:${port}` : ''}` : host;
  res.json({ url: `${req.protocol}://${finalHost}/` });
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

if (fs.existsSync(DIST)) {
  app.use(express.static(DIST));
  // SPA fallback for /, /teacher, /results
  app.get(/^\/(?!api\/|socket\.io\/).*/, (_req, res) => res.sendFile(path.join(DIST, 'index.html')));
}

export const httpServer = createServer(app);
attachSockets(httpServer);

httpServer.listen(PORT, () => {
  const lan = lanAddress();
  console.log(`[duck-crossing] listening on http://localhost:${PORT}`);
  if (lan) console.log(`[duck-crossing] on your network:  http://${lan}:${PORT}  (students)  ·  /teacher  ·  /results`);
});

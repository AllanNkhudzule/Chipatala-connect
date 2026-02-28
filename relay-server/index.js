const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static('public'));

const records = new Map();
const accessGrants = new Map();
const reports = [];

function generateCode(prefix) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${code}-${chars[Math.floor(Math.random() * chars.length)]}${chars[Math.floor(Math.random() * chars.length)]}${chars[Math.floor(Math.random() * chars.length)]}`;
}

function cleanExpired(store, ttlMs) {
  const now = Date.now();
  for (const [key, val] of store) {
    if (now - val._createdAt > ttlMs) store.delete(key);
  }
}

setInterval(() => {
  cleanExpired(records, 2 * 60 * 60 * 1000);
  cleanExpired(accessGrants, 45 * 60 * 1000);
}, 60 * 1000);

app.post('/api/records', (req, res) => {
  const code = generateCode('REC');
  records.set(code, { ...req.body, _createdAt: Date.now() });
  res.json({ code });
});

app.get('/api/records/:code', (req, res) => {
  const entry = records.get(req.params.code);
  if (!entry) return res.status(404).json({ error: 'Record not found or expired' });
  const { _createdAt, ...data } = entry;
  res.json(data);
});

app.delete('/api/records/:code', (req, res) => {
  records.delete(req.params.code);
  res.json({ ok: true });
});

app.post('/api/access-grants', (req, res) => {
  const token = generateCode('PAT');
  accessGrants.set(token, { ...req.body, _createdAt: Date.now() });
  res.json({ token });
});

app.get('/api/access-grants/:token', (req, res) => {
  const entry = accessGrants.get(req.params.token);
  if (!entry) return res.status(404).json({ error: 'Access grant not found or expired' });
  const { _createdAt, ...data } = entry;
  res.json(data);
});

app.post('/api/reports', (req, res) => {
  reports.push({
    id: generateCode('REP'),
    ...req.body,
    receivedAt: Date.now()
  });
  console.log(`[Telemetry] Received new ${req.body.type} report (${req.body.severity})`);
  res.json({ ok: true });
});

app.get('/api/reports', (req, res) => {
  res.json(reports);
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Chipatala Relay Server running on port ${PORT}`);
});

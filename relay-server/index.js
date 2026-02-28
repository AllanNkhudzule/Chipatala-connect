require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const prisma = require('./prismaClient');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const authMiddleware = require('./authMiddleware');
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'chipatala-secret-key';

app.use(cors());
app.use(express.json({ limit: '5mb' }));


const records = new Map();
const accessGrants = new Map();
const fs = require('fs');
const path = require('path');
const reportsFile = path.join(__dirname, 'reports.json');

// Initialize reports file if it doesn't exist
if (!fs.existsSync(reportsFile)) {
  fs.writeFileSync(reportsFile, JSON.stringify([]), 'utf8');
}

let reports = [];
try {
  reports = JSON.parse(fs.readFileSync(reportsFile, 'utf8'));
} catch (e) {
  console.error('Failed to read reports.json', e);
}

function generateCode(prefix) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${code}-${chars[Math.floor(Math.random() * chars.length)]}${chars[Math.floor(Math.random() * chars.length)]}${chars[Math.floor(Math.random() * chars.length)]}`;
}

// ---------------------------------------------------------
// AUTHENTICATION
// Mock endpoints to issue JWTs to Doctor and Patient clients
// ---------------------------------------------------------

app.post('/api/auth/login', (req, res) => {
  // Mock login for both doctor and patient
  const jti = crypto.randomUUID();
  const token = jwt.sign({ role: req.body.role || 'user', jti }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token });
});

// Doctor ending a session/logout
app.post('/api/auth/logout', authMiddleware, async (req, res) => {
  const jti = req.user.jti;
  const exp = new Date(req.user.exp * 1000);

  await prisma.revokedToken.upsert({
    where: { jti },
    update: {},
    create: { jti, expiresAt: exp }
  });

  res.json({ success: true });
});

// ---------------------------------------------------------
// PATIENT: Grant Access to Doctor
// ---------------------------------------------------------
app.post('/api/access-grants', authMiddleware, async (req, res) => {
  const tokenStr = generateCode('PAT');
  const expiresIn = req.body.expiresIn || 30; // 30 minutes
  const expiresAt = new Date(Date.now() + expiresIn * 60 * 1000);

  const session = await prisma.session.create({
    data: {
      id: tokenStr,
      jti: crypto.randomUUID(), // unique identifier for the session
      data: JSON.stringify(req.body),
      expiresAt: expiresAt,
      status: 'ACTIVE'
    }
  });

  res.json({ token: tokenStr });
});

// DOCTOR: Read Patient Access Grant Data
app.get('/api/access-grants/:token', authMiddleware, async (req, res) => {
  const session = await prisma.session.findUnique({
    where: { id: req.params.token }
  });

  if (!session) {
    return res.status(404).json({ error: 'Access grant not found' });
  }

  // Double check session state dynamically
  if (session.status !== 'ACTIVE' || session.expiresAt < new Date()) {
    // Attempt cleanup if expired but status is still ACTIVE
    if (session.status === 'ACTIVE') {
      await prisma.session.update({ where: { id: session.id }, data: { status: 'EXPIRED' } });
    }
    return res.status(403).json({ error: 'SESSION_EXPIRED' });
  }

  res.json(JSON.parse(session.data));
});

// ---------------------------------------------------------
// DOCTOR: Create Record for Patient (via RelayBundle)
// ---------------------------------------------------------
app.post('/api/records', authMiddleware, async (req, res) => {
  const code = generateCode('REC');
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

  await prisma.relayBundle.create({
    data: {
      code,
      data: JSON.stringify(req.body),
      expiresAt
    }
  });

  res.json({ code });
});

// PATIENT: Retrieve Record (via RelayBundle fetch)
// BUG-002 requests this specific route path explicitly: "GET /api/sessions/:id/records"
app.get('/api/sessions/:id/records', authMiddleware, async (req, res) => {
  try {
    const bundle = await prisma.relayBundle.findUnique({
      where: { code: req.params.id }
    });

    // Explicitly requested bugfix logic
    if (!bundle || bundle.expiresAt < new Date()) {
      return res.status(410).json({ error: 'RELAY_EXPIRED' });
    }

    res.json(JSON.parse(bundle.data));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/records/:code', authMiddleware, async (req, res) => {
  try {
    await prisma.relayBundle.delete({ where: { code: req.params.code } });
    res.json({ ok: true });
  } catch (e) {
    res.status(404).json({ error: 'Not found' });
  }
});

// ---------------------------------------------------------
// BACKGROUND CRON JOBS
// ---------------------------------------------------------
const cron = require('node-cron');

cron.schedule('* * * * *', async () => {
  const now = new Date();

  // Clean up expired Sessions
  const expiredSessions = await prisma.session.findMany({
    where: {
      status: 'ACTIVE',
      expiresAt: { lt: now }
    }
  });

  for (const session of expiredSessions) {
    await prisma.session.update({
      where: { id: session.id },
      data: { status: 'EXPIRED' }
    });
    console.log(`[AUDIT] Session ${session.id} auto-expired by cron job.`);
  }

  // Clean up expired RelayBundles
  const expiredBundles = await prisma.relayBundle.findMany({
    where: { expiresAt: { lt: now } }
  });

  for (const bundle of expiredBundles) {
    await prisma.relayBundle.delete({ where: { code: bundle.code } });
    console.log(`[AUDIT] RelayBundle ${bundle.code} auto-deleted by cron job.`);
  }
});

app.post('/api/reports', (req, res) => {
  const newReport = {
    id: generateCode('REP'),
    ...req.body,
    receivedAt: Date.now()
  };
  reports.push(newReport);

  // Save to file
  try {
    fs.writeFileSync(reportsFile, JSON.stringify(reports, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write to reports.json', e);
  }

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

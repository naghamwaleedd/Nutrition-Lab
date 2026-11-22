require('dotenv').config();
const express        = require('express');
const path           = require('path');
const { connectDB }  = require('./data/db');
const router         = require('./routes/router');

const app  = express();
const PORT = process.env.PORT || 3000;

const PROJECT_ROOT = path.join(__dirname, '..');
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

// ── Global middleware ─────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json({ limit: '1mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} → ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

// ── Health check ──────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), port: PORT });
});

// ── API routes ────────────────────────────────────────────────────
app.use('/api', router);

// ── Static frontend ───────────────────────────────────────────────
app.use(express.static(FRONTEND_DIR, { index: false }));
app.use(express.static(PROJECT_ROOT, { index: false }));

app.get('/', (req, res) => res.sendFile(path.join(PROJECT_ROOT, 'index.html')));
app.get('/{*path}', (req, res) => res.sendFile(path.join(PROJECT_ROOT, 'index.html')));

// ── Start ─────────────────────────────────────────────────────────
async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log('\n╔══════════════════════════════════════════╗');
    console.log('║         🔬  NUTRITION LAB SERVER         ║');
    console.log('╠══════════════════════════════════════════╣');
    console.log(`║  Running at: http://localhost:${PORT}       ║`);
    console.log('║  Demo login: alex@nutritionlab.com       ║');
    console.log('║  Password:   demo123                     ║');
    console.log('╚══════════════════════════════════════════╝\n');
  });
}

start().catch(err => { console.error(err); process.exit(1); });

module.exports = app;

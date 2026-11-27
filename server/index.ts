import express from 'express';
import cors from 'cors';
import { env } from './lib/env.js';
import { prisma } from './lib/prisma.js';
import { authRouter } from './routes/auth.js';
import { shipmentsRouter } from './routes/shipments.js';
import { proposalsRouter } from './routes/proposals.js';
import { messagesRouter } from './routes/messages.js';
import { reviewsRouter } from './routes/reviews.js';

const app = express();

// ─── Middlewares ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: env.clientUrl,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// ─── Routes API ──────────────────────────────────────────────────────────────
app.use('/api/auth',      authRouter);
app.use('/api/shipments', shipmentsRouter);
app.use('/api/proposals', proposalsRouter);
app.use('/api/messages',  messagesRouter);
app.use('/api/reviews',   reviewsRouter);

// ─── Health Check (vérifie la connexion Lakebase Postgres sur Neon) ──────────
app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      database: 'connected',
      branch: env.neonBranch,
      version: '2.0.0',
      platform: 'Cocolis.ca',
    });
  } catch (err) {
    console.error('[GET /api/health] DB check failed:', err);
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      error: 'Database connection failed',
    });
  }
});

// ─── 404 catch-all ───────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route introuvable.' });
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(env.apiPort, () => {
  console.log(`\n🍁 Cocolis.ca API v2.0 démarrée sur http://localhost:${env.apiPort}`);
  console.log(`🗄️  Lakebase Postgres (Neon branch: ${env.neonBranch})`);
  console.log(`📋 Routes: /api/auth | /api/shipments | /api/proposals | /api/messages | /api/reviews`);
  console.log(`💚 Health: http://localhost:${env.apiPort}/api/health\n`);
});

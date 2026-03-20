import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import connectDB from './config/database.js';
import initSocket from './config/socket.js';
import authRoutes from './routes/auth.js';
import resultsRoutes from './routes/results.js';
import { errorHandler } from './middleware/errorHandler.js';

// ─── App bootstrap ──────────────────────────────────────────────────────────
const app = express();
const httpServer = createServer(app);

const io = initSocket(httpServer);
app.set('io', io);

// ─── Security & utility middleware ──────────────────────────────────────────
app.use(helmet());

const allowedOrigins = process.env.CLIENT_ORIGINS?.split(',') || ['http://localhost:5173'];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
}));

// ─── Routes ─────────────────────────────────────────────────────────────────
app.get('/', (_req, res) =>
  res.json({ status: 'ok', service: 'Elections API', version: '1.0.0' })
);

app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

app.use('/api/auth',    authRoutes);
app.use('/api/results', resultsRoutes);

// ─── 404 — must be after all real routes ────────────────────────────────────
app.use((_req, res) =>
  res.status(404).json({ success: false, message: 'Route not found' })
);

// ─── Central error handler — must be last ───────────────────────────────────
app.use(errorHandler);

// ─── Keep-alive self-ping (prevents Render free tier spin-down) ─────────────
const SELF_URL = process.env.SELF_URL || 'https://electionsbackend-zt4s.onrender.com/api/health';

const keepAlive = () => {
  setInterval(async () => {
    try {
      const res = await fetch(SELF_URL);
      console.log(`[keep-alive] ping ${res.status} — ${new Date().toISOString()}`);
    } catch (err) {
      console.warn('[keep-alive] ping failed:', err.message);
    }
  }, 10 * 60 * 1000); // every 10 minutes
};

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    console.log(`🔌 Socket.io ready`);
  });

  if (process.env.NODE_ENV === 'production') {
    keepAlive();
  }
};

start();
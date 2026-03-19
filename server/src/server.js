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

// Attach Socket.io to the HTTP server; store io on app for controller access
const io = initSocket(httpServer);
app.set('io', io);

// ─── Security & utility middleware ──────────────────────────────────────────
app.use(helmet());

const allowedOrigins = process.env.CLIENT_ORIGINS?.split(',') || ['http://localhost:5173'];
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (Postman, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Global rate limit: 200 req / 15 min per IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
}));

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/results', resultsRoutes);

// Health check — useful for Render/Vercel uptime pings
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// 404 handler for unknown routes
app.use((_req, res) =>
  res.status(404).json({ success: false, message: 'Route not found' })
);

// ─── Central error handler (must be last) ───────────────────────────────────
app.use(errorHandler);

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    console.log(`🔌 Socket.io ready`);
  });
};

start();
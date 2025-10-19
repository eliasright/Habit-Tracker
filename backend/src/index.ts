import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import session from 'express-session';
import FileStore from 'session-file-store';
import { PrismaClient } from '@prisma/client';
import passport from './config/passport';
import authRoutes from './routes/authRoutes';
import categoriesRoutes from './routes/categoriesRoutes';
import todosRoutes from './routes/todosRoutes';
import checklistRoutes from './routes/checklistRoutes';
import onboardingRoutes from './routes/onboardingRoutes';
import { errorHandler } from './middleware/errorHandler';

// Load .env from MONOREPO ROOT
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const port = process.env.PORT || 3011;
const prisma = new PrismaClient();

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5174',
  credentials: true
};

// Session Configuration
const SessionFileStore = FileStore(session);
app.use(session({
  store: new SessionFileStore({
    path: './sessions',
    ttl: 86400, // 24 hours
  }),
  secret: process.env.JWT_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 86400000, // 24 hours
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/todos', todosRoutes);
app.use('/api', checklistRoutes);
app.use('/api/onboarding', onboardingRoutes);

// Serve static frontend ONLY if dist folder exists (production mode)
const frontendPath = path.join(__dirname, '../../frontend/dist');
const fs = require('fs');
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));

  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});

export { prisma };

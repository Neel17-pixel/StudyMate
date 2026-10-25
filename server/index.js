import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

import { connectDB, getDbStatus } from './config/db.js';
import { ensureDemoUser } from './seed/demoData.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check & System Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'StudyMate — AI-Powered Student Productivity Platform',
    timestamp: new Date().toISOString(),
    database: getDbStatus(),
    geminiLiveReady: Boolean(process.env.GEMINI_API_KEY)
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

// Global Error Handler
app.use(errorHandler);

// Initialize Database & Server
const startServer = async () => {
  try {
    await connectDB();
    
    // Pre-seed demo student account so users can test immediately
    try {
      await ensureDemoUser();
    } catch (seedErr) {
      console.warn('Demo user seed notice:', seedErr.message);
    }

    app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 StudyMate Backend API Server is running on port ${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🤖 AI Gemini Status: ${process.env.GEMINI_API_KEY ? 'Active (API Key loaded)' : 'Ready (Awaiting API Key in .env or Settings)'}`);
      console.log(`======================================================\n`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
};

startServer();

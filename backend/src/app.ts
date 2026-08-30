import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';        

// Route Imports
import authRoutes from './routes/authRoutes';
import attendanceRoutes from './routes/attendanceRoutes'; 
import adminRoutes from './routes/adminRoutes'; 
import taskRoutes from './routes/taskRoutes';
import eventRoutes from './routes/eventRoutes';
import requestRoutes from './routes/requestRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import { announcementRouter } from './routes/announcementRoutes';
import { analyticsRouter } from './routes/analyticsRoutes';
import progressRoutes from './routes/progressTrackingRoutes';
import askQuestionRoutes from './routes/AskQuestionRoutes';
import documentSubmissionRoutes from './routes/documentSubmissionRoutes';
import notificationRoutes from './routes/notificationRoutes';
import evaluationRoutes from './routes/evaluationRoutes';

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// ==========================================
// Security & Core Middleware
// ==========================================
// 1. Helmet Security Headers (configured to allow static image uploads)
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 2. Dynamic CORS & Body Parser
const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map(url => url.trim())
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
    origin: (origin, callback) => {
        if (
            !origin || 
            allowedOrigins.includes(origin) || 
            allowedOrigins.includes('*') || 
            origin.endsWith('.vercel.app') || 
            origin.includes('localhost')
        ) {
            callback(null, true);
        } else {
            callback(new Error(`CORS policy violation: ${origin} is not allowed`));
        }
    },
    credentials: true
}));
app.use(express.json());

// 3. Brute-Force Rate Limiter for Auth Routes (30 requests / 15 mins)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many attempts from this IP. Please try again in 15 minutes." }
});

// 4. Global API Rate Limiter for General Endpoints (400 requests / 15 mins)
const globalApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 400, // Limit each IP to 400 requests per 15-minute window
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "System Busy: Too many requests sent from your IP address. Please wait a few minutes." }
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/', globalApiLimiter);

// Serve static files for uploads (OCR Schedules, User Avatars, etc.)
// Using path.resolve ensures it works regardless of where you start the process
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

import { checkDbConnection } from './config/db';

// Health Check Endpoint
app.get('/api/health', async (_req, res) => {
    const isDbConnected = await checkDbConnection();
    res.status(isDbConnected ? 200 : 503).json({
        status: 'UP',
        database: isDbConnected ? 'CONNECTED' : 'DISCONNECTED',
        timestamp: new Date().toISOString()
    });
});

// 1. Authentication
app.use('/api/auth', authRoutes);

// 2. Admin Logic (Includes Students, Users, and the new Audit Logs)
app.use('/api/admin', adminRoutes);

// 3. OJT Core Features
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/progress', progressRoutes);

// 4. Communication & Intelligence
app.use('/api/announcements', announcementRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/questions', askQuestionRoutes);

// 5. Document Management, Evaluations & Notifications
app.use('/api/documents', documentSubmissionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/evaluations', evaluationRoutes);

// ==========================================
// Server Configuration
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 MentorLog Backend running on http://localhost:${PORT}`);
    console.log(`🛡️  Audit Log System: ACTIVE`);
});

export default app;
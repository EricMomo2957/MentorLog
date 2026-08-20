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

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// ==========================================
// Middleware
// ==========================================
app.use(cors());
app.use(express.json());

// Serve static files for uploads (OCR Schedules, User Avatars, etc.)
// Using path.resolve ensures it works regardless of where you start the process
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// ==========================================
// API Routes
// ==========================================

/**
 * Note: Your Audit Logs and Admin Profile routes are nested inside adminRoutes.
 * They are now accessible at:
 * - GET /api/admin/audit-logs
 * - PUT /api/admin/profile/:id
 */

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

// 5. Document Management & Notifications
app.use('/api/documents', documentSubmissionRoutes);
app.use('/api/notifications', notificationRoutes);

// ==========================================
// Server Configuration
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 MentorLog Backend running on http://localhost:${PORT}`);
    console.log(`🛡️  Audit Log System: ACTIVE`);
});

export default app;
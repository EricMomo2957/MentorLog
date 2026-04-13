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

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// ==========================================
// Middleware
// ==========================================
app.use(cors());
app.use(express.json());

// Serve static files for uploads (Images, Logos, OJT Pictures)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ==========================================
// API Routes
// ==========================================

// 1. Authentication (Login, Register, Forgot Password)
app.use('/api/auth', authRoutes);

// 2. Admin Logic (User Management, Password Request Table)
app.use('/api/admin', adminRoutes);

// 3. OJT Core Features
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/progress', progressRoutes);
// 4. Announcements & Analytics
app.use('/api/announcements', announcementRouter);
app.use('/api/analytics', analyticsRouter);

// ==========================================
// Server Configuration
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 MentorLog Backend running on http://localhost:${PORT}`);
});

export default app;
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';        
import authRoutes from './routes/authRoutes';
import attendanceRoutes from './routes/attendanceRoutes'; 
import adminRoutes from './routes/adminRoutes'; 
import taskRoutes from './routes/taskRoutes';
import eventRoutes from './routes/eventRoutes';
import requestRoutes from './routes/requestRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import { announcementRouter } from './routes/announcementRoutes';
import { analyticsRouter } from './routes/analyticsRoutes';
dotenv.config();

const app = express(); // <--- THIS LINE IS MISSING IN YOUR FILE

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes); // Now 'app' will be recognized!
app.use('/api/admin', adminRoutes); // Admin routes
app.use('/api/tasks', taskRoutes); // Task routes
app.use('/api/events', eventRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/feedback', feedbackRoutes); // Feedback routes
app.use('/api/announcements', announcementRouter);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/analytics', analyticsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
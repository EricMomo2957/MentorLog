import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import attendanceRoutes from './routes/attendanceRoutes'; // Import your new routes
import adminRoutes from './routes/adminRoutes'; // Import admin routes
import taskRoutes from './routes/taskRoutes';

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
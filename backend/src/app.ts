import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import attendanceRoutes from './routes/attendanceRoutes'; // Import your new routes

dotenv.config();

const app = express(); // <--- THIS LINE IS MISSING IN YOUR FILE

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes); // Now 'app' will be recognized!

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


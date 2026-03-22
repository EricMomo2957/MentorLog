import { Router } from 'express';
import { toggleAttendance, getAllAttendance, getWeeklyReport } from '../controllers/attendanceController';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

// --- STUDENT ACTIONS ---
// Handles both 'clock-in' and 'clock-out' via req.body.action
router.post('/toggle', verifyToken, toggleAttendance);

// Fetches the logged-in student's personal history
router.get('/history', verifyToken, getAllAttendance);


// --- ADMIN ACTIONS ---
router.get('/all', verifyToken, getAllAttendance);
router.get('/weekly-report', verifyToken, getWeeklyReport);

export default router;
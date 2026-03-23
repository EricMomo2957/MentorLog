import { Router } from 'express';
import { 
    toggleAttendance, 
    getAllAttendance, 
    getWeeklyReport, 
    getMyAttendanceHistory // Make sure this is exported in your controller
} from '../controllers/attendanceController';
import { protect } from '../middleware/authMiddleware'; 

const router = Router();

// --- STUDENT ACTIONS ---
// Use 'protect' consistently if that is what your middleware exports
router.post('/toggle', protect, toggleAttendance);

// Use the specific student history function we created to fix the "No records found" issue
router.get('/history', protect, getMyAttendanceHistory);

// --- ADMIN ACTIONS ---
router.get('/all', protect, getAllAttendance);
router.get('/weekly-report', protect, getWeeklyReport);

export default router;
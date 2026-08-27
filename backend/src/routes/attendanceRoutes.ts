import { Router } from 'express';
import { 
    toggleAttendance, 
    getAllAttendance, 
    getWeeklyReport, 
    getMyAttendanceHistory,
    manualAttendanceLog,
    bulkApproveAttendance
} from '../controllers/attendanceController';
import { protect } from '../middleware/authMiddleware'; 
import { addManualLog } from '../controllers/attendanceController';

const router = Router();

// --- STUDENT ACTIONS ---
router.post('/toggle', protect, toggleAttendance);
router.get('/history', protect, getMyAttendanceHistory);

// --- ADMIN ACTIONS ---
router.get('/all', protect, getAllAttendance);
router.get('/weekly-report', protect, getWeeklyReport);
router.post('/manual-log', protect, addManualLog);
router.post('/bulk-approve', protect, bulkApproveAttendance);

export default router;
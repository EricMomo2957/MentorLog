import { Router } from 'express';
import { toggleAttendance, getAllAttendance, getWeeklyReport } from '../controllers/attendanceController';


const router = Router();

// This creates the /api/attendance/toggle endpoint
router.post('/toggle', toggleAttendance);

// Admin action: Get all logs
router.get('/all', getAllAttendance);
router.get('/weekly-report', getWeeklyReport);

export default router;
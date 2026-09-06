/**
 * ============================================================================
 * MentorLog - Attendance Routes & Approval Pipeline
 * ============================================================================
 * Handles:
 *  1. Student live clock-in / clock-out & automatic lunch break deduction.
 *  2. Student manual attendance request submission ('Pending' status).
 *  3. Admin & Mentor approval / rejection workflows with audit logging.
 *  4. DTR history and weekly OJT hour calculations.
 * ============================================================================
 */
import { Router } from 'express';
import { 
    toggleAttendance, 
    getAllAttendance, 
    getWeeklyReport, 
    getMyAttendanceHistory,
    manualAttendanceLog,
    bulkApproveAttendance,
    requestManualAttendance,
    approveAttendance,
    rejectAttendance,
    addManualLog
} from '../controllers/attendanceController';
import { protect } from '../middleware/authMiddleware'; 

const router = Router();

// --- STUDENT ACTIONS ---
// Live clock-in / clock-out (Automatically 'Approved', applies 1-hour lunch break deduction for shifts >= 5.0 hrs)
router.post('/toggle', protect, toggleAttendance);

// Student's personal attendance history logs (includes approval_status and admin_remarks)
router.get('/history', protect, getMyAttendanceHistory);

// Student submits a manual log request (Enters 'Pending' approval queue)
router.post('/request-manual', protect, requestManualAttendance);

// --- ADMIN / MENTOR ACTIONS ---
// Fetch all attendance logs across all students (filtered by date/student/approval_status)
router.get('/all', protect, getAllAttendance);

// OJT Progress & accumulated hours calculation (counts only 'Approved' records)
router.get('/weekly-report', protect, getWeeklyReport);

// Direct admin manual entry (pre-approved)
router.post('/manual-log', protect, addManualLog);

// Bulk approve attendance records
router.post('/bulk-approve', protect, bulkApproveAttendance);

// Approve a specific pending student manual attendance request
router.put('/:id/approve', protect, approveAttendance);

// Reject a specific pending student manual attendance request with reason remarks
router.put('/:id/reject', protect, rejectAttendance);

export default router;
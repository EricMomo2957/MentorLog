import express from 'express';
import { 
    getStudentSummary, 
    getAllStudents, 
    updateStudent, 
    deleteStudent,
    getAllUsers, 
    adminOnly,
    getAuditLogs,        // Added for the Audit Log page
    updateAdminProfile   // Added for the Profile page
} from '../controllers/adminController';
import { protect } from '../middleware/authMiddleware';
// If you use requestController elsewhere, keep it; otherwise, focus on adminController imports

const router = express.Router();

/**
 * --- SYSTEM SECURITY & LOGGING ---
 */
// GET: http://localhost:5000/api/admin/audit-logs
router.get('/audit-logs', protect, adminOnly, getAuditLogs);


/**
 * --- ADMIN DASHBOARD & PROFILE ---
 */
// GET: http://localhost:5000/api/admin/users/all
router.get('/users/all', protect, adminOnly, getAllUsers);

// GET: http://localhost:5000/api/admin/summary
router.get('/summary', protect, adminOnly, getStudentSummary);

// PUT: http://localhost:5000/api/admin/profile/:id
router.put('/profile/:id', protect, adminOnly, updateAdminProfile);


/**
 * --- STUDENT MANAGEMENT (CRUD) ---
 */
// GET: http://localhost:5000/api/admin/students
router.get('/students', protect, adminOnly, getAllStudents);

// PUT: http://localhost:5000/api/admin/students/:id
router.put('/students/:id', protect, adminOnly, updateStudent);

// DELETE: http://localhost:5000/api/admin/students/:id
router.delete('/students/:id', protect, adminOnly, deleteStudent);

export default router;
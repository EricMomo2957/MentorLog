import express from 'express';
import { 
    getStudentSummary, 
    getAllStudents, 
    updateStudent, 
    deleteStudent,
    getAllUsers, 
    adminOnly,
    getAuditLogs,
    updateAdminProfile 
} from '../controllers/adminController';

// Note: Ensure the function names match your adminCodeController.ts
import { 
    getAdminCodes, 
    createAdminCode, // If you renamed this to generateAdminCode in the controller, update it here
    deleteAdminCode 
} from '../controllers/adminCodeController';

import { protect } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * --- SYSTEM SECURITY & LOGGING ---
 */
router.get('/audit-logs', protect, adminOnly, getAuditLogs);

/**
 * --- ADMIN DASHBOARD & PROFILE ---
 */
router.get('/users/all', protect, adminOnly, getAllUsers);
router.get('/summary', protect, adminOnly, getStudentSummary);
router.put('/profile/:id', protect, adminOnly, updateAdminProfile);

/**
 * --- STUDENT MANAGEMENT (CRUD) ---
 */
router.get('/students', protect, adminOnly, getAllStudents);
router.put('/students/:id', protect, adminOnly, updateStudent);
router.delete('/students/:id', protect, adminOnly, deleteStudent);

/**
 * --- ADMIN REGISTRATION CODES ---
 * Synchronized with frontend calls: http://localhost:5000/api/admin/admin-codes
 */
router.get('/admin-codes', protect, adminOnly, getAdminCodes);
router.post('/admin-codes', protect, adminOnly, createAdminCode);
router.delete('/admin-codes/:id', protect, adminOnly, deleteAdminCode);

export default router;
import express from 'express';
import { 
    getStudentSummary, 
    getAllStudents, 
    updateStudent, 
    deleteStudent,
    getAllUsers, // 1. Added this import
    adminOnly 
} from '../controllers/adminController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * ADMIN DASHBOARD & REPORTING
 */

// GET: http://localhost:5000/api/admin/users/all
// This matches your AdminDashboard.tsx fetch call
router.get('/users/all', protect, adminOnly, getAllUsers);

// GET: http://localhost:5000/api/admin/summary
router.get('/summary', protect, adminOnly, getStudentSummary);

/**
 * STUDENT MANAGEMENT (CRUD)
 */
// GET: http://localhost:5000/api/admin/students
router.get('/students', protect, adminOnly, getAllStudents);

// PUT: http://localhost:5000/api/admin/students/:id
router.put('/students/:id', protect, adminOnly, updateStudent);

// DELETE: http://localhost:5000/api/admin/students/:id
router.delete('/students/:id', protect, adminOnly, deleteStudent);

export default router;
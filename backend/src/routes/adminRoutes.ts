import express from 'express';
import { adminOnly, getAllUsers } from '../controllers/adminController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// This MUST match the URL: http://localhost:5000/api/users/all
router.get('/users/all', protect, adminOnly, getAllUsers);

export default router;
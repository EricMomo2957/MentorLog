import express from 'express';
import { getAllFeedbacks, submitFeedback } from '../controllers/feedbackController';
import { verifyToken, adminOnly } from '../middleware/authMiddleware'; // Using your existing auth logic

const router = express.Router();

// Admin only route
router.get('/all', verifyToken, adminOnly, getAllFeedbacks);

// Student route
router.post('/submit', verifyToken, submitFeedback);

export default router;
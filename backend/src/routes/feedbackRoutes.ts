import { Router } from 'express';
import { submitFeedback, getAllFeedback, deleteFeedback } from '../controllers/feedbackController';
import { protect, adminOnly, studentOnly } from '../middleware/authMiddleware';

const router = Router();

// Student: Submit feedback
router.post('/submit', protect, studentOnly, submitFeedback);

// Admin: Manage all feedback
router.get('/all', protect, adminOnly, getAllFeedback);
router.delete('/:id', protect, adminOnly, deleteFeedback);

export default router;
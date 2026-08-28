import { Router } from 'express';
import { 
    submitFeedback, 
    getMyFeedback, 
    updateFeedback, 
    deleteMyFeedback, 
    getAllFeedback, 
    deleteFeedback 
} from '../controllers/feedbackController';
import { protect, adminOnly, studentOnly } from '../middleware/authMiddleware';

const router = Router();

// Student: Submit feedback & Manage own feedback history
router.post('/submit', protect, studentOnly, submitFeedback);
router.get('/my-feedback', protect, studentOnly, getMyFeedback);
router.put('/update/:id', protect, studentOnly, updateFeedback);
router.delete('/my/:id', protect, studentOnly, deleteMyFeedback);

// Admin: Manage all feedback entries
router.get('/all', protect, adminOnly, getAllFeedback);
router.delete('/:id', protect, adminOnly, deleteFeedback);

export default router;
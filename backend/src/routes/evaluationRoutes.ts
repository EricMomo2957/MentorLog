import { Router } from 'express';
import { 
    submitEvaluation, 
    getMyEvaluations, 
    getStudentEvaluations, 
    getAllEvaluations 
} from '../controllers/evaluationController';
import { protect, adminOnly, studentOnly } from '../middleware/authMiddleware';

const router = Router();

// Student: View own evaluation scorecards
router.get('/my-evaluations', protect, studentOnly, getMyEvaluations);

// Admin: Submit/Update evaluation, view specific or all evaluations
router.post('/submit', protect, adminOnly, submitEvaluation);
router.get('/student/:studentId', protect, adminOnly, getStudentEvaluations);
router.get('/all', protect, adminOnly, getAllEvaluations);

export default router;

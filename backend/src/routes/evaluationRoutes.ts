import { Router } from 'express';
import { 
    submitEvaluation, 
    getMyEvaluations, 
    getStudentEvaluations, 
    getAllEvaluations,
    getFinalGradeSummary
} from '../controllers/evaluationController';
import { protect, adminOnly, studentOnly } from '../middleware/authMiddleware';

const router = Router();

// Student: View own evaluation scorecards and final grade computation
router.get('/my-evaluations', protect, studentOnly, getMyEvaluations);
router.get('/my-grade-summary', protect, studentOnly, getFinalGradeSummary);

// Admin: Submit/Update evaluation, view specific or all evaluations & grade sheets
router.post('/submit', protect, adminOnly, submitEvaluation);
router.get('/student/:studentId', protect, adminOnly, getStudentEvaluations);
router.get('/grade-summary/:studentId', protect, adminOnly, getFinalGradeSummary);
router.get('/all', protect, adminOnly, getAllEvaluations);

export default router;

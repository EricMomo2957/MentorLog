import express from 'express';
import { 
    getInternsProgress, 
    getIndividualInternLogs 
} from '../controllers/progressTrackingController';
// import { verifyAdmin } from '../middleware/authMiddleware'; 

const router = express.Router();

// Get overall progress for all interns (Admin view)
router.get('/intern-progress', getInternsProgress);

// Get detailed logs for a specific intern
router.get('/intern-logs/:studentId', getIndividualInternLogs);


export default router;
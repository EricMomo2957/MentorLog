import { Router } from 'express';
import { 
    submitTask, 
    getMyTasks, 
    getAllTasks, 
    getTasks 
} from '../controllers/taskController';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

/**
 * Middleware: verifyToken
 * This ensures every request hitting the routes below 
 * has a valid JWT, populating req.user.id.
 */
router.use(verifyToken);

// --- Student Routes ---

// Submit a new task report (POST /api/tasks/submit)
router.post('/submit', submitTask);

// Fetch tasks for the logged-in student (GET /api/tasks/my-tasks)
router.get('/my-tasks', getMyTasks);

// --- Admin/Mentor Routes ---

// Fetch all task logs across all students (GET /api/tasks/all)
router.get('/all', getAllTasks);

// --- General/Utility ---

// General task fetch (GET /api/tasks/)
router.get('/', getTasks);

export default router;
import { Router } from 'express';
import { 
    submitTask, 
    getMyTasks, 
    getAllTasks, 
    getTasks,
    assignTask,
    updateTask,
    updateTaskStatus,
    deleteTask
} from '../controllers/taskController';
import { verifyToken, adminOnly } from '../middleware/authMiddleware';

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

// Update status of a task (PUT /api/tasks/status or PUT /api/tasks/:id/status)
router.put('/status', updateTaskStatus);
router.put('/:id/status', updateTaskStatus);

// --- Admin/Mentor Routes ---

// Assign task to a student (POST /api/tasks/assign)
router.post('/assign', adminOnly, assignTask);

// Fetch all task logs across all students (GET /api/tasks/all)
router.get('/all', adminOnly, getAllTasks);

// Update a task (PUT /api/tasks/:id)
router.put('/:id', adminOnly, updateTask);

// Delete a task (DELETE /api/tasks/:id)
router.delete('/:id', adminOnly, deleteTask);

// --- General/Utility ---

// General task fetch (GET /api/tasks/)
router.get('/', getTasks);

export default router;
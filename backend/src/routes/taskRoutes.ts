import express from 'express';
import { submitTask, getMyTasks } from '../controllers/taskController';
import { verifyToken } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/submit', verifyToken, submitTask);
router.get('/my-tasks', verifyToken, getMyTasks);

export default router;
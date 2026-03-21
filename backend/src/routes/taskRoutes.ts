import express from 'express';
import { submitTask, getMyTasks, getAllTasks } from '../controllers/taskController';
import { verifyToken } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/submit', verifyToken, submitTask);
router.get('/my-tasks', verifyToken, getMyTasks);
router.get('/all', verifyToken, getAllTasks); // New Admin Route

export default router;
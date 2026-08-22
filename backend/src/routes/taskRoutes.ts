import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
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

// Multer Storage Configuration for Task Attachments (Photos & Documents)
const storage = multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {
        const uploadPath = './uploads/tasks/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req: any, file: any, cb: any) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit for docs and images
});

/**
 * Middleware: verifyToken
 * Ensures every request has a valid JWT, populating req.user.id.
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

// Assign task to a student with optional attachment (POST /api/tasks/assign)
router.post('/assign', adminOnly, upload.single('attachment'), assignTask);

// Fetch all task logs across all students (GET /api/tasks/all)
router.get('/all', adminOnly, getAllTasks);

// Update a task with optional new attachment (PUT /api/tasks/:id)
router.put('/:id', adminOnly, upload.single('attachment'), updateTask);

// Delete a task (DELETE /api/tasks/:id)
router.delete('/:id', adminOnly, deleteTask);

// --- General/Utility ---

// General task fetch (GET /api/tasks/)
router.get('/', getTasks);

export default router;
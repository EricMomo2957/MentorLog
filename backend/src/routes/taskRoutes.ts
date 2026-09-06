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
    deleteTask,
    verifyTaskDeliverable
} from '../controllers/taskController';
import { verifyToken, adminOnly } from '../middleware/authMiddleware';

const router = Router();

// Multer Storage Configuration for Task Attachments & Deliverable Proofs
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

const ALLOWED_TASK_MIME_TYPES = [
    'image/jpeg', 'image/png', 'image/webp',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'application/zip', 'application/x-zip-compressed'
];

const fileFilter = (_req: any, file: any, cb: any) => {
    const allowedExts = /jpeg|jpg|png|webp|pdf|doc|docx|txt|zip/;
    const isExtValid = allowedExts.test(path.extname(file.originalname).toLowerCase());
    const isMimeValid = ALLOWED_TASK_MIME_TYPES.includes(file.mimetype);

    if (isExtValid && isMimeValid) {
        cb(null, true);
    } else {
        cb(new Error('Security Block: Invalid file type for task attachment. Only images, documents, and ZIP archives are allowed.'));
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
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

// Update status and attach deliverable proof (PUT /api/tasks/status or PUT /api/tasks/:id/status)
router.put('/status', upload.single('proof_file'), updateTaskStatus);
router.put('/:id/status', upload.single('proof_file'), updateTaskStatus);

// --- Admin/Mentor Routes ---

// Verify student task deliverable (PUT /api/tasks/:id/verify)
router.put('/:id/verify', adminOnly, verifyTaskDeliverable);

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
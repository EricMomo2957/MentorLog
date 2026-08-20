import express from 'express';
import multer from 'multer';
import path from 'path';
import { 
    submitDocument, 
    getAllSubmissions, 
    updateSubmissionStatus,
    editDocument,     
    deleteDocument    
} from '../controllers/documentSubmissionController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// 1. Configure storage to keep original file extensions
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB Limit
});

// 2. Routes (Protected with authentication)
router.post('/submit', protect, upload.single('document'), submitDocument);
router.get('/all', protect, getAllSubmissions);
router.put('/update/:id', protect, updateSubmissionStatus);
router.put('/edit/:id', protect, editDocument);
router.delete('/delete/:id', protect, deleteDocument);

export default router;
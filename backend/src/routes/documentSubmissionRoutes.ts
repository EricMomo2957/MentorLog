import express from 'express';
import multer from 'multer';
import path from 'path';
import { 
    submitDocument, 
    getAllSubmissions, 
    updateSubmissionStatus,
    editDocument,     // Added
    deleteDocument    // Added
} from '../controllers/documentSubmissionController';

const router = express.Router();

// 1. Configure storage to keep original file extensions
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Creates a unique filename: timestamp-originalName
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit
});

// 2. Routes

// Endpoint: POST /api/documents/submit
router.post('/submit', upload.single('document'), submitDocument);

// Endpoint: GET /api/documents/all
router.get('/all', getAllSubmissions);

// Endpoint: PUT /api/documents/update/:id
// Primarily used for Admin Approval/Rejection and Feedback
router.put('/update/:id', updateSubmissionStatus);

// Endpoint: PUT /api/documents/edit/:id
// NEW: Used to modify document metadata (like the type)
router.put('/edit/:id', editDocument);

// Endpoint: DELETE /api/documents/delete/:id
// NEW: Removes the database record and the physical file from /uploads
router.delete('/delete/:id', deleteDocument);

export default router;
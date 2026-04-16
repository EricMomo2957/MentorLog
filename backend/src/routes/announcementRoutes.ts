// src/routes/announcementRoutes.ts
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { 
    createAnnouncement, 
    getAnnouncements, 
    deleteAnnouncement,
    updateAnnouncement // Added this import
} from '../controllers/announcementController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = Router();

/**
 * 1. MULTER CONFIGURATION
 */
const storage = multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {
        const uploadPath = './uploads/announcements/';
        
        // Automatically create the folder if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req: any, file: any, cb: any) => {
        // Creates a unique filename: timestamp-originalName.jpg
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// File filter to ensure only images are uploaded
const fileFilter = (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

/**
 * 2. ROUTES
 */

// POST: Admin creates announcement
router.post(
    '/create', 
    protect, 
    adminOnly, 
    upload.single('image'), 
    createAnnouncement
);

// GET: All users (Students & Admins) see the news
router.get('/all', getAnnouncements);

// PUT: Admin updates an existing announcement (handles text and optional new image)
router.put(
    '/update/:id', 
    protect, 
    adminOnly, 
    upload.single('image'), 
    updateAnnouncement
);

// DELETE: Admin removes an announcement
router.delete('/delete/:id', protect, adminOnly, deleteAnnouncement);

// Using Named Export
export const announcementRouter = router;
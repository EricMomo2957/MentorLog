import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { login, register, forgotPassword, getProfile, updateProfile } from '../controllers/authController';    
import { 
    getForgotPasswordRequests, 
    resolvePasswordRequest 
} from '../controllers/forgotPasswordController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Ensure profile uploads directory exists
const uploadsDir = path.resolve(__dirname, '../../uploads/profiles');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const profileStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadProfile = multer({ 
    storage: profileStorage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// ==========================================
// STUDENT / PUBLIC ROUTES
// ==========================================

router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);

// GET & PUT profile with optional image upload
router.get('/profile', protect, getProfile);
router.put('/profile', protect, uploadProfile.single('profile_pic'), updateProfile);

// ==========================================
// ADMIN MANAGEMENT ROUTES
// ==========================================

router.get('/forgot-password-requests', getForgotPasswordRequests);
router.put('/resolve-password/:id', resolvePasswordRequest);

export default router;
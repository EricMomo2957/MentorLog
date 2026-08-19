import express from 'express';
import { login, register, forgotPassword, getProfile, updateProfile } from '../controllers/authController';    
import { 
    getForgotPasswordRequests, 
    resolvePasswordRequest 
} from '../controllers/forgotPasswordController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// ==========================================
// STUDENT / PUBLIC ROUTES
// ==========================================

// POST: http://localhost:5000/api/auth/login
router.post('/login', login);

// POST: http://localhost:5000/api/auth/register
router.post('/register', register);

// POST: http://localhost:5000/api/auth/forgot-password
// This is the one that inserts the request into the database
router.post('/forgot-password', forgotPassword);

// GET & PUT profile
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);


// ==========================================
// ADMIN MANAGEMENT ROUTES
// ==========================================

// GET: http://localhost:5000/api/auth/forgot-password-requests
// This fetches the list for your ManageForgotPassword.tsx table
router.get('/forgot-password-requests', getForgotPasswordRequests);

// PUT: http://localhost:5000/api/auth/resolve-password/:id
// This updates the status from 'pending' to 'resolved'
router.put('/resolve-password/:id', resolvePasswordRequest);

export default router;
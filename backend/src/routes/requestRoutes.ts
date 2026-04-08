import { Router } from 'express';
import { 
    getAllRequests, 
    updateRequestStatus, 
    submitRequest 
} from '../controllers/requestController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = Router();

/**
 * @route   POST /api/requests/submit
 * @desc    Student submits a new service request
 * @access  Private (Student)
 */
router.post('/submit', protect, submitRequest);

/**
 * @route   GET /api/requests/all
 * @desc    Admin fetches all requests
 * @access  Private (Admin Only)
 */
router.get('/all', protect, adminOnly, getAllRequests);

/**
 * @route   PATCH /api/requests/:id/status
 * @desc    Admin updates status of a request
 * @access  Private (Admin Only)
 */
router.patch('/:id/status', protect, adminOnly, updateRequestStatus);

export default router;